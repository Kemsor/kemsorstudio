import React from 'react';

// Original vector scenes inherit the selected stage’s colour palette.
export default function JourneyArtwork({ stage }) {
  return <svg viewBox="0 0 520 340" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
    <defs>
      <linearGradient id={`journey-gold-${stage}`} x1="90" y1="60" x2="390" y2="300" gradientUnits="userSpaceOnUse"><stop stopColor="var(--scene-light)"/><stop offset="1" stopColor="var(--scene-accent)"/></linearGradient>
      <filter id={`journey-shadow-${stage}`} x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="var(--scene-ink)" floodOpacity=".13"/></filter>
    </defs>
    <circle cx="260" cy="166" r="132" fill="var(--scene-soft)" opacity=".32"/>
    <circle cx="260" cy="166" r="155" stroke="var(--scene-accent)" strokeOpacity=".2" strokeDasharray="3 9"/>
    <ellipse cx="266" cy="294" rx="176" ry="14" fill="var(--scene-ink)" opacity=".08"/>
    <g filter={`url(#journey-shadow-${stage})`}>
      {stage === 'develop' && <>
        <g transform="rotate(-12 250 170)"><rect x="134" y="53" width="222" height="240" rx="12" fill="var(--scene-soft)" stroke="var(--scene-line)"/></g>
        <g transform="rotate(5 260 170)">
          <rect x="160" y="39" width="220" height="252" rx="12" fill="var(--scene-paper)" stroke="var(--scene-line)"/>
          <rect x="183" y="65" width="69" height="7" rx="3.5" fill="var(--scene-accent)"/>
          <path d="M184 102h142M184 117h122M184 161h155M184 176h133M184 218h144M184 233h99" stroke="var(--scene-detail)" strokeWidth="5" strokeLinecap="round"/>
          <path d="M184 138h52M184 197h52" stroke="var(--scene-muted)" strokeWidth="5" strokeLinecap="round"/>
          <path d="m326 58 28 0 0 28" stroke="var(--scene-soft)" strokeWidth="3"/>
        </g>
        <g className="journey-art-float" transform="rotate(25 362 210)"><rect x="351" y="127" width="17" height="135" rx="4" fill="var(--scene-ink)"/><path d="m351 260 8.5 26 8.5-26" fill="var(--scene-accent)"/><path d="m356 276 3.5 10 3.5-10" fill="var(--scene-ink)"/><path d="M356 139v104" stroke="var(--scene-light)" strokeWidth="3"/></g>
      </>}
      {stage === 'finance' && <>
        <rect x="115" y="70" width="250" height="207" rx="14" fill="var(--scene-paper)" stroke="var(--scene-line)"/>
        <path d="M116 112h248" stroke="var(--scene-detail)"/><rect x="135" y="87" width="71" height="6" rx="3" fill="var(--scene-accent)"/>
        <path d="M138 138h64M138 165h91M138 192h74M138 219h91M138 247h130" stroke="var(--scene-detail)" strokeWidth="5" strokeLinecap="round"/>
        <path d="M286 137h51M296 165h41M286 192h51M296 219h41" stroke="var(--scene-muted)" strokeWidth="5" strokeLinecap="round"/>
        <g className="journey-art-float"><circle cx="353" cy="210" r="70" fill="var(--scene-ink)"/><circle cx="353" cy="210" r="44" stroke="var(--scene-muted)" strokeWidth="16"/>
          <circle cx="353" cy="210" r="44" stroke="var(--scene-accent)" strokeWidth="16" strokeDasharray="195 277" transform="rotate(-90 353 210)"/>
          <path d="m341 211 9 9 19-22" stroke="var(--scene-light)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <rect x="100" y="234" width="67" height="49" rx="9" fill={`url(#journey-gold-${stage})`}/><path d="M101 248h65M101 262h65" stroke="var(--scene-secondary)" strokeWidth="2"/>
      </>}
      {stage === 'produce' && <>
        <g transform="rotate(-6 232 180)"><rect x="103" y="118" width="251" height="163" rx="12" fill="var(--scene-ink)"/>
          <path d="M126 158h204M126 222h204M213 158v89M278 158v89" stroke="var(--scene-muted)" strokeWidth="2"/>
          <rect x="126" y="177" width="59" height="7" rx="3" fill="var(--scene-light)"/><path d="M126 199h44M230 199h26M291 199h26M126 244h67" stroke="var(--scene-light)" strokeWidth="4" strokeLinecap="round"/>
          <g transform="rotate(-16 107 118)"><rect x="103" y="78" width="251" height="38" rx="6" fill="var(--scene-light)"/>
            <path d="m137 78-22 38h35l23-38m35 0-23 38h35l23-38m35 0-23 38h35l23-38m35 0-23 38h32" fill="var(--scene-ink)"/>
          </g><circle cx="116" cy="126" r="5" fill="var(--scene-secondary)"/>
        </g>
        <g className="journey-art-float"><rect x="312" y="168" width="99" height="74" rx="13" fill="var(--scene-accent)"/><rect x="328" y="155" width="37" height="15" rx="4" fill="var(--scene-ink)"/><path d="m411 188 32-16v66l-32-16" fill="var(--scene-ink)"/><circle cx="355" cy="205" r="24" fill="var(--scene-ink)"/><circle cx="355" cy="205" r="14" stroke="var(--scene-light)" strokeWidth="3"/><path d="m343 242-14 43m40-43 15 43" stroke="var(--scene-ink)" strokeWidth="6" strokeLinecap="round"/></g>
      </>}
      {stage === 'post' && <>
        <rect x="90" y="66" width="340" height="221" rx="15" fill="var(--scene-ink)"/>
        <rect x="102" y="80" width="316" height="127" rx="5" fill="var(--scene-dark)"/>
        <path d="m137 184 64-69 54 50 42-38 88 57" fill="var(--scene-muted)"/><path d="m255 165 42-38 88 57H137l64-69" fill="var(--scene-secondary)" opacity=".6"/>
        <circle cx="339" cy="111" r="15" fill="var(--scene-light)"/>
        <rect x="109" y="220" width="301" height="11" rx="3" fill="var(--scene-muted)"/><rect x="109" y="220" width="76" height="11" rx="3" fill="var(--scene-accent)"/><rect x="191" y="220" width="113" height="11" rx="3" fill="var(--scene-soft)"/>
        <rect x="109" y="238" width="301" height="11" rx="3" fill="var(--scene-secondary)"/>
        <path d="m112 263 7-5 6 9 7-14 7 16 7-11 7 5 6-9 7 13 7-8 7 5 7-11 7 16 7-11 7 5 7-10 7 14 7-8 7 4 7-10 7 13 7-8 7 4 7-11 7 15 7-9 7 5 7-12 7 14 7-7 7 3" stroke="var(--scene-light)" strokeWidth="2"/>
        <g className="journey-art-float"><path d="M284 210v68" stroke="var(--scene-paper)" strokeWidth="3"/><path d="m276 208 8 10 8-10" fill="var(--scene-paper)"/></g>
        <path d="M229 287v13h64v-13M203 302h116" stroke="var(--scene-ink)" strokeWidth="8" strokeLinecap="round"/>
      </>}
      {stage === 'release' && <>
        <path d="m259 251-142-71V69h286v111z" fill="var(--scene-soft)" opacity=".2"/>
        <rect x="108" y="60" width="304" height="167" rx="12" fill="var(--scene-ink)"/>
        <rect x="121" y="73" width="278" height="141" rx="4" fill="var(--scene-paper)"/>
        <path d="M137 197c22-18 48-35 77-37 45-3 55 34 99 18 25-8 39-28 71-27v48H137z" fill="var(--scene-soft)"/>
        <path d="m259 100 9 20 22 3-16 16 4 23-19-11-20 11 4-23-16-16 23-3z" fill={`url(#journey-gold-${stage})`}/>
        <path d="M260 227v32M213 259h94" stroke="var(--scene-ink)" strokeWidth="5" strokeLinecap="round"/>
        <g className="journey-art-float" fill="var(--scene-accent)"><path d="m99 87 3 10 10 3-10 3-3 10-3-10-10-3 10-3zm326 143 4 12 12 4-12 4-4 12-4-12-12-4 12-4zm-33-194 3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/></g>
        <g fill="var(--scene-muted)"><path d="M137 286a18 18 0 0 1 36 0v11h-36zm62 0a18 18 0 0 1 36 0v11h-36zm62 0a18 18 0 0 1 36 0v11h-36zm62 0a18 18 0 0 1 36 0v11h-36z"/></g>
      </>}
    </g>
  </svg>;
}
