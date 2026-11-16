import {pageSeo} from './seo.js';
export function personSeo(person,options={}){
 const seo=pageSeo('productions',{...options,href:`/people/${person.slug}/`,label:person.name,title:`${person.name} | Kemsor Studios`,description:person.biography.slice(0,240)});
 const graph=seo.schema['@graph'],url=seo.canonical;
 if(person.image_url){seo.image=new URL(person.image_url,url).href;seo.imageAlt=person.image_alt||person.name;}
 graph.push({'@type':'Person','@id':url+'#person',url,name:person.name,description:person.biography,jobTitle:person.profession,...(person.image_url?{image:seo.image}:{}),...(person.website?{sameAs:person.website}:{})});graph[2].mainEntity={'@id':url+'#person'};return seo;
}
