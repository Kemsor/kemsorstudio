import React from 'react';
import './script-card-illustration.css';

// Decorative line drawing: a marked-up script becoming a storyboard.
export default function ScriptCardIllustration(){return <div className="script-card-illustration" aria-hidden="true"><svg viewBox="0 0 1200 540" fill="none" preserveAspectRatio="xMidYMax slice">
 <g className="script-art-pages" transform="translate(90 190) rotate(-12 175 180)">
  <path d="M26 25H312V385H26V25Z" stroke="currentColor" opacity=".32"/>
  <path d="M13 12H299V372H13V12Z" stroke="currentColor" opacity=".5"/>
  <path d="M0 0H286V359H0V0Z" fill="#21140f" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M31 35H75M211 35H255M31 57H255" stroke="currentColor"/>
  <text x="32" y="95" fill="currentColor" fontFamily="monospace" fontSize="11" letterSpacing="2">INT. A NEW STORY — DAY</text>
  <path d="M32 119H241M32 132H216M32 145H246M32 158H167M103 188H182M71 205H219M71 218H202M71 231H226M32 261H245M32 274H226M32 287H241M32 300H184" stroke="currentColor" opacity=".6"/>
  <ellipse cx="143" cy="188" rx="57" ry="14" transform="rotate(-4 143 188)" stroke="currentColor" strokeWidth="2"/>
  <path d="M228 213l13 8 21-26M24 112c-13 6-14 44-1 52M235 285l21-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
 </g>
 <path className="script-art-route" d="M380 413C502 479 522 259 654 329C689 347 693 389 672 400C650 411 631 385 653 364C707 310 766 329 805 358" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8"/>
 <path d="M790 346l17 13-21 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
 <g transform="translate(778 217) rotate(9 185 116)" stroke="currentColor">
  <rect width="370" height="232" strokeWidth="1.5"/>
  <path d="M0 22H370M0 210H370M123 22V210M247 22V210"/>
  {[14,45,76,107,138,169,200,231,262,293,324,355].map(x=><g key={x}><rect x={x} y="7" width="8" height="7"/><rect x={x} y="218" width="8" height="7"/></g>)}
  <g opacity=".65"><path d="M14 178l33-34 23 13 37-58M136 171l28-29 35 10 32-45M260 171l30-29 27 16 36-47"/><circle cx="77" cy="91" r="14"/><circle cx="203" cy="91" r="14"/><circle cx="326" cy="91" r="14"/></g>
  {[14,137,261].map(x=><path key={x} d={`M${x} 48h13m-13 0v13m95-13h-13m13 0v13m-95 135h13m-13 0v-13m95 13h-13m13 0v-13`}/>)}
 </g>
 <g transform="translate(545 455) rotate(-28)" stroke="currentColor"><path d="M0 0H180L197 6 180 12H0V0Z"/><path d="M15 0V12M177 0V12M180 0l4 6-4 6M22 4H168" opacity=".65"/></g>
</svg></div>}
