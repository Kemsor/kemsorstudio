import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const websiteDirectory=fileURLToPath(new URL('../../rain-temp/dist/',import.meta.url));

// Hosting the built website beside the API keeps cookies, uploads and CSRF on one origin.
export function website(directory=websiteDirectory) {
  if(!existsSync(path.join(directory,'index.html')))return (req,res,next)=>next();
  const files=express.static(directory,{dotfiles:'deny',setHeaders(res,file){
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    res.setHeader('Cache-Control',file.endsWith('.html')?'no-cache':'public, max-age=604800');
  }});
  return (req,res,next)=>{
    if(/^\/(?:api|admin|media|health)(?:\/|$)/.test(req.path))return next();
    return files(req,res,next);
  };
}

// Run after API, CMS and public-file routes so missing assets never receive HTML.
export function websiteNotFound(directory=websiteDirectory){
 const page=path.join(directory,'404.html');
 return (req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method)||/^\/(?:api|admin|media|health|assets)(?:\/|$)/.test(req.path)||!req.accepts('html')||!existsSync(page))return next();
  res.status(404).set({'Cache-Control':'no-cache','X-Robots-Tag':'noindex, follow'}).sendFile(page);
 };
}
