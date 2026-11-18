import test from 'node:test';
import assert from 'node:assert/strict';
import {workflowFilters,workflowDetails,workflowChanges,workflowReturn,workflowRecordUrl,followUpState,followUpOrder} from '../src/follow-up.js';
import {tableView} from '../src/admin-tables.js';
test('Ownership, priority and date filters bind staff IDs and exclude completed records',()=>{
 const filters=workflowFilters({owner:'me',priority:'urgent',due:'overdue'},42,'enquiry');assert.deepEqual(filters.params,[42,'urgent']);assert.ok(filters.where.includes('follow_up_at<UTC_TIMESTAMP()'));assert.ok(filters.where.includes("'converted'"));assert.ok(!filters.withoutDue.includes('UTC_TIMESTAMP'));
 const upcoming=workflowFilters({due:'upcoming'},42,'application');assert.ok(upcoming.where.includes('INTERVAL 7 DAY'));assert.ok(upcoming.where.includes("'rejected'"));
 const invalid=workflowFilters({owner:'42 OR 1=1',priority:'bad',due:'bad'},42,'enquiry');assert.equal(invalid.where,'1=1');assert.deepEqual(invalid.params,[]);
});
test('Partial review submissions retain ownership, next action and scheduling',()=>{
 const old={assigned_to:9,priority:'high',next_action:'Call the applicant',follow_up_at:'2026-11-19 09:30:00',tags:'Interview',source:'/contact/'};
 const fields=workflowDetails({status:'reviewing'},old);assert.equal(fields.assigned,9);assert.equal(fields.priority,'high');assert.equal(fields.nextAction,old.next_action);assert.equal(fields.followUp,old.follow_up_at);assert.deepEqual(workflowChanges(old,fields),{});
 const changed=workflowDetails({assigned_to:'',next_action:'  Review portfolio  ',follow_up_at:''},old);assert.equal(changed.assigned,null);assert.equal(changed.nextAction,'Review portfolio');assert.equal(changed.followUp,null);assert.deepEqual(Object.keys(workflowChanges(old,changed)).sort(),['assigned_to','follow_up_at','next_action']);
 assert.throws(()=>workflowDetails({assigned_to:'-2'}),/valid staff/);assert.throws(()=>workflowDetails({next_action:'x'.repeat(501)}),/500/);assert.throws(()=>workflowDetails({follow_up_at:'2026-02-30T12:00'}),/real calendar/);
});
test('Return links preserve filters without allowing cross-resource or external redirects',()=>{
 const list='/admin/enquiries?section=all&owner=me&due=overdue&p=2';assert.equal(workflowReturn(list,'enquiry'),list);
 for(const value of ['https://evil.test/admin/enquiries','//evil.test','/admin/enquiries/12','/admin/applications?owner=me'])assert.equal(workflowReturn(value,'enquiry'),'/admin/enquiries?section=all');
 const url=new URL(workflowRecordUrl('enquiry',12,list,true),'http://local');assert.equal(url.searchParams.get('return_to'),list);assert.equal(url.searchParams.get('saved'),'1');assert.equal(workflowRecordUrl('application',2,undefined,true),'/admin/applications/2?saved=1');
});
test('Due labels use UTC and completed records never appear overdue',()=>{
 const now=new Date('2026-11-17T10:00:00Z');assert.equal(followUpState({status:'new',follow_up_at:'2026-11-17 09:59:00'},'enquiry',now).key,'overdue');assert.equal(followUpState({status:'new',follow_up_at:'2026-11-17 10:01:00'},'enquiry',now).key,'upcoming');assert.equal(followUpState({status:'closed',follow_up_at:'2020-01-01 00:00:00'},'enquiry',now).key,'complete');assert.equal(followUpState({status:'reviewing',follow_up_at:null},'application',now).key,'unscheduled');assert.ok(followUpOrder('enquiry').includes('9999-12-31'));
});
test('Workflow filters appear in removable chips and reset while section and sort remain',()=>{
 const table=tableView({path:'/admin/enquiries',query:{}},50,{follow_up:'follow_up_at'},'follow_up',{section:'all',owner:'me',due:'overdue',priority:'urgent'},'asc');assert.equal(table.dir,'asc');assert.equal(table.activeFilters.find(filter=>filter.key==='owner').value,'Assigned to me');const reset=new URL(table.resetLink,'http://local');assert.equal(reset.searchParams.get('section'),'all');assert.equal(reset.searchParams.has('owner'),false);assert.equal(reset.searchParams.has('due'),false);assert.equal(reset.searchParams.has('priority'),false);
});
