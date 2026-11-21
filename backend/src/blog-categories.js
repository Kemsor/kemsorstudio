// Compatibility exports for the original blog-category module.
import {categoryChoices,categoryMetadata,publishingCategoriesRouter} from './publishing-categories.js';
export {categoryName} from './publishing-categories.js';
export const blogCategoryChoices=(db,metadata={})=>categoryChoices(db,'blog',metadata);
export const blogCategoryMetadata=(db,body,previous=null)=>categoryMetadata(db,'blog',body,previous);
export const blogCategoriesRouter=publishingCategoriesRouter;
