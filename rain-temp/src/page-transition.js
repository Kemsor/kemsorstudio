export const transitionKey='kemsor.page-transition.v1';
export function isPageNavigation(href,current){
 const url=new URL(href,current),from=new URL(current);
 return ['http:','https:'].includes(url.protocol)&&url.origin===from.origin&&
  (url.pathname!==from.pathname||url.search!==from.search)&&
  !/^\/(?:api|admin|media|assets|health)(?:\/|$)/.test(url.pathname)&&
  !/\.(?!html?$)[a-z0-9]+$/i.test(url.pathname);
}
export function parseTransition(raw,{href,now=Date.now(),navigationType='navigate'}){
 try{
  const value=JSON.parse(raw),target=new URL(value.to),current=new URL(href);
  if(navigationType!=='navigate'||!Number.isFinite(value.startedAt)||now-value.startedAt>15000||value.startedAt>now+1000)return null;
  if(target.origin!==current.origin||target.pathname!==current.pathname||target.search!==current.search||!isPageNavigation(value.to,value.from))return null;
  return {...value,phase:'arriving'};
 }catch{return null;}
}
export function incomingTransition(){
 try{return parseTransition(sessionStorage.getItem(transitionKey),{href:location.href,navigationType:performance.getEntriesByType('navigation')[0]?.type||'navigate'});}catch{return null;}
}
