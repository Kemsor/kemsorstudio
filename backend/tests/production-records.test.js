import {test} from 'node:test';
import assert from 'node:assert/strict';
import {productionMetadata,publicProductionMetadata} from '../src/production-records.js';
const base={production_stage:'in_development',format:'Feature film',year:'2028',language:'Hindi, English, Hindi',genres:'Drama, Thriller, Drama',working_title:'Private project',release_date:'2028-02-29'};
test('Production records normalize multiple genres and languages and accept leap-day releases',()=>{
 const record=productionMetadata(base);
 assert.deepEqual(record.genres,['Drama','Thriller']);assert.deepEqual(record.languages,['Hindi','English']);assert.equal(record.language,'Hindi, English');assert.equal(record.release_date,'2028-02-29');
});
test('Production validation rejects impossible dates, invalid stages and non-text fields',()=>{
 for(const release_date of ['2026-02-29','2026-04-31','2026-13-01','2026-01-32','tomorrow'])assert.throws(()=>productionMetadata({...base,release_date}),{status:422});
 assert.throws(()=>productionMetadata({...base,production_stage:'unknown'}),{status:422});assert.throws(()=>productionMetadata({...base,year:'20x6'}),{status:422});assert.throws(()=>productionMetadata({...base,working_title:['injected']}),{status:422});assert.throws(()=>productionMetadata({...base,genres:'x'.repeat(81)}),{status:422});
});
test('Older edits preserve new fields; explicit empty fields clear them; working titles never publish',()=>{
 const old=productionMetadata(base);
 const record=productionMetadata({production_stage:'in_production',format:'Feature film',language:'Hindi',year:'2028'},old);
 assert.equal(record.working_title,'Private project');assert.deepEqual(record.genres,['Drama','Thriller']);assert.equal(record.release_date,'2028-02-29');
 assert.equal(productionMetadata({...base,working_title:'',release_date:'',genres:''},old).release_date,'');
 const visible=publicProductionMetadata(record);assert.equal(visible.working_title,undefined);assert.equal(visible.production_stage,'in_production');assert.equal(record.working_title,'Private project');
});
test('Credits preserve billing order, support optional cast characters and clear or retain earlier credits',()=>{
 const record=productionMetadata({...base,cast_credits:' First actor | Lead\r\n\nSecond actor\n First actor | Another role ',crew_credits:'Someone | Director\nOther person | Cinematographer'});
 assert.deepEqual(record.cast_credits,[{name:'First actor',role:'Lead'},{name:'Second actor',role:''},{name:'First actor',role:'Another role'}]);
 assert.equal(record.crew_credits[1].role,'Cinematographer');assert.deepEqual(productionMetadata(base,record).cast_credits,record.cast_credits);
 assert.deepEqual(productionMetadata({...base,cast_credits:'',crew_credits:''},record).crew_credits,[]);
 for(const value of ['| Actor','Name | Role | Extra','a'.repeat(161),Array(101).fill('Name').join('\n')])assert.throws(()=>productionMetadata({...base,cast_credits:value}),{status:422});
 assert.throws(()=>productionMetadata({...base,crew_credits:'Name only'}),{status:422});assert.throws(()=>productionMetadata({...base,cast_credits:['bad']}),{status:422});
});
test('Production galleries validate ordering, image IDs, alt text, types and size limits',()=>{
 const items=[{media_id:2,kind:'behind_the_scenes',alt:' Crew on set ',caption:' First day '},{media_id:1,kind:'still',alt:'Scene at sunset',caption:''}];
 const result=productionMetadata({...base,gallery:JSON.stringify(items)});
 assert.deepEqual(result.gallery,[{...items[0],alt:'Crew on set',caption:'First day'},items[1]]);
 assert.deepEqual(productionMetadata(base,result).gallery,result.gallery);assert.deepEqual(productionMetadata({...base,gallery:'[]'},result).gallery,[]);
 for(const gallery of ['bad','{}',JSON.stringify([...items,items[0]]),JSON.stringify([{...items[0],alt:''}]),JSON.stringify([{...items[0],kind:'invalid'}]),JSON.stringify([{...items[0],media_id:-1}]),JSON.stringify(Array.from({length:25},(_,i)=>({...items[0],media_id:i+1})))])assert.throws(()=>productionMetadata({...base,gallery}),{status:422});
});
test('Press kits accept uploaded PDF references, preserve omitted fields and allow removal',()=>{
 const record=productionMetadata({...base,epk_url:'/media/42/document.pdf'});assert.equal(record.epk_url,'/media/42/document.pdf');assert.equal(productionMetadata(base,record).epk_url,record.epk_url);assert.equal(productionMetadata({...base,epk_url:''},record).epk_url,'');
 for(const epk_url of ['https://example.com/kit.pdf','javascript:alert(1)','/media/42','/media/0/document.pdf','/media/42/document.pdf?other=1',[]])assert.throws(()=>productionMetadata({...base,epk_url}),{status:422});
});
test('Extended productions validate rights, linked credits, typed media and event records',()=>{
 const input={...base,rights_holder:'Studio',rights_notes:'CONFIDENTIAL DEAL',rights_status:'available',platform_links:JSON.stringify([{kind:'watch',label:'Watch now',url:'https://example.test/watch',territories:'India'}]),cast_credits_rows:JSON.stringify([{name:'Actor',role:'Lead',person_id:'42'}]),contributor_credits_rows:JSON.stringify([{name:'Consultant',role:'Research'}]),production_media:JSON.stringify([{type:'poster',title:'Official poster',url:'/media/1',alt:'Cast on a mountain'},{type:'song',title:'Theme',url:'https://example.test/theme.mp3'}]),awards:JSON.stringify([{event:'Festival',year:'2028',outcome:'official_selection',source_url:'https://example.test/festival'}]),screenings:JSON.stringify([{type:'premiere',event:'World premiere',date:'2028-02-29',venue:'Theatre'}])};
 const result=productionMetadata(input);assert.equal(result.cast_credits[0].person_id,42);assert.equal(result.contributor_credits[0].role,'Research');assert.equal(result.production_media[1].type,'song');assert.equal(publicProductionMetadata(result).rights_notes,undefined);assert.equal(result.rights_notes,'CONFIDENTIAL DEAL');
 const legacy=productionMetadata(base,result);for(const key of ['platform_links','production_media','awards','screenings'])assert.deepEqual(legacy[key],result[key]);assert.deepEqual(productionMetadata({...base,awards:'[]'},result).awards,[]);
 for(const patch of [{platform_links:'{}'},{platform_links:JSON.stringify([{kind:'watch',label:'Bad',url:'javascript:alert(1)'}])},{rights_status:'other'},{production_media:JSON.stringify([{type:'poster',title:'Poster',url:'/media/1'}])},{production_media:JSON.stringify([{type:'trailer',title:'Trailer',url:'https://example.test/file.html'}])},{awards:JSON.stringify([{event:'Festival',year:'20xx',outcome:'winner'}])},{screenings:JSON.stringify([{type:'screening',event:'Screening',date:'2026-02-29'}])},{cast_credits_rows:JSON.stringify([{name:'Actor',person_id:-1}])}])assert.throws(()=>productionMetadata({...input,...patch}),{status:422});
});
test('Legacy text credit edits preserve linked biographies; explicit row edits can unlink them',()=>{
 const old={cast_credits:[{name:'Actor',role:'Lead',person_id:42}]};assert.equal(productionMetadata({...base,cast_credits:'Actor | Lead'},old).cast_credits[0].person_id,42);assert.equal(productionMetadata({...base,cast_credits_rows:JSON.stringify([{name:'Actor',role:'Lead',person_id:''}])},old).cast_credits[0].person_id,undefined);
});
test('Structured EPK content and access modes preserve omitted edits and redact restricted payloads',()=>{
 const input={...base,epk_mode:'link_only',epk_structured:'yes',epk_intro:'Private kit intro',epk_url:'/media/42/document.pdf',epk_people:JSON.stringify([{person_id:7}]),epk_statements:JSON.stringify([{title:'Director statement',author:'Director',body:'Approved statement'}])};const result=productionMetadata(input);assert.equal(result.epk_structured,true);assert.equal(productionMetadata(base,result).epk_mode,'link_only');const safe=publicProductionMetadata(result);for(const key of ['epk_url','epk_intro','epk_people','epk_statements','epk_structured'])assert.equal(safe[key],undefined);
 assert.equal(publicProductionMetadata(productionMetadata({...input,epk_mode:'public'})).epk_intro,'Private kit intro');assert.throws(()=>productionMetadata({...input,epk_mode:'unknown'}),{status:422});assert.throws(()=>productionMetadata({...input,epk_people:JSON.stringify([{person_id:7},{person_id:7}])}),{status:422});
});
