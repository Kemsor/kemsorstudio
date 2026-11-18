import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardShortcuts,activityTarget,describeActivity} from '../src/dashboard-presentation.js';
import {enquiryListScope,followUpStatuses} from '../src/enquiry-options.js';
const user=role=>({id:7,role});
test('Dashboard shortcuts expose only role-appropriate destinations',()=>{
 const admin=dashboardShortcuts(user('admin')).map(item=>item[2]);assert.ok(admin.includes('/admin/talent?status=pending'));assert.ok(admin.includes('/admin/applications?status=new'));
 const editor=dashboardShortcuts(user('editor')).map(item=>item[2]);assert.ok(editor.every(href=>href.startsWith('/admin/content')||href==='/admin/media'));
 const manager=dashboardShortcuts(user('enquiry_manager')).map(item=>item[2]);assert.ok(manager.every(href=>href.startsWith('/admin/enquiries')||href.startsWith('/admin/applications')));assert.ok(manager.some(href=>href.includes('section=all&status=follow_up')));
});
test('Activity links stay within role permissions and reject unsafe record identifiers',()=>{
 assert.equal(activityTarget({target_type:'content',target_id:'12',action:'save'},user('editor')).href,'/admin/content/12');
 assert.equal(activityTarget({target_type:'content',target_id:'12',action:'delete'},user('editor')).href,'/admin/content?type=all');
 assert.equal(activityTarget({target_type:'enquiry',target_id:'12',action:'update'},user('editor')).href,null);
 assert.equal(activityTarget({target_type:'talent',target_id:'12',action:'review'},user('enquiry_manager')).href,null);
 assert.equal(activityTarget({target_type:'content',target_id:'../../settings',action:'save'},user('editor')).href,null);
 assert.equal(activityTarget({target_type:'user',target_id:'7',action:'login'},user('editor')).href,'/admin/profile');
});
test('Activity describes the actor, action and record without fabricating an actor',()=>{
 const event={target_type:'content',target_id:'12',action:'publish',name:'Asha'};
 const item=describeActivity(event,user('editor'),activityTarget(event,user('editor')),'Studio story');
 assert.equal(item.actor,'Asha');assert.equal(item.actionLabel,'Published');assert.equal(item.recordTitle,'Studio story');
 assert.equal(describeActivity({...event,name:null},user('admin'),{label:'Workspace'},null).actor,'System');
});
test('Enquiry list and export scopes include all sources and every active follow-up status',()=>{
 const all=enquiryListScope({section:'all',status:'new'});assert.equal(all.section,'all');assert.ok(all.where.startsWith('1=1'));assert.deepEqual(all.params,['new','new']);
 const follow=enquiryListScope({section:'all',status:'follow_up'});assert.deepEqual(follow.params,followUpStatuses);assert.ok(follow.params.includes('assigned'));assert.ok(follow.params.includes('accepted'));assert.ok(!follow.params.includes('closed'));assert.ok(!follow.params.includes('new'));
 const safe=enquiryListScope({section:'unsafe',status:'unsafe'});assert.equal(safe.section,'contact');assert.equal(safe.state,'');assert.ok(!safe.where.includes('unsafe'));
});
