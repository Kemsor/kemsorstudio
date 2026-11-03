import {rows,json} from './db.js';

export const businessCategories=['business','partnerships','production','creative','brand','distribution','financing','international','partner_registration'];
export const metricDefinitions=[
 {key:'leads',label:'Business enquiries',unit:'count',source:'CMS',definition:'Enquiries created in the period in the selected business categories, excluding records currently marked spam.'},
 {key:'qualified',label:'Qualified enquiries',unit:'count',source:'CMS',definition:'Period-created business enquiries with a recorded first qualified, accepted or converted milestone by period end.'},
 {key:'converted',label:'Converted enquiries',unit:'count',source:'CMS',definition:'Period-created business enquiries with a recorded first converted milestone by period end. A staff-recorded outcome; not verified revenue.'},
 {key:'qualification_rate',label:'Qualification rate',unit:'percent',source:'CMS',definition:'Qualified period-created enquiries / eligible period-created business enquiries × 100. No enquiries means unavailable, not 0%.'},
 {key:'conversion_rate',label:'Business conversion rate',unit:'percent',source:'CMS',definition:'Converted period-created enquiries / eligible period-created business enquiries × 100. Not a website visitor-to-lead rate.'},
 {key:'sessions',label:'Website sessions',unit:'count',source:'GA4',definition:'Sessions for the exact report period and documented GA4 property, timezone and filters.'},
 {key:'engagement_rate',label:'Website engagement rate',unit:'percent',source:'GA4',definition:'Engaged sessions / sessions × 100 from the same period and GA4 export.'},
 {key:'organic_sessions',label:'Organic search sessions',unit:'count',source:'GA4',definition:'Organic Search session-channel-group sessions for the exact period. Do not combine user and session measures.'},
 {key:'tracked_enquiries',label:'Tracked enquiry completions',unit:'count',source:'GA4',definition:'Agreed successful enquiry-completion key-event count. Not button clicks or qualified business outcomes.'},
 {key:'search_clicks',label:'Search clicks',unit:'count',source:'Search Console',definition:'Web search clicks for the selected KEMSOR property, exact period and documented country/device filters.'},
 {key:'search_impressions',label:'Search impressions',unit:'count',source:'Search Console',definition:'Web search impressions from the same Search Console report and filters.'},
 {key:'search_ctr',label:'Search click-through rate',unit:'percent',source:'Search Console',definition:'Search clicks / search impressions × 100. A zero denominator is unavailable.'},
 {key:'operation_failures',label:'Recorded operation failures',unit:'count',source:'Operations log',direction:'lower',definition:'Failed housekeeping, retention and backup runs recorded during the period. Zero failures does not prove jobs ran or that security is clear.'},
];
export const sectionKeys=['executive','observations','root_causes','seo_review','technical_review','strategic_review'];
const fail=(message,status=422)=>{throw Object.assign(new Error(message),{status});};
export const text=(value,max,label,required=false)=>{if(value!==undefined&&typeof value!=='string')fail(`Enter valid ${label}.`);const s=(value||'').trim();if(s.length>max||required&&!s)fail(`Enter ${label} (maximum ${max} characters).`);return s;};
export function validDay(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
const iso=d=>d.toISOString().slice(0,10);
export function periodFor(cadence='weekly',date=iso(new Date())) {
 if(!['weekly','monthly','quarterly'].includes(cadence)||!validDay(date))fail('Choose a valid reporting cadence and date.');
 const start=new Date(date+'T00:00:00Z');
 if(cadence==='weekly')start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7);
 else {start.setUTCDate(1);if(cadence==='quarterly')start.setUTCMonth(Math.floor(start.getUTCMonth()/3)*3);}
 const next=new Date(start),previous=new Date(start);
 if(cadence==='weekly'){next.setUTCDate(next.getUTCDate()+7);previous.setUTCDate(previous.getUTCDate()-7);}
 else {const months=cadence==='monthly'?1:3;next.setUTCMonth(next.getUTCMonth()+months);previous.setUTCMonth(previous.getUTCMonth()-months);}
 const end=new Date(next);end.setUTCDate(end.getUTCDate()-1);
 return {cadence,start:iso(start),end:iso(end),next:iso(next),previous:iso(previous),inProgress:iso(end)>=iso(new Date())};
}
export function configuration(raw={}) {
 const categoryList=Array.isArray(raw.categories)?raw.categories:businessCategories;
 return {version:1,categories:categoryList,targets:raw.targets||{},amberPercent:raw.amberPercent??80,automaticDrafts:raw.automaticDrafts===true};
}
export function validateConfiguration(body) {
 const categories=Array.isArray(body.categories)?body.categories:[body.categories].filter(Boolean);
 if(!categories.length||categories.some(c=>!businessCategories.includes(c))||new Set(categories).size!==categories.length)fail('Select valid business enquiry categories.');
 const targets={};
 for(const cadence of ['weekly','monthly','quarterly']){
  targets[cadence]={};
  for(const metric of metricDefinitions){const raw=body[`${cadence}:${metric.key}`];if(raw===undefined||raw==='')continue;const value=Number(raw);if(typeof raw!=='string'||!Number.isFinite(value)||value<0||metric.unit==='percent'&&value>100||metric.unit==='count'&&!Number.isSafeInteger(value))fail(`Enter a valid ${cadence} target for ${metric.label}.`);targets[cadence][metric.key]=value;}
 }
 const amberPercent=Number(body.amberPercent);if(!Number.isFinite(amberPercent)||amberPercent<=0||amberPercent>=100)fail('Amber threshold must be between 0 and 100.');
 return {categories,targets,amberPercent,automaticDrafts:body.automaticDrafts==='on'};
}
const count=(value,label)=>{if(value===undefined||value==='')return null;if(typeof value!=='string'||!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))fail(`Enter a non-negative whole number for ${label}.`);return Number(value);};
export function validateInputs(body) {
 const analytics={},search={};
 for(const key of ['sessions','engaged_sessions','organic_sessions','tracked_enquiries'])analytics[key]=count(body[key],key.replaceAll('_',' '));
 for(const key of ['search_clicks','search_impressions'])search[key]=count(body[key],key.replaceAll('_',' '));
 for(const [object,key] of [[analytics,'ga4'],[search,'gsc']]){
  object.reference=text(body[`${key}_reference`],1000,`${key} report reference`);
  object.filters=text(body[`${key}_filters`],2000,`${key} property, timezone and filters`);
  object.extracted_on=text(body[`${key}_extracted_on`],10,`${key} extraction date`);
  if(object.extracted_on&&(!validDay(object.extracted_on)||object.extracted_on>iso(new Date())))fail('Enter a valid extraction date no later than today.');
  if(Object.values(object).some(v=>typeof v==='number')&&(!object.reference||!object.filters||!object.extracted_on))fail('Measured figures require a source reference, property/timezone/filters and extraction date.');
 }
 if(analytics.engaged_sessions!==null&&(analytics.sessions===null||analytics.engaged_sessions>analytics.sessions))fail('Engaged sessions require sessions and cannot exceed sessions.');
 if(analytics.organic_sessions!==null&&(analytics.sessions===null||analytics.organic_sessions>analytics.sessions))fail('Organic sessions require sessions and cannot exceed sessions.');
 if(search.search_clicks!==null&&(search.search_impressions===null||search.search_clicks>search.search_impressions))fail('Search clicks require impressions and cannot exceed impressions.');
 const result={analytics,search};for(const key of sectionKeys)result[key]=text(body[key],key==='executive'?1600:6000,key.replaceAll('_',' '));
 return result;
}
export function comparison(actual,previous,target,direction='higher',amberPercent=80){
 const change=actual===null||previous===null?null:actual-previous;
 const percentChange=change===null||previous===0?null:change/Math.abs(previous)*100;
 let rag='unrated';
 if(actual!==null&&target!==null&&target!==undefined){
  const good=direction==='lower'?actual<=target:actual>=target;
  const amber=direction==='lower'?target>0&&actual<=target/(amberPercent/100):actual>=target*(amberPercent/100);
  rag=good?'green':amber?'amber':'red';
 }
 return {actual,previous,target:target??null,change,percentChange,rag};
}
const rate=(n,d)=>n===null||d===null||d===0?null:n/d*100;
export async function periodValues(db,period,config){
 const marks=config.categories.map(()=>'?').join(',');
 // First milestones are evaluated at period end; subsequent reversals do not erase an achieved milestone.
 const records=await rows(db,`SELECT source,COUNT(*) AS total,SUM(qualified_at IS NOT NULL) AS qualified,SUM(converted_at IS NOT NULL) AS converted FROM (SELECT e.id,e.source,
 MIN(CASE WHEN h.to_status IN ('qualified','accepted','converted') THEN h.created_at END) AS qualified_at,
 MIN(CASE WHEN h.to_status='converted' THEN h.created_at END) AS converted_at
 FROM cms_enquiries e LEFT JOIN cms_enquiry_history h ON h.enquiry_id=e.id AND h.created_at<?
 WHERE e.created_at>=? AND e.created_at<? AND e.category IN (${marks}) AND e.status<>'spam'
 GROUP BY e.id,e.source) AS cohort GROUP BY source`,[period.next,period.start,period.next,...config.categories]);
 const leadCount=records.reduce((sum,r)=>sum+Number(r.total),0),qualified=records.reduce((sum,r)=>sum+Number(r.qualified),0),converted=records.reduce((sum,r)=>sum+Number(r.converted),0);
 const saved=(await rows(db,'SELECT i.*,u.name AS recorder FROM cms_kpi_inputs i LEFT JOIN cms_users u ON u.id=i.updated_by WHERE cadence=? AND period_start=?',[period.cadence,period.start]))[0];
 const input=saved?json(saved.payload):{},a=input.analytics||{},s=input.search||{};
 const operations=await rows(db,"SELECT job,status,COUNT(*) AS total,MAX(finished_at) AS last_finished FROM cms_operations_runs WHERE started_at>=? AND started_at<? GROUP BY job,status",[period.start,period.next]);
 const sourceBreakdown=records.map(r=>({label:r.source||'Unspecified',total:Number(r.total)}));
 return {values:{leads:leadCount,qualified,converted,qualification_rate:rate(qualified,leadCount),conversion_rate:rate(converted,leadCount),sessions:a.sessions??null,engagement_rate:rate(a.engaged_sessions??null,a.sessions??null),organic_sessions:a.organic_sessions??null,tracked_enquiries:a.tracked_enquiries??null,search_clicks:s.search_clicks??null,search_impressions:s.search_impressions??null,search_ctr:rate(s.search_clicks??null,s.search_impressions??null),operation_failures:operations.filter(o=>o.status==='failed').reduce((sum,o)=>sum+Number(o.total),0)},input,inputVersion:saved?.version||0,inputUpdatedAt:saved?.updated_at||null,inputRecorder:saved?.recorder||null,operations,sourceBreakdown};
}
export async function buildScorecard(db,period){
 const setting=(await rows(db,'SELECT * FROM cms_kpi_settings WHERE id=1'))[0];
 const config=configuration(setting?json(setting.configuration):{}),previousPeriod=periodFor(period.cadence,period.previous);
 const current=await periodValues(db,period,config),previous=await periodValues(db,previousPeriod,config);
 const metrics=metricDefinitions.map(m=>({...m,...comparison(current.values[m.key],previous.values[m.key],config.targets[period.cadence]?.[m.key],m.direction,config.amberPercent)}));
 const actions=await rows(db,'SELECT a.*,u.name AS owner FROM cms_kpi_actions a JOIN cms_users u ON u.id=a.owner_id WHERE a.cadence=? AND a.period_start=? ORDER BY a.due_date,a.id',[period.cadence,period.start]);
 const carried=await rows(db,"SELECT a.*,u.name AS owner FROM cms_kpi_actions a JOIN cms_users u ON u.id=a.owner_id WHERE a.period_start<? AND a.status IN ('open','in_progress') ORDER BY a.due_date,a.id LIMIT 200",[period.start]);
 const qualified=metrics.find(m=>m.key==='qualified'),converted=metrics.find(m=>m.key==='converted'),sessions=metrics.find(m=>m.key==='sessions');
 const outcomeWarning=sessions.change>0&&(qualified.change<0||converted.change<0)?'Traffic increased while qualified or converted enquiries declined. Traffic growth alone is not an outcome success.':null;
 const missing=metrics.filter(m=>m.actual===null).map(m=>m.label);
 return {schemaVersion:1,generatedAt:new Date().toISOString(),period,previousPeriod,configuration:config,configurationVersion:setting?.version||1,metrics,...current,actions,carried,outcomeWarning,missing};
}
export const display=(value,unit='count')=>value===null||value===undefined?'Unavailable':`${Number(value).toLocaleString('en-IN',{maximumFractionDigits:unit==='count'?0:2})}${unit==='percent'?'%':''}`;
