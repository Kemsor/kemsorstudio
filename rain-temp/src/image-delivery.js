// Only known bundled images are rewritten. CMS uploads and external URLs stay intact.
export function optimizedImage(src,manifest,base='/'){
 if(typeof src!=='string'||/[?#]/.test(src)||!src.startsWith('/')||src.startsWith('//'))return null;
 const path=base!=='/'&&src.startsWith(base)?'/'+src.slice(base.length):src;
 const image=manifest[path];
 if(!image)return null;
 const prefix=url=>base==='/'?url:base+url.slice(1);
 return {...image,src:prefix(image.src),srcSet:image.srcSet.split(', ').map(candidate=>{
  const [url,width]=candidate.split(' ');return `${prefix(url)} ${width}`;
 }).join(', ')};
}
