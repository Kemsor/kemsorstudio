import React from 'react';
import './process-illustration.css';

export default function ProcessIllustration({step}){
 return <svg className="process-illustration" viewBox="0 0 200 160" fill="none" aria-hidden="true" focusable="false">
  <ellipse cx="104" cy="144" rx="68" ry="8" fill="#725022" opacity=".08"/>
  {step===0?<>
   <path d="M57 28 139 19 152 133 70 141Z" fill="#E9D6AE" stroke="#B18A49" strokeWidth="1.5"/>
   <path d="M49 19H126L147 40V131H49Z" fill="#FFFCF5" stroke="#9D773D" strokeWidth="2" strokeLinejoin="round"/>
   <path d="M126 19V40H147" fill="#F1E3C8" stroke="#9D773D" strokeWidth="2" strokeLinejoin="round"/>
   <rect x="64" y="48" width="48" height="6" rx="3" fill="#B78C46"/>
   <path d="M64 68H128M64 81H128M64 94H109M64 107H99" stroke="#CABC9F" strokeWidth="3" strokeLinecap="round"/>
   <g transform="rotate(28 142 85)"><rect x="136" y="47" width="13" height="64" rx="3" fill="#D9AE61" stroke="#91672D" strokeWidth="1.5"/><path d="M136 111 142.5 127 149 111" fill="#F0DEC0" stroke="#91672D" strokeWidth="1.5" strokeLinejoin="round"/><path d="m140 121 2.5 6 2.5-6" fill="#674820"/><path d="M136 58H149" stroke="#91672D" strokeWidth="2"/></g>
   <path d="M24 48V62M17 55H31M166 24V34M161 29H171" stroke="#C29B57" strokeWidth="2" strokeLinecap="round"/>
  </>:<>
   <rect x="34" y="29" width="126" height="91" rx="8" fill="#F1E3C8" stroke="#9D773D" strokeWidth="2"/>
   <rect x="45" y="40" width="104" height="61" rx="3" fill="#FFFCF5" stroke="#D9C7A6" strokeWidth="1.5"/>
   <path d="M88 56 110 70 88 84Z" fill="#C69A4F" stroke="#A87A33" strokeWidth="1.5" strokeLinejoin="round"/>
   <path d="M82 120V135M111 120V135M70 136H123" stroke="#9D773D" strokeWidth="3" strokeLinecap="round"/>
   <circle cx="151" cy="109" r="25" fill="#C99D50" stroke="#9D773D" strokeWidth="2"/>
   <path d="m139 109 8 8 16-17" stroke="#FFFCF5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
   <circle cx="97" cy="111" r="2" fill="#9D773D"/>
   <path d="M21 66V80M14 73H28M174 36V46M169 41H179" stroke="#C29B57" strokeWidth="2" strokeLinecap="round"/>
  </>}
 </svg>;
}
