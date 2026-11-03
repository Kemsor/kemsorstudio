export const categories={business:'Business',partnerships:'Strategic partnerships / co-production',press:'Press & media',careers:'Careers / work with us',production:'Production services',copyright:'Copyright / anti-piracy',general:'General / other',creative:'Creative enquiry',brand:'Marketing / brand collaboration',distribution:'Distribution / OTT partnership',financing:'Co-production / financing',international:'International production services',partner_registration:'Production partner registration'};
export const statuses=['new','assigned','in_review','information_required','contacted','meeting_scheduled','qualified','accepted','converted','rejected','closed','spam'];
export function workflowFields(body){
 const priority=body.priority||'normal',tags=typeof body.tags==='string'?body.tags.trim():'',source=typeof body.source==='string'?body.source.trim():'website';
 if(!['low','normal','high','urgent'].includes(priority)||tags.length>500||source.length>200)throw Object.assign(new Error('Check priority, tags and source.'),{status:422});
 let followUp=null;
 if(body.follow_up_at){
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(body.follow_up_at)||Number.isNaN(Date.parse(body.follow_up_at+'Z')))throw Object.assign(new Error('Choose a valid follow-up date and time (UTC).'),{status:422});
  if(new Date(body.follow_up_at+'Z').toISOString().slice(0,16)!==body.follow_up_at)throw Object.assign(new Error('Choose a real calendar date for follow-up.'),{status:422});
  followUp=body.follow_up_at.replace('T',' ')+':00';
 }
 return {priority,tags,source,followUp};
}
