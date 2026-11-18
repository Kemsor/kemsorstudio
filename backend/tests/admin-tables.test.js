import test from 'node:test';
import assert from 'node:assert/strict';
import ejs from 'ejs';
import {tableView} from '../src/admin-tables.js';

const view=(query={},filters={},total=300)=>tableView({path:'/admin/content',query},total,{title:'title',updated:'updated_at'},'updated',filters);
const params=link=>new URL(link,'http://localhost').searchParams;

test('Removing one filter resets pagination and retains the other filters and content context',()=>{
 const table=view({p:4,sort:'title',dir:'asc',per_page:50},{type:'blog',page:'home',q:'studio_news',status:'draft'});
 const search=table.activeFilters.find(filter=>filter.key==='q');
 assert.equal(search.value,'studio_news');
 const query=params(search.removeLink);
 assert.equal(query.get('p'),'1');assert.equal(query.get('type'),'blog');assert.equal(query.get('page'),'home');
 assert.equal(query.get('status'),'draft');assert.equal(query.get('sort'),'title');assert.equal(query.get('per_page'),'50');assert.equal(query.has('q'),false);
 const reset=params(table.resetLink);
 assert.equal(reset.has('q'),false);assert.equal(reset.has('status'),false);assert.equal(reset.get('type'),'blog');assert.equal(reset.get('page'),'home');
});

test('Clearing enquiry filters preserves its section, but removes role and category filters',()=>{
 const table=tableView({path:'/admin/enquiries',query:{}},0,{received:'created_at'},'received',{section:'other',q:'hello',status:'in_review',category:'general',role:'artist'});
 assert.equal(table.activeFilters.find(filter=>filter.key==='status').value,'in review');
 assert.deepEqual([...params(table.resetLink).keys()],['section','sort','dir','per_page','p']);
 assert.equal(params(table.resetLink).get('section'),'other');assert.equal(table.from,0);assert.equal(table.to,0);
});

test('Active filter labels escape user input and offer recovery on empty results',async()=>{
 const table=view({}, {type:'blog',q:'<img src=x onerror=alert(1)>'},0);
 const html=await ejs.renderFile(new URL('../views/table-tools.ejs',import.meta.url).pathname,{table,user:{id:1},resource:'content',csrf:'test',actions:[['draft','Move to draft']]});
 assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));assert.ok(html.includes('Clear filters'));assert.ok(html.includes('0</strong> matching records'));
});

test('Pagination stays bounded for large tables and preserves filters in every link',async()=>{
 const table=view({p:50},{type:'blog',q:'studio'},2500);
 const html=await ejs.renderFile(new URL('../views/table-pagination.ejs',import.meta.url).pathname,{table});
 assert.equal((html.match(/aria-label="Page /g)||[]).length,5);
 assert.ok(html.includes('aria-current="page"'));assert.ok(html.includes('rel="prev"'));assert.ok(html.includes('rel="next"'));
 assert.ok(html.includes('q=studio'));assert.ok(html.includes('type=blog'));
});
