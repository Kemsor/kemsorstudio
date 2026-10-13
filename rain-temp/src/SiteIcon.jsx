import React from 'react';
export default function SiteIcon({name,size=20}){
 const shapes={home:<><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7"/></>,film:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="m3 10 18-5M7 4l3 4m4-6 3 4"/></>,guide:<><circle cx="12" cy="12" r="9"/><path d="m15 8-2 6-5 2 2-6Z"/></>,contact:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,people:<><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/></>};
 return <svg className="site-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]||shapes.arrow}</svg>;
}
