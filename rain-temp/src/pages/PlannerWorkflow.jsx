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
   <defs><linearGradient id="planner-paper" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#ffffff"/></linearGradient></defs>
   <path d="M24 243H596M24 27H596" stroke="#dedede" strokeDasharray="2 7"/>
   <path className="planner-workflow-route" d="M137 135H204M416 135H485" stroke="#8e8e8e" strokeWidth="2" strokeDasharray="4 6"/>
   <path d="m194 130 10 5-10 5m281-5 10 5-10 5" stroke="#8e8e8e" strokeWidth="1.5"/>
   <g className="planner-workflow-script" opacity={stage===0?1:.65}>
    <path d="M38 69H120V213H38Z" fill="#e5e5e5" stroke="#c6c6c6"/>
    <path d="M47 59H129V203H47Z" fill="#ffffff" stroke="#b5b5b5"/>
    <path d="M57 48H110L139 77V193H57Z" fill="url(#planner-paper)" stroke="#7e7e7e" strokeWidth="1.5"/>
    <path d="M110 48V77H139M72 96H123M72 106H115M72 130H122M72 140H116M72 150H123M72 160H106" stroke="#a8a8a8"/>
    <path d="M72 116H97" stroke="#686868" strokeWidth="3"/>
    <rect x="79" y="174" width="39" height="9" fill="#d2d2d2"/>
   </g>
   <g className="planner-workflow-board" opacity={stage===1?1:.8}>
    <rect x="207" y="47" width="218" height="182" rx="5" fill="#e7e7e7"/>
    <rect x="201" y="40" width="218" height="182" rx="5" fill="#fff" stroke="#7e7e7e" strokeWidth="1.5"/>
    <path d="M201 69H419M252 69V222" stroke="#cdcdcd"/>
    <circle cx="215" cy="55" r="2" fill="#858585"/><circle cx="224" cy="55" r="2" fill="#cdcdcd"/><circle cx="233" cy="55" r="2" fill="#cdcdcd"/>
    {[87,108,129,150,171,192].map((y,index)=><g key={y}><rect x="212" y={y} width="29" height="12" rx="2" fill={index===stage?'#d2d2d2':'#ffffff'}/><path d={`M217 ${y+6}H236`} stroke="#a5a5a5"/></g>)}
    <rect x="266" y="84" width="138" height="47" rx="3" fill="#ffffff"/>
    <path d="M277 96H313M277 104H390M277 112H365M277 120H382" stroke="#b0b0b0"/>
    <rect x="266" y="144" width="64" height="62" rx="3" fill="#fff" stroke="#d8d8d8"/>
    <path d="M277 194V177H286V194M291 194V164H300V194M305 194V171H314V194" fill="#bfbfbf"/>
    <rect x="341" y="144" width="63" height="62" rx="3" fill="#fff" stroke="#d8d8d8"/>
    <path d="M350 157H384M350 167H394M358 177H394M369 187H394" stroke="#afafaf" strokeWidth="5"/>
   </g>
   <g className="planner-workflow-export" opacity={stage===2?1:.65}>
    <path d="M496 76H560L580 96V210H496Z" fill="#ffffff" stroke="#b3b3b3"/>
    <path d="M486 60H550L570 80V194H486Z" fill="url(#planner-paper)" stroke="#7e7e7e" strokeWidth="1.5"/>
    <path d="M550 60V80H570M500 112H553M500 123H545M500 134H551M500 145H533" stroke="#a8a8a8"/>
    <circle cx="550" cy="179" r="23" fill="#d2d2d2" stroke="#8e8e8e"/>
    <path d="M550 165V185M543 179L550 186L557 179M540 191H560" stroke="#484848" strokeWidth="2"/>
   </g>
  </svg>
  <div className="planner-workflow-modules" aria-label="Planning tools"><span>Budget</span><span>Schedule</span><span>Cast & crew</span><span>Locations</span></div>
  <div className="planner-workflow-caption" role="region" aria-live="polite" aria-labelledby={`planner-workflow-step-${stage}`}><p>{stages[stage][1]}</p></div>
 </div>;
}
