import careerOptions from '../../shared/career-editor-options.json' with {type:'json'};
export {careerOptions};
const fail=message=>{throw Object.assign(new Error(message),{status:422});};
const key=value=>value.toLowerCase().replace(/[^a-z]/g,'');
export function careerFields(body,previous={}){
 const choose=(field,choices,label,allowLegacy=false)=>{
  const raw=body[field]===undefined?(previous[field]||''):body[field];
  if(typeof raw!=='string')fail(`Choose a valid ${label}.`);
  const value=raw.trim();if(!value)return '';
  const selected=choices.find(choice=>key(choice)===key(value));if(selected)return selected;
  if(allowLegacy&&value===previous[field]&&value.length<=200)return value;
  fail(`Choose a valid ${label}.`);
 };
 return {role:choose('role',careerOptions.employmentTypes,'employment / engagement type',true),work_arrangement:choose('work_arrangement',careerOptions.workArrangements,'work arrangement')};
}
