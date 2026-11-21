import {test} from 'node:test';
import assert from 'node:assert/strict';
import {careerFields,careerOptions} from '../src/career-fields.js';
test('Employment types and work arrangements are separate and canonical',()=>{
 assert.deepEqual(careerFields({role:'part time',work_arrangement:'HYBRID'}),{role:'Part-time',work_arrangement:'Hybrid'});
 for(const role of careerOptions.employmentTypes)assert.equal(careerFields({role}).role,role);
 for(const work_arrangement of careerOptions.workArrangements)assert.equal(careerFields({work_arrangement}).work_arrangement,work_arrangement);
 assert.throws(()=>careerFields({role:'Hybrid'}),error=>error.status===422);
 assert.throws(()=>careerFields({work_arrangement:'Freelance'}),error=>error.status===422);
});
test('Career choices reject unknown values while preserving unchanged legacy employment types',()=>{
 for(const body of [{role:'Anything I type'},{role:['Full-time']},{work_arrangement:{remote:true}}])assert.throws(()=>careerFields(body),error=>error.status===422);
 assert.deepEqual(careerFields({}, {role:'Older custom engagement',work_arrangement:'Remote'}),{role:'Older custom engagement',work_arrangement:'Remote'});
 assert.equal(careerFields({role:'Older custom engagement'}, {role:'Older custom engagement'}).role,'Older custom engagement');
 assert.deepEqual(careerFields({role:'',work_arrangement:''},{role:'Freelance',work_arrangement:'Remote'}),{role:'',work_arrangement:''});
});
