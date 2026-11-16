import {pageSeo} from './seo.js';
export const productionHref = slug => `/productions/${encodeURIComponent(slug)}/`;
export function productionSeo(record, options={}) {
 const seo=pageSeo('productions',{...options,href:productionHref(record.slug),label:record.title,title:`${record.title} | Kemsor Studios`,description:record.summary||`Discover ${record.title}, a Kemsor Studios production.`});
 const metadata=record.metadata||{};
 if(record.image_url){seo.image=new URL(record.image_url,seo.canonical).href;seo.imageAlt=record.image_alt||record.title;}
 const graph=seo.schema['@graph'];
 const type=/series|ott/i.test(metadata.format||'')?'TVSeries':/film|documentary/i.test(metadata.format||'')?'Movie':'CreativeWork';
 const work={'@type':type,'@id':`${seo.canonical}#production`,name:record.title,url:seo.canonical,description:seo.description,productionCompany:{'@id':graph[0]['@id']},...(record.image_url?{image:seo.image}:{}),...(metadata.genres?.length?{genre:metadata.genres}:{}),...(metadata.languages?.length?{inLanguage:metadata.languages}:{}),...(metadata.release_date?{datePublished:metadata.release_date}:{})};
 graph[2].mainEntity={'@id':work['@id']};
 graph[3].itemListElement.splice(1,0,{'@type':'ListItem',position:2,name:'Productions',item:new URL('/productions/',seo.canonical).href});
 graph[3].itemListElement[2].position=3;
 graph.push(work);
 return seo;
}
