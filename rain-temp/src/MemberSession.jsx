import React,{createContext,useContext,useEffect,useState} from 'react';
import {api,publicPreview,siteLink} from './talent-api';
const Context=createContext({user:null,loading:true});
export function MemberSessionProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[loggingOut,setLoggingOut]=useState(false);
 useEffect(()=>{let current=true;async function refresh(){try{const data=publicPreview?{user:null}:await api('/api/talent/session');if(current)setUser(data.user);}catch{if(current)setUser(null);}finally{if(current)setLoading(false);}}refresh();window.addEventListener('focus',refresh);return()=>{current=false;window.removeEventListener('focus',refresh);};},[]);
 async function logout(){setLoggingOut(true);setError('');try{await api('/api/talent/logout',{});setUser(null);location.assign(import.meta.env.BASE_URL);}catch(e){setError(e.message);setLoggingOut(false);}}
 return <Context.Provider value={{user,loading,logout,loggingOut}}>{children}{error&&<p className="session-error" role="alert">{error}</p>}</Context.Provider>;
}
export const useMember=()=>useContext(Context);
export function LogoutButton({className=''}){const {logout,loggingOut}=useMember();return <button type="button" className={className} onClick={logout} disabled={loggingOut}>{loggingOut?'Logging out…':'Logout'}</button>}
