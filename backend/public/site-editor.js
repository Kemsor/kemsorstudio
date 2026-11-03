const search=document.querySelector('[data-site-search]');
search?.addEventListener('input',()=>{const query=search.value.trim().toLocaleLowerCase();document.querySelectorAll('[data-site-search-item]').forEach(item=>{const values=[...item.querySelectorAll('textarea,input')].map(field=>field.value).join(' ');item.hidden=!`${item.textContent} ${values}`.toLocaleLowerCase().includes(query);});});
