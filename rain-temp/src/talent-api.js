export const publicPreview=import.meta.env.VITE_PUBLIC_PREVIEW==='true';
export const previewMessage='Preview only. Registration, login and saved production projects will open when the studio workspace launches.';
export async function api(path,body){
 if(publicPreview)throw new Error(previewMessage);
 const options={credentials:'same-origin',headers:{}};
 if(body!==undefined){const response=await fetch('/api/csrf',{credentials:'same-origin'});if(!response.ok)throw new Error('The studio workspace is unavailable. Please try again.');const {token}=await response.json();options.method='POST';options.headers['X-CSRF-Token']=token;if(body instanceof FormData)options.body=body;else{options.headers['Content-Type']='application/json';options.body=JSON.stringify(body);}}
 const res=await fetch(path,options);let data;try{data=await res.json();}catch{throw new Error('The studio workspace is unavailable. Please try again.');}if(!res.ok)throw new Error(data.error||'Please try again.');return data;
}
export const siteLink=page=>`${import.meta.env.BASE_URL}${page}/`;
