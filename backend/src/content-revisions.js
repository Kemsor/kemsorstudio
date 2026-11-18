import {Router} from 'express';
import {rows,json,audit} from './db.js';
import {canEdit} from './security.js';
import {richTextHtml,plainRichText} from '../public/rich-text-core.js';
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
export function requireEntryRevision(entry,value){
 const expected=Number(value);
 if(!Number.isSafeInteger(expected)||expected<1||expected!==Number(entry.revision))throw Object.assign(new Error('This item changed since you opened it, or this editor is out of date. Your entries are still here. Review the latest saved version before saving again.'),{status:409,code:'CONTENT_CONFLICT',conflict:{revision:Number(entry.revision),updatedAt:entry.updated_at,editor:entry.last_editor||null,editorUrl:`/admin/content/${entry.id}`,historyUrl:`/admin/content/${entry.id}/revisions${Number.isSafeInteger(expected)&&expected>0?'?version='+expected:''}`}});
}
export function entrySnapshot(entry){
 return {type:entry.type,title:entry.title||'',slug:entry.slug,summary:entry.summary||'',body:entry.body||'',image_id:entry.image_id||null,metadata:entry.metadata?json(entry.metadata):{},status:entry.status,published_at:entry.published_at||null};
}
export async function captureEntryRevision(db,entry,action,userId,{initial=false}={}){
 await rows(db,`INSERT INTO cms_entry_revisions(content_id,revision,action,snapshot,created_by) VALUES(?,?,?,?,?)${initial?' ON DUPLICATE KEY UPDATE content_id=VALUES(content_id)':''}`,[entry.id,entry.revision,action,JSON.stringify(entrySnapshot(entry)),userId||null]);
}
const label=value=>String(value).replaceAll('_',' ').replace(/\b\w/g,char=>char.toUpperCase());
const display=(value,depth=0)=>{
 if(value===null||value===undefined||value==='')return 'Not set';
 if(typeof value==='boolean')return value?'Yes':'No';
 if(typeof value!=='object')return String(value);
 if(depth>4)return 'Additional details';
 if(Array.isArray(value))return value.length?value.map(item=>display(item,depth+1)).join('\n'):'None';
 return Object.entries(value).map(([key,item])=>`${label(key)}: ${display(item,depth+1)}`).join('\n');
};
const stable=value=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);
export function revisionComparison(previous,current){
 const fields=['title','slug','summary','body','image_id','status'];
 const result=fields.map(key=>({key,label:({slug:'URL key',body:'Content',image_id:'Image'})[key]||label(key),before:display(previous[key]),after:display(current[key]),changed:stable(previous[key])!==stable(current[key])}));
 const oldMeta=previous.metadata||{},newMeta=current.metadata||{};
 result.find(item=>item.key==='body').changed ||= stable(oldMeta.rich_text)!==stable(newMeta.rich_text);
 for(const key of [...new Set([...Object.keys(oldMeta),...Object.keys(newMeta)])].filter(key=>key!=='rich_text').sort())result.push({key:'metadata:'+key,label:label(key),before:display(oldMeta[key]),after:display(newMeta[key]),changed:stable(oldMeta[key])!==stable(newMeta[key])});
 return result;
}
export function revisionBody(snapshot){try{return richTextHtml(snapshot.metadata?.rich_text||plainRichText(snapshot.body));}catch{return richTextHtml(plainRichText(snapshot.body));}}
export function contentRevisionsRouter(db){
 const router=Router(),staff=(req,res,next)=>canEdit(req.user)?next():next(Object.assign(new Error('Publishing access required.'),{status:403}));
 const load=async(id,connection=db,lock=false)=>{const entry=(await rows(connection,`SELECT * FROM cms_entries WHERE id=?${lock?' FOR UPDATE':''}`,[id]))[0];fail(entry,'Content not found.',404);fail(entry.type!=='legal','Use the managed legal editor for this content.',403);return entry;};
 router.get('/admin/content/:id/version',staff,async(req,res)=>{
  const entry=await load(req.params.id),editor=entry.updated_by?(await rows(db,'SELECT name FROM cms_users WHERE id=?',[entry.updated_by]))[0]?.name:null;
  res.json({revision:entry.revision,updatedAt:entry.updated_at,editor:editor||null,editorUrl:`/admin/content/${entry.id}`,historyUrl:`/admin/content/${entry.id}/revisions`});
 });
 router.get('/admin/content/:id/revisions',staff,async(req,res)=>{
  const entry=await load(req.params.id),revisions=await rows(db,'SELECT r.id,r.revision,r.action,r.created_at,u.name AS editor FROM cms_entry_revisions r LEFT JOIN cms_users u ON u.id=r.created_by WHERE r.content_id=? ORDER BY r.revision DESC LIMIT 50',[entry.id]);
  const byVersion=req.query.version?(await rows(db,'SELECT id FROM cms_entry_revisions WHERE content_id=? AND revision=?',[entry.id,req.query.version]))[0]?.id:null;
  const chosen=req.query.revision||byVersion||revisions.find(item=>Number(item.revision)<Number(entry.revision))?.id||revisions[0]?.id;
  const selected=chosen?(await rows(db,'SELECT r.*,u.name AS editor FROM cms_entry_revisions r LEFT JOIN cms_users u ON u.id=r.created_by WHERE r.id=? AND r.content_id=?',[chosen,entry.id]))[0]:null;
  fail(!chosen||selected,'Revision not found.',404);
  const previous=selected?json(selected.snapshot):entrySnapshot(entry),current=entrySnapshot(entry),comparison=revisionComparison(previous,current);
  res.render('content-revisions',{entry,revisions,selected,previous,current,comparison,revisionBody});
 });
 router.post('/admin/content/:id/revisions/restore',staff,async(req,res)=>{
  fail(req.body.confirm_restore==='draft','Confirm the draft restoration before continuing.');
  const connection=await db.getConnection();
  try{
   await connection.beginTransaction();const current=await load(req.params.id,connection,true);requireEntryRevision(current,req.body.revision);
   const chosen=(await rows(connection,'SELECT * FROM cms_entry_revisions WHERE id=? AND content_id=?',[req.body.snapshot_id,current.id]))[0];fail(chosen,'Revision not found.',404);fail(Number(chosen.revision)<Number(current.revision),'Choose an earlier saved revision.');
   const snapshot=json(chosen.snapshot);fail(snapshot.type===current.type,'This revision belongs to another content area.');
   if(snapshot.image_id)fail((await rows(connection,'SELECT m.id FROM cms_media m WHERE m.id=? AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id)',[snapshot.image_id])).length,'The saved image is no longer available.');
   await captureEntryRevision(connection,current,'before-change',current.updated_by,{initial:true});
   await rows(connection,'UPDATE cms_entries SET title=?,summary=?,body=?,image_id=?,metadata=?,status="draft",published_at=NULL,updated_by=?,revision=revision+1,updated_at=UTC_TIMESTAMP() WHERE id=?',[snapshot.title,snapshot.summary,snapshot.body,snapshot.image_id||null,JSON.stringify(snapshot.metadata||{}),req.user.id,current.id]);
   const restored=await load(current.id,connection);await captureEntryRevision(connection,restored,'restore-draft',req.user.id);await audit(connection,req.user,'restore_draft','content',current.id,{changes:[{field:'Restored saved version',before:current.revision,after:chosen.revision},{field:'Publishing status',before:current.status,after:'draft'}]});await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  res.redirect(`/admin/content/${req.params.id}?saved=1`);
 });
 return router;
}
