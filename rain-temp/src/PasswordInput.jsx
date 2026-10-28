import SiteIcon from './SiteIcon';
import React,{useState} from 'react';
import './password-input.css';
export default function PasswordInput(props){const [visible,setVisible]=useState(false);return <span className="password-control"><input {...props} type={visible?'text':'password'}/><button type="button" className="password-eye" aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} onClick={event=>{event.preventDefault();setVisible(value=>!value);}}><SiteIcon name={visible?'eye-off':'eye'} /></button></span>}
