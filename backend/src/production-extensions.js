const fail=message=>{throw Object.assign(new Error(message),{status:422});};
export function productionText(value,max,label,required=false){if(value==null)value='';if(typeof value!=='string')fail(`${label} must be text.`);const result=value.trim();if(result.length>max||(required&&!result))fail(`${label} ${required?'is required and ':''}must be at most ${max} characters.`);return result;}
export function productionUrl(value,label='URL'){const result=productionText(value,1500,label);if(!result)return '';let url;try{url=new URL(result);}catch{}if(url?.protocol!=='https:'||url.username||url.password)fail(`${label} must use HTTPS without embedded credentials.`);return url.href;}
export function productionDate(value,label){const result=productionText(value,10,label,true),date=new Date(`${result}T00:00:00Z`);if(!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(result)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==result)fail(`Choose a valid ${label}.`);return result;}
const choice=(value,values,label)=>{if(!values.includes(value))fail(`Choose a valid ${label}.`);return value;};
const optionalId=value=>{if(value===''||value==null)return null;const id=Number(value);if(!Number.isSafeInteger(id)||id<=0)fail('Choose a valid person profile.');return id;};
export function productionRows(body,key,previous,limit,parse){
 if(!Object.hasOwn(body,key))return previous[key]||[];
 let items;try{items=JSON.parse(productionText(body[key],180000,key)||'[]');}catch{fail(`Invalid ${key} list.`);}
 if(!Array.isArray(items)||items.length>limit)fail(`Use up to ${limit} ${key.replaceAll('_',' ')} records.`);
 return items.map(item=>{if(!item||typeof item!=='object'||Array.isArray(item))fail(`Invalid ${key} record.`);return parse(item);});
}
export function linkedCredits(body,key,previous,crew=false){
 const field=key+'_rows';if(!Object.hasOwn(body,field))return null;
 return productionRows({[key]:body[field]},key,previous,100,item=>({name:productionText(item.name,160,'Credited name',true),role:productionText(item.role,160,'Credit role',crew),...(optionalId(item.person_id)?{person_id:optionalId(item.person_id)}:{})}));
}
export function productionExtensions(body,previous={}){
 const result={};
 for(const [key,max]of [['rights_holder',300],['rights_summary',2000],['rights_territories',500],['rights_notes',5000]])result[key]=Object.hasOwn(body,key)?productionText(body[key],max,key):previous[key]||'';
 result.rights_status=Object.hasOwn(body,'rights_status')?choice(body.rights_status,['','available','partially_available','unavailable','not_announced'],'rights availability'):previous.rights_status||'';
 result.platform_links=productionRows(body,'platform_links',previous,20,item=>({kind:choice(item.kind,['watch','tickets','official','music'],'platform link type'),label:productionText(item.label,160,'Platform label',true),url:productionUrl(item.url,'Platform URL')||fail('Add a platform URL.'),territories:productionText(item.territories,300,'Platform territories')}));
 result.production_media=productionRows(body,'production_media',previous,40,item=>{
  const type=choice(item.type,['poster','trailer','teaser','song','behind_the_scenes'],'media type'),url=productionText(item.url,1500,'Media URL',true);
  if(type==='poster'){if(!/^\/media\/[1-9]\d*$/.test(url))fail('Select an uploaded poster image.');}
  else if(!/^\/media\/[1-9]\d*\/video\.mp4$/.test(url)){const external=productionUrl(url,'Media URL'),pathname=new URL(external).pathname.toLowerCase();if(!pathname.endsWith('.mp4')&&!(type==='song'&&pathname.endsWith('.mp3')))fail('Use an uploaded MP4 or direct HTTPS MP4; songs also support HTTPS MP3.');}
  const captions=productionText(item.captions_url,100,'Subtitle URL');if(captions&&!/^\/media\/[1-9]\d*\/captions\.vtt$/.test(captions))fail('Choose uploaded WebVTT subtitles.');
  const language=productionText(item.language,20,'Subtitle language')||'en';if(!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(language))fail('Use a valid subtitle language code.');
  return {type,title:productionText(item.title,200,'Media title',true),url,alt:productionText(item.alt,300,'Poster alt text',type==='poster'),captions_url:captions,language};
 });
 result.awards=productionRows(body,'awards',previous,60,item=>{const year=productionText(item.year,4,'Award year',true);if(!/^[1-9]\d{3}$/.test(year))fail('Choose a four-digit award year.');return {event:productionText(item.event,200,'Award / festival',true),category:productionText(item.category,200,'Category'),outcome:choice(item.outcome,['winner','nominee','official_selection'],'award outcome'),year,recipient:productionText(item.recipient,300,'Recipient'),source_url:productionUrl(item.source_url,'Award source')};});
 result.screenings=productionRows(body,'screenings',previous,60,item=>({type:choice(item.type,['premiere','festival','screening'],'screening type'),event:productionText(item.event,200,'Screening event',true),date:productionDate(item.date,'screening date'),venue:productionText(item.venue,200,'Venue'),city:productionText(item.city,100,'City'),country:productionText(item.country,100,'Country'),notes:productionText(item.notes,500,'Screening notes'),source_url:productionUrl(item.source_url,'Screening source')}));
 return result;
}
