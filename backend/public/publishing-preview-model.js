import {parseRichText,plainRichText,richTextHtml} from './rich-text-core.js';

export function previewBody(values){
 return richTextHtml(values.rich_text?parseRichText(values.rich_text):plainRichText(values.body||''));
}
export function publishingChecks(values,{hasImage=false,imageAlt='',pendingUpload=false}={}){
 const checks=[];
 const add=(field,message,level='recommended')=>checks.push({field,message,level});
 if(!String(values.title||'').trim())add('title','Add a title before publishing.','required');
 if(!['draft','published','archived'].includes(values.status))add('status','Choose a publishing status.','required');
 if(!String(values.summary||'').trim())add('summary','Add a short summary so readers know what to expect.');
 if(!String(values.body||'').trim())add('body','Add the main content before publishing.');
 if(hasImage&&!imageAlt.trim())add('image_id','Consider adding a description for this image.','recommended');
 if(pendingUpload)add('image','Upload the selected image, or cancel its selection, before saving.','required');
 if(values.type==='career'){
  if(!String(values.role||'').trim())add('role','Add the employment or engagement type.');
  if(!String(values.location||'').trim())add('location','Add the location or say whether this role is remote.');
 }
 if(values.type==='news'&&(values.categories||[values.category]).some(name=>['pressrelease','pressreleases'].includes(String(name||'').toLowerCase().replace(/[^a-z]/g,'')))&&!String(values.pdf_url||'').trim())add('pdf_url','Add the approved PDF before publishing a press release.','required');
 if(values.type==='page'&&!values.page)add('page','Choose which page this content belongs to.','required');
 if(values.video_url&&!hasImage)add('image_id','Choose a poster image for the video.','required');
 if(values.video_url&&!String(values.video_caption||'').trim())add('video_caption','Add a short caption for the video.','required');
 return checks;
}

export function publishingValues(form){
 const values=Object.fromEntries(new FormData(form));
 if(['blog','news'].includes(values.type)&&form.querySelector('[data-blog-categories]')){values.categories=[...form.querySelectorAll('input[name="category_ids"]:checked')].map(field=>field.dataset.categoryName);values.category=values.categories.join(' · ');}
 return values;
}
