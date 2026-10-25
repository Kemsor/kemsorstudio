import MotionHeading, { MotionCopy } from '../TextMotion';
import { EditorialHero } from '../EditorialPage';
import React, { useState } from 'react';
import { TextLink } from '../PageUI';
import { CmsText, useCms } from '../CmsContent';
import '../blog.css';

const images = ['office-scene', 'action-scene', 'detective-scene'];
const descriptions = ['A dramatic scene with a character seated at a desk.', 'A performer in tactical costume on a film set.', 'A character in a period uniform in a dramatic scene.'];

export default function BlogPage() {
  const { entries, connected } = useCms();
  const notes = connected ? entries.filter(entry => entry.type === 'blog').map(entry => ({ ...entry, id: entry.slug, category: entry.metadata?.category || 'STUDIO NOTES', introduction: entry.body, sections: [], cms: true })) : [];
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('all');
  const [sort,setSort] = useState('newest');
  const categories = [...new Set(notes.map(note => note.category))].sort();
  const filtered = notes.filter(note => (category === 'all' || note.category === category) && `${note.title} ${note.summary} ${note.category}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? String(a.published_at || '').localeCompare(String(b.published_at || '')) : String(b.published_at || '').localeCompare(String(a.published_at || '')));
  const reset = () => {setSearch('');setCategory('all');setSort('newest');};
  const requestedPost = new URLSearchParams(location.search).get('post');
  if (requestedPost) {
    const note = notes.find(item => item.id === requestedPost);
    return <section className="page-section blog-article-page"><TextLink href="/blog/">All stories</TextLink>{note ? <article className="editorial-note page-split"><div className="page-copy"><p className="page-eyebrow">{note.category}</p><MotionHeading as="h1">{note.title}</MotionHeading></div><div className="page-copy">{note.cms ? <CmsText text={note.introduction}/> : <p className="page-lead">{note.introduction}</p>}{note.sections.map(([title,copy])=><section key={title}><MotionHeading as="h2">{title}</MotionHeading><p>{copy}</p></section>)}</div></article> : <MotionCopy role="status">{connected ? 'This post is unavailable.' : 'Loading the story…'}</MotionCopy>}</section>;
  }
  return <>
    <EditorialHero compact page="blog" eyebrow="STUDIO NOTES" title="Blog"/>
    <section className="page-section" id="blog-posts">
      <form className="blog-filters" role="search" aria-label="Filter blog posts" onSubmit={event=>event.preventDefault()}>
       <label>Search posts<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search titles, topics or summaries" /></label>
       <label>Category<select value={category} onChange={event=>setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(item=><option value={item} key={item}>{item}</option>)}</select></label>
       <label>Sort by<select value={sort} onChange={event=>setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></label>
       <button type="button" onClick={reset}>Reset filters</button>
      </form>
      <p className="blog-result-count" role="status">{filtered.length} {filtered.length===1?'post':'posts'}{category!=='all'?` in ${category}`:''}</p>
      <div className="blog-grid">{filtered.map((note, index) => <article key={note.id} className="blog-card" data-reveal>
        <a href={`/blog/?post=${encodeURIComponent(note.id)}`} className="blog-card-image" aria-label={`Read: ${note.title}`}><img src={note.image_url || `/assets/stills/${images[index % images.length]}.webp`} alt={note.image_alt || descriptions[index % images.length]} width="1280" height="720" loading="lazy" decoding="async" /></a>
        <p className="page-eyebrow">{note.category}</p><MotionHeading as="h2"><a href={`/blog/?post=${encodeURIComponent(note.id)}`}>{note.title}</a></MotionHeading><p>{note.summary}</p><TextLink href={`/blog/?post=${encodeURIComponent(note.id)}`}>Read the story</TextLink>
      </article>)}</div>
      {!filtered.length && <div className="blog-no-results"><MotionHeading as="h2">{notes.length?'No matching posts':'No posts yet'}</MotionHeading><MotionCopy>{notes.length?'Try another search or reset the filters.':'New stories will appear here as the studio publishes them.'}</MotionCopy>{notes.length>0 && <button type="button" onClick={reset}>Show all posts</button>}</div>}
    </section>
  </>;
}
