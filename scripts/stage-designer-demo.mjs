import {cp, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../designer-theme/dist/',import.meta.url));
const destination=fileURLToPath(new URL('../rain-temp/dist/demo2/',import.meta.url));
await mkdir(destination,{recursive:true});
await cp(source,destination,{recursive:true});
console.log('Designer preview staged at /demo2/');
