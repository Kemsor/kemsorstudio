import sharp from 'sharp';

// Decode, orient and re-encode rather than trusting a browser MIME label.
export async function optimizeImage(file){
 try{
  const image=sharp(file.buffer,{limitInputPixels:100000000,animated:false,failOn:'error'});
  const metadata=await image.metadata();
  if(!['jpeg','png','webp','avif','heif'].includes(metadata.format))throw new Error('unsupported');
  const {data,info}=await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:82,effort:4}).toBuffer({resolveWithObject:true});
  return {...file,buffer:data,size:data.length,mimetype:'image/webp',optimizedWidth:info.width,optimizedHeight:info.height};
 }catch{throw Object.assign(new Error('This image could not be opened. Choose a valid photo or image file and try again.'),{status:422})}
}
