import {createHmac,createHash,randomBytes,createCipheriv,createDecipheriv,timingSafeEqual} from 'node:crypto';
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function newSecret(){let bits='',out='';for(const byte of randomBytes(20))bits+=byte.toString(2).padStart(8,'0');for(let i=0;i<bits.length;i+=5)out+=alphabet[parseInt(bits.slice(i,i+5),2)];return out}
function decode(secret){let bits='';for(const char of secret)bits+=alphabet.indexOf(char).toString(2).padStart(5,'0');return Buffer.from(bits.match(/.{8}/g).map(byte=>parseInt(byte,2)))}
export function totp(secret,step=Math.floor(Date.now()/30000)){const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(step));const hash=createHmac('sha1',decode(secret)).update(counter).digest(),offset=hash[19]&15;return String((hash.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,'0')}
export function validStep(secret,code,last=-1,now=Date.now()){if(!/^\d{6}$/.test(code||''))return null;const current=Math.floor(now/30000);for(const step of [current,current-1,current+1])if(step>Number(last)&&timingSafeEqual(Buffer.from(totp(secret,step)),Buffer.from(code)))return step;return null}
const key=()=>createHash('sha256').update(process.env.SESSION_SECRET).digest();
export function sealSecret(secret){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv);const value=Buffer.concat([cipher.update(secret,'utf8'),cipher.final()]);return [iv,cipher.getAuthTag(),value].map(x=>x.toString('base64')).join('.')}
export function openSecret(value){const [iv,tag,encrypted]=value.split('.').map(x=>Buffer.from(x,'base64'));const cipher=createDecipheriv('aes-256-gcm',key(),iv);cipher.setAuthTag(tag);return Buffer.concat([cipher.update(encrypted),cipher.final()]).toString()}
export const recoveryHash=code=>createHash('sha256').update(code.replace(/[\s-]/g,'').toLowerCase()).digest('hex');
export const newRecoveryCodes=()=>Array.from({length:8},()=>randomBytes(8).toString('hex'));
