import React, { useState } from 'react';
import './planner-workflow.css';

const stages = [
 ['Add your script', 'Create a project, then paste your screenplay or attach a PDF, DOCX or TXT file.'],
 ['Shape your plan', 'Add your scene breakdown, budget, schedule, cast, crew, locations and production notes.'],
 ['Save & export', 'Save your work privately. Print your plan to PDF or download an Excel-compatible CSV.'],
];
export default function PlannerWorkflow() {
 const [stage,setStage]=useState(0);
 return <div className="planner-workflow">
  <div className="planner-workflow-top"><span>HOW THE PLANNER WORKS</span><span aria-hidden="true">0{stage+1} / 03</span></div>
  <div className="planner-workflow-controls" role="group" aria-label="Explore the planning workflow">{stages.map(([title],index)=><button type="button" id={`planner-workflow-step-${index}`} key={title} aria-pressed={stage===index} onClick={()=>setStage(index)}><span>0{index+1}</span>{title}</button>)}</div>
  <svg className="planner-workflow-drawing" data-stage={stage} viewBox="0 0 620 270" fill="none" aria-hidden="true">
   <defs><linearGradient id="planner-paper" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#fff2e3"/></linearGradient></defs>
   <path d="M24 243H596M24 27H596" stroke="#e6ddd2" strokeDasharray="2 7"/>
   <path className="planner-workflow-route" d="M137 135H204M416 135H485" stroke="#b58a42" strokeWidth="2" strokeDasharray="4 6"/>
   <path d="m194 130 10 5-10 5m281-5 10 5-10 5" stroke="#b58a42" strokeWidth="1.5"/>
   <g className="planner-workflow-script" opacity={stage===0?1:.65}>
    <path d="M38 69H120V213H38Z" fill="#f0e4d2" stroke="#d8c4a4"/>
    <path d="M47 59H129V203H47Z" fill="#fff2e3" stroke="#c7b393"/>
    <path d="M57 48H110L139 77V193H57Z" fill="url(#planner-paper)" stroke="#9e7a48" strokeWidth="1.5"/>
    <path d="M110 48V77H139M72 96H123M72 106H115M72 130H122M72 140H116M72 150H123M72 160H106" stroke="#baa687"/>
    <path d="M72 116H97" stroke="#9a6024" strokeWidth="3"/>
    <rect x="79" y="174" width="39" height="9" fill="#f4d17c"/>
   </g>
   <g className="planner-workflow-board" opacity={stage===1?1:.8}>
    <rect x="207" y="47" width="218" height="182" rx="5" fill="#efe6d8"/>
    <rect x="201" y="40" width="218" height="182" rx="5" fill="#fff" stroke="#9e7a48" strokeWidth="1.5"/>
    <path d="M201 69H419M252 69V222" stroke="#d9cbb8"/>
    <circle cx="215" cy="55" r="2" fill="#b28035"/><circle cx="224" cy="55" r="2" fill="#d9cbb8"/><circle cx="233" cy="55" r="2" fill="#d9cbb8"/>
    {[87,108,129,150,171,192].map((y,index)=><g key={y}><rect x="212" y={y} width="29" height="12" rx="2" fill={index===stage?'#f4d17c':'#f6f1e9'}/><path d={`M217 ${y+6}H236`} stroke="#b6a38a"/></g>)}
    <rect x="266" y="84" width="138" height="47" rx="3" fill="#fff2e3"/>
    <path d="M277 96H313M277 104H390M277 112H365M277 120H382" stroke="#c6ad88"/>
    <rect x="266" y="144" width="64" height="62" rx="3" fill="#fff" stroke="#e2d7c9"/>
    <path d="M277 194V177H286V194M291 194V164H300V194M305 194V171H314V194" fill="#e6bc68"/>
    <rect x="341" y="144" width="63" height="62" rx="3" fill="#fff" stroke="#e2d7c9"/>
    <path d="M350 157H384M350 167H394M358 177H394M369 187H394" stroke="#d0ac68" strokeWidth="5"/>
   </g>
   <g className="planner-workflow-export" opacity={stage===2?1:.65}>
    <path d="M496 76H560L580 96V210H496Z" fill="#fff2e3" stroke="#c9b18a"/>
    <path d="M486 60H550L570 80V194H486Z" fill="url(#planner-paper)" stroke="#9e7a48" strokeWidth="1.5"/>
    <path d="M550 60V80H570M500 112H553M500 123H545M500 134H551M500 145H533" stroke="#baa687"/>
    <circle cx="550" cy="179" r="23" fill="#f4d17c" stroke="#b58a42"/>
    <path d="M550 165V185M543 179L550 186L557 179M540 191H560" stroke="#62441e" strokeWidth="2"/>
   </g>
  </svg>
  <div className="planner-workflow-modules" aria-label="Planning tools"><span>Budget</span><span>Schedule</span><span>Cast & crew</span><span>Locations</span></div>
  <div className="planner-workflow-caption" role="region" aria-live="polite" aria-labelledby={`planner-workflow-step-${stage}`}><p>{stages[stage][1]}</p></div>
 </div>;
}
