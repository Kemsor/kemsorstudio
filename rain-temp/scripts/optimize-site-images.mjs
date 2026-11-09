import {readdir,mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {resolve,relative,extname,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const root=resolve(import.meta.dirname,'..');
const publicDir=resolve(root,'public');
const destination=resolve(publicDir,'assets/optimized');
const widths=[480,800,1280,1600];
async function walk(dir){
 const files=[];
 for(const entry of await readdir(dir,{withFileTypes:true})){
  if(entry.name==='optimized')continue;
  const path=resolve(dir,entry.name);
  if(entry.isDirectory())files.push(...await walk(path));
  else if(/\.(webp|jpe?g|png|avif)$/i.test(path))files.push(path);
 }
 return files;
}
const families=new Map();
for(const file of await walk(resolve(publicDir,'assets'))){
 if(/logo|icon|favicon/i.test(file))continue;
 const family=file.replace(/-(640|960|1600)(?=\.)/,'').replace(/\.(webp|jpe?g|png|avif)$/i,'');
 if(!families.has(family))families.set(family,[]);
 families.get(family).push(file);
}
await mkdir(destination,{recursive:true});
const manifest={};
const queue=[...families.values()];
let familiesDone=0,baseline=0,optimized=0,mobile=0,existingLargest=0,existingSmallest=0;
async function worker(){
 while(queue.length){
  const files=queue.shift();
  const candidates=await Promise.all(files.map(async file=>({file,...await sharp(file).metadata(),bytes:(await stat(file)).size})));
  const source=candidates.sort((a,b)=>b.width-a.width||b.bytes-a.bytes)[0];
  if(source.width<640||source.pages>1||source.bytes<40000)continue;
  const input=await readFile(source.file);
  const hash=createHash('sha256').update(input).update('webp-76-effort5-v1').digest('hex').slice(0,16);
  const sizes=[...new Set([...widths.filter(width=>width<source.width),Math.min(source.width,1600)])].sort((a,b)=>a-b);
  const variants=[];
  for(const width of sizes){
   const filename=`${hash}-${width}.webp`,target=resolve(destination,filename);
   try{await stat(target);}catch{await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:76,effort:5}).toFile(target);}
   variants.push({width,url:`/assets/optimized/${filename}`,bytes:(await stat(target)).size});
  }
  const fallback=variants.find(item=>item.width>=800)||variants.at(-1);
  const entry={src:fallback.url,srcSet:variants.map(item=>`${item.url} ${item.width}w`).join(', '),width:Math.min(source.width,1600),height:Math.round(source.height*Math.min(source.width,1600)/source.width)};
  for(const file of files)manifest['/'+relative(publicDir,file).split('\\').join('/')]=entry;
  existingLargest+=(candidates.find(item=>/-1600\./.test(item.file))||source).bytes;
  existingSmallest+=[...candidates].sort((a,b)=>a.width-b.width||a.bytes-b.bytes)[0].bytes;
  baseline+=source.bytes;optimized+=variants.at(-1).bytes;mobile+=variants[0].bytes;familiesDone++;
 }
}
await Promise.all([worker(),worker()]);
const manifestPath=resolve(root,'src/optimized-images.json');
await mkdir(dirname(manifestPath),{recursive:true});
await writeFile(manifestPath,JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()),null,2)+'\n');
const report={families:familiesDone,mappedUrls:Object.keys(manifest).length,sourceBytes:baseline,existingLargestBytes:existingLargest,largestVariantBytes:optimized,existingSmallestBytes:existingSmallest,mobileVariantBytes:mobile,largestReductionPercent:Math.round(1000*(1-optimized/existingLargest))/10,smallestReductionPercent:Math.round(1000*(1-mobile/existingSmallest))/10};
await mkdir(resolve(root,'../output/image-optimization'),{recursive:true});
await writeFile(resolve(root,'../output/image-optimization/report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
