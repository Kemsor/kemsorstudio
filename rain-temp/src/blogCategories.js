// Structured saved categories, with support for older single-category posts.
export function blogCategoryNames(metadata={}){
 const values=Array.isArray(metadata?.categories)?metadata.categories:[metadata?.category];
 return [...new Set(values.filter(value=>typeof value==='string').map(value=>value.trim()).filter(Boolean))];
}
