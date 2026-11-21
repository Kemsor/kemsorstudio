import {test} from 'node:test';
import assert from 'node:assert/strict';
import {categoryName,blogCategoryMetadata} from '../src/blog-categories.js';
import {blogCategoryNames} from '../../rain-temp/src/blogCategories.js';
test('Category creation normalizes spacing and rejects empty, oversized and invalid names',()=>{
 assert.equal(categoryName('  Behind   the scenes  '),'Behind the scenes');
 for(const input of ['', '   ', 'x'.repeat(101),{},'bad\u0000name'])assert.throws(()=>categoryName(input),error=>error.status===422);
});
test('Blog saves reject arbitrary category text and malformed selection IDs before querying',async()=>{
 const db={execute(){throw Error('Unexpected query');}};
 for(const body of [{category:'Random free text'},{categories_present:'1',category_ids:'nope'},{categories_present:'1',category_ids:['1',{}]},{categories_present:'1',category_ids:Array(21).fill('1')}])await assert.rejects(()=>blogCategoryMetadata(db,body),error=>error.status===422);
 assert.deepEqual(await blogCategoryMetadata(db,{categories_present:'1'}),{category_ids:[],categories:[],category:''});
});
test('Public categories include every saved selection without inventing a default',()=>{
 assert.deepEqual(blogCategoryNames({categories:['Craft','Production','Craft']}),['Craft','Production']);assert.deepEqual(blogCategoryNames({category:'Older category'}),['Older category']);assert.deepEqual(blogCategoryNames({categories:[],category:'Old label'}),[]);assert.deepEqual(blogCategoryNames({}),[]);
});
