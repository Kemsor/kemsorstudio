import {cmsText,cmsData} from "../siteContent.js";
import StudioImage from '../StudioImage';
import MotionHeading, { MotionCopy } from '../TextMotion';
import { EditorialHero } from '../EditorialPage';
import React, { useState } from 'react';
import { TextLink } from '../PageUI';
import { CmsText, useCms } from '../CmsContent';
import '../blog.css';

const images = ['office-scene', 'action-scene', 'detective-scene'];
const descriptions = cmsData(()=>([cmsText("BlogPage","87a9244b69169110","A dramatic scene with a character seated at a desk."), cmsText("BlogPage","e6adf074b2a43545","A performer in tactical costume on a film set."), cmsText("BlogPage","5273d48152efb864","A character in a period uniform in a dramatic scene.")]));

export default function BlogPage() {
  const { entries, connected } = useCms();
  const notes = connected ? entries.filter(entry => entry.type === 'blog').map(entry => ({ ...entry, id: entry.slug, category: entry.metadata?.category || cmsText("BlogPage","a35d78cddafdbec1","STUDIO NOTES"), introduction: entry.body, sections: [], cms: true })) : [];
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('all');
  const [sort,setSort] = useState('newest');
  const categories = [...new Set(notes.map(note => note.category))].sort();
  const filtered = notes.filter(note => (category === 'all' || note.category === category) && `${note.title} ${note.summary} ${note.category}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? String(a.published_at || '').localeCompare(String(b.published_at || '')) : String(b.published_at || '').localeCompare(String(a.published_at || '')));
  const reset = () => {setSearch('');setCategory('all');setSort('newest');};
  const requestedPost = new URLSearchParams(location.search).get('post');
  if (requestedPost) {
    const note = notes.find(item => item.id === requestedPost);
    return <section className="page-section blog-article-page"><TextLink href="/blog/">{cmsText("BlogPage","d11e117defee9217","All stories")}</TextLink>{note ? <article className="editorial-note page-split"><div className="page-copy"><p className="page-eyebrow">{note.category}</p><MotionHeading as="h1">{note.title}</MotionHeading></div><div className="page-copy">{note.cms ? <CmsText richText={note.metadata?.rich_text} text={note.introduction}/> : <p className="page-lead">{note.introduction}</p>}{note.sections.map(([title,copy])=><section key={title}><MotionHeading as="h2">{title}</MotionHeading><p>{copy}</p></section>)}</div></article> : <MotionCopy role="status">{connected ? 'This post is unavailable.' : 'Loading the story…'}</MotionCopy>}</section>;
  }
  return <>
    <EditorialHero compact page="blog" eyebrow={cmsText("BlogPage","6741e3a71727c395","STUDIO NOTES")} title={cmsText("BlogPage","af1cd61f6115bfa5","Blog")}/>
    <section className="page-section" id="blog-posts">
      <form className="blog-filters" role="search" aria-label="Filter blog posts" onSubmit={event=>event.preventDefault()}>
       <label>{cmsText("BlogPage","8939192ce93fc3ae","Search posts")}<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search titles, topics or summaries" /></label>
       <label>{cmsText("BlogPage","d06c4fb56c9a0dec","Category")}<select value={category} onChange={event=>setCategory(event.target.value)}><option value="all">{cmsText("BlogPage","3c1e465eeabc8f5d","All categories")}</option>{categories.map(item=><option value={item} key={item}>{item}</option>)}</select></label>
       <label>{cmsText("BlogPage","b08395a8735a3211","Sort by")}<select value={sort} onChange={event=>setSort(event.target.value)}><option value="newest">{cmsText("BlogPage","581566d2e5b55942","Newest first")}</option><option value="oldest">{cmsText("BlogPage","71ddf735da12f102","Oldest first")}</option><option value="title">{cmsText("BlogPage","262baf94cf27dcd9","Title A to Z")}</option></select></label>
       <button type="button" onClick={reset}>{cmsText("BlogPage","49e587270783cbf3","Reset filters")}</button>
      </form>
      <p className="blog-result-count" role="status">{filtered.length} {filtered.length===1?'post':'posts'}{category!=='all'?` in ${category}`:''}</p>
      <div className="blog-grid">{filtered.map((note, index) => <article key={note.id} className="blog-card" data-reveal>
        <a href={`/blog/?post=${encodeURIComponent(note.id)}`} className="blog-card-image" aria-label={`Read: ${note.title}`}><StudioImage mediaSlot="BlogPage-1" src={note.image_url || `/assets/stills/${images[index % images.length]}.webp`} alt={note.image_alt || descriptions[index % images.length]} width="1280" height="720" loading="lazy" decoding="async" /></a>
        <p className="page-eyebrow">{note.category}</p><MotionHeading as="h2"><a href={`/blog/?post=${encodeURIComponent(note.id)}`}>{note.title}</a></MotionHeading><p>{note.summary}</p><TextLink href={`/blog/?post=${encodeURIComponent(note.id)}`}>{cmsText("BlogPage","794bb4107c2cd6e8","Read the story")}</TextLink>
      </article>)}</div>
      {!filtered.length && <div className="blog-no-results"><MotionHeading as="h2">{notes.length?'No matching posts':'No posts yet'}</MotionHeading><MotionCopy>{notes.length?'Try another search or reset the filters.':'New stories will appear here as the studio publishes them.'}</MotionCopy>{notes.length>0 && <button type="button" onClick={reset}>{cmsText("BlogPage","2b2cad0b6c4f9c4d","Show all posts")}</button>}</div>}
    </section>
  </>;
}
