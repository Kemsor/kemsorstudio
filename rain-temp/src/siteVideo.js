import defaults from '../../shared/site-video-defaults.json';
import {getSiteModule} from './siteContent';
export function getSiteVideo(key,fallback=defaults[key]){
 const values=getSiteModule('videos',{}),result={...fallback,id:key,enabled:true,position:Object.keys(defaults).indexOf(key)+1,captions:'',language:'en',description:''};
 for(const field of ['label','src','poster','enabled','position','captions','language','description'])if(Object.hasOwn(values,`${key}.${field}`))result[field]=values[`${key}.${field}`];
 return result;
}
