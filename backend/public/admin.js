const dropdown=document.querySelector('.notification-dropdown');
if(dropdown){
  document.addEventListener('click',event=>{if(!dropdown.contains(event.target))dropdown.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && dropdown.open){dropdown.open=false;dropdown.querySelector('summary').focus();}});
  let pending=false;
  async function refresh(){
    if(document.hidden || pending)return;
    pending=true;
    try{
      const response=await fetch('/admin/notifications.json',{headers:{Accept:'application/json'}});
      if(!response.ok || !response.headers.get('content-type')?.includes('application/json'))return;
      const {items,unread}=await response.json();
      document.querySelectorAll('[data-notification-count]').forEach(node=>{node.textContent=String(unread);node.hidden=!unread;});
      if(dropdown.open)return;
      const list=dropdown.querySelector('.notification-items');
      if(!list)return;
      if(!items.length){const empty=document.createElement('div');empty.className='notification-empty';const title=document.createElement('strong');title.textContent='You’re all caught up.';const copy=document.createElement('p');copy.textContent='New drafts and enquiries will appear here.';empty.append(title,copy);list.replaceChildren(empty);return;}
      const elements=items.slice(0,5).map(item=>{
        const article=document.createElement('article');article.className=`notification-item ${item.read?'is-read':'is-unread'}`;
        const indicator=document.createElement('span');indicator.className=`notification-indicator tone-${item.tone}`;indicator.textContent=item.tone==='coral'?'✉':item.tone==='violet'?'✎':'✦';indicator.setAttribute('aria-hidden','true');
        const content=document.createElement('div'),link=document.createElement('a');link.href=item.href;
        const title=document.createElement('strong');title.textContent=item.title;const text=document.createElement('span');text.textContent=item.text;link.append(title,text);content.append(link);
        if(item.date){const date=document.createElement('small');date.textContent=`${item.date} UTC`;content.append(date);}
        article.append(indicator,content);
        if(!item.read){const dot=document.createElement('span');dot.className='unread-dot';dot.setAttribute('aria-label','Unread');article.append(dot);}
        return article;
      });
      list.replaceChildren(...elements);
    }catch{/* The existing notification list remains usable if connectivity drops. */}finally{pending=false;}
  }
  setInterval(refresh,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
}
