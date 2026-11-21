// Reorganize existing controls without changing their values, names or save behaviour.
(() => {
 const enhance=()=>{
  const form=document.querySelector('form.editor');if(form?.elements.namedItem('type')?.value!=='production')return;
  const original=form.querySelector('.field-grid');if(!original)return;
  const block=name=>{let element=name==='slug'?form.querySelector('[data-auto-slug]'):form.elements.namedItem(name);if(!element?.parentElement)return null;while(element.parentElement&&element.parentElement!==original)element=element.parentElement;return element.parentElement===original?element:null;};
  form.classList.add('production-compact-editor');
  const intro=document.createElement('p');intro.className='production-editor-intro';intro.textContent='Start with the basics. Open the optional sections below when you need them.';original.before(intro);
  const core=document.createElement('div');core.className='field-grid production-core-grid';original.before(core);
  for(const name of ['title','slug','summary','production_stage','format','image_id','status']){const node=block(name);if(node)core.append(node);if(name==='image_id'){const upload=original.querySelector('[data-media-for=image_id]'),controls=original.querySelector('.image-picker-controls');if(upload)core.append(upload);if(controls)core.append(controls);}}
  const definitions=[
   ['story','Story and production details','Synopsis, internal working title, genres, languages and release dates'],
   ['media','Images, video and platforms','Production stills, trailers, songs, subtitles and watch links'],
   ['people','Cast, crew and contributors','Credits and linked biographies'],
   ['press','Press kit and rights','EPK downloads, statements, sharing and rights information'],
   ['events','Awards and screenings','Festival selections, awards, premieres and screening history'],
  ];
  const groups=new Map();
  for(const [key,title,description] of definitions){const details=document.createElement('details'),summary=document.createElement('summary'),heading=document.createElement('span'),hint=document.createElement('small'),content=document.createElement('div');details.className='production-form-section';details.dataset.productionSection=key;heading.textContent=title;hint.textContent=description;summary.append(heading,hint);content.className='field-grid production-section-content';details.append(summary,content);original.before(details);groups.set(key,content);}
  for(const name of ['body','working_title','genres','language','year','release_date','category','role','location']){const node=block(name);if(node)groups.get('story').append(node);}
  for(const child of [...original.children]){
   if(child.tagName==='SCRIPT'||child.tagName==='NOSCRIPT')continue;
   const name=child.querySelector('[data-collection-value]')?.name;
   const group=name?(['cast_credits_rows','crew_credits_rows','contributor_credits_rows'].includes(name)?'people':['awards','screenings'].includes(name)?'events':['epk_people','epk_statements'].includes(name)?'press':'media'):child.matches('[data-production-gallery]')||child.querySelector('[name=video_url]')?'media':child.querySelector('[name=epk_mode],[name=rights_holder]')?'press':'story';
   groups.get(group).append(child);
  }
  original.remove();
  window.adminRevealField=field=>{for(let node=field?.parentElement;node&&node!==form;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;};
  form.addEventListener('invalid',event=>window.adminRevealField(event.target),true);
 };
 if(document.readyState==='complete')enhance();else document.addEventListener('DOMContentLoaded',enhance,{once:true});
})();
