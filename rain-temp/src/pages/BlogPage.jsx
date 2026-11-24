import {cmsText} from "../siteContent.js";
import StudioImage from '../StudioImage';
import MotionHeading, { MotionCopy } from '../TextMotion';
import { EditorialHero } from '../EditorialPage';
import React, { useState } from 'react';
import { CTA, TextLink } from '../PageUI';
import { CmsText, useCms } from '../CmsContent';
import '../blog.css';
import {blogCategoryNames} from '../blogCategories.js';

const storyImages = ['office-scene', 'action-scene', 'detective-scene'];


export default function BlogPage() {
  const { entries, connected } = useCms();
  const notes = connected ? entries.filter(entry => entry.type === 'blog').map(entry => ({ ...entry, id: entry.slug, categories:blogCategoryNames(entry.metadata), category:blogCategoryNames(entry.metadata).join(' · '), introduction: entry.body, sections: [], cms: true })) : [];
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('all');
  const [sort,setSort] = useState('newest');
  const categories = [...new Set(notes.flatMap(note => note.categories))].sort();
  const filtered = notes.filter(note => (category === 'all' || note.categories.includes(category)) && `${note.title} ${note.summary} ${note.category}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? String(a.published_at || '').localeCompare(String(b.published_at || '')) : String(b.published_at || '').localeCompare(String(a.published_at || '')));
  const reset = () => {setSearch('');setCategory('all');setSort('newest');};
  const requestedPost = new URLSearchParams(location.search).get('post');
  if (requestedPost) {
    const note = notes.find(item => item.id === requestedPost);
    return <section className="page-section blog-article-page"><TextLink href="/blog/">{cmsText("BlogPage","d11e117defee9217","All stories")}</TextLink>{note ? <article className="editorial-note page-split"><div className="page-copy"><p className="page-eyebrow">{note.category}</p><MotionHeading as="h1">{note.title}</MotionHeading>{note.summary && <p className="page-lead">{note.summary}</p>}</div><div className="page-copy">{note.cms ? <CmsText richText={note.metadata?.rich_text} text={note.introduction}/> : <p className="page-lead">{note.introduction}</p>}{note.sections.map(([title,copy])=><section key={title}><MotionHeading as="h2">{title}</MotionHeading><p>{copy}</p></section>)}</div></article> : <MotionCopy role="status">{connected ? 'This post is unavailable.' : 'Loading the story…'}</MotionCopy>}</section>;
  }
  return <div className="blog-page">
    <EditorialHero compact page="blog" eyebrow={cmsText("BlogPage","6741e3a71727c395","STUDIO NOTES")} title={cmsText("BlogPage","af1cd61f6115bfa5","Blog")} caption="FROM THE STUDIO" description="Stories, perspectives and updates from Kemsor Studios. Follow the people, ideas and work behind our films." actions={<>{notes.length > 0 && <CTA href="#blog-posts">Explore stories</CTA>}<TextLink href="/about/">Meet the studio</TextLink></>} foot={<div className="blog-hero-foot"><span>People and craft</span><span>Production stories</span><span>Studio updates</span></div>}/>
    <section className="page-section" id="blog-posts">
      <div className="blog-section-heading"><div><p className="page-eyebrow">THE JOURNAL</p><MotionHeading as="h2">Latest stories</MotionHeading></div><p>News and notes from behind the scenes.</p></div>
      {!connected ? <p className="blog-result-count" role="status">Loading stories…</p> : !notes.length ? (
        <div className="blog-no-results">
          <h3>Coming soon</h3>
          <p>We’ll share stories from behind the scenes when our first posts are ready.</p>
        </div>
      ) : <>
        <form className="blog-filters" role="search" aria-label="Filter blog posts" onSubmit={event=>event.preventDefault()}>
         <label>{cmsText("BlogPage","8939192ce93fc3ae","Search posts")}<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search titles, topics or summaries" /></label>
         <label>{cmsText("BlogPage","d06c4fb56c9a0dec","Category")}<select value={category} onChange={event=>setCategory(event.target.value)}><option value="all">{cmsText("BlogPage","3c1e465eeabc8f5d","All categories")}</option>{categories.map(item=><option value={item} key={item}>{item}</option>)}</select></label>
         <label>{cmsText("BlogPage","b08395a8735a3211","Sort by")}<select value={sort} onChange={event=>setSort(event.target.value)}><option value="newest">{cmsText("BlogPage","581566d2e5b55942","Newest first")}</option><option value="oldest">{cmsText("BlogPage","71ddf735da12f102","Oldest first")}</option><option value="title">{cmsText("BlogPage","262baf94cf27dcd9","Title A to Z")}</option></select></label>
         <button type="button" onClick={reset}>{cmsText("BlogPage","49e587270783cbf3","Reset filters")}</button>
        </form>
        <p className="blog-result-count" role="status">{filtered.length} {filtered.length===1?'post':'posts'}{category!=='all'?` in ${category}`:''}</p>
        <div className="blog-grid">{filtered.map((note) => <article key={note.id} className="blog-card" data-reveal>
          <a href={`/blog/?post=${encodeURIComponent(note.id)}`} className="blog-card-image" aria-label={`Read: ${note.title}`}><StudioImage src={note.image_url || `/assets/stills/${storyImages[notes.findIndex(item => item.id === note.id) % storyImages.length]}.webp`} alt={note.image_alt || note.title} width="1280" height="720" loading="lazy" decoding="async" /></a>
          <div className="blog-card-copy"><p className="page-eyebrow">{note.category}</p><MotionHeading as="h2"><a href={`/blog/?post=${encodeURIComponent(note.id)}`}>{note.title}</a></MotionHeading><p>{note.summary}</p><TextLink href={`/blog/?post=${encodeURIComponent(note.id)}`}>{cmsText("BlogPage","794bb4107c2cd6e8","Read the story")}</TextLink></div>
        </article>)}</div>
        {!filtered.length && <div className="blog-no-results"><MotionHeading as="h3">No matching posts</MotionHeading><MotionCopy>Try another search or reset the filters.</MotionCopy><button type="button" onClick={reset}>{cmsText("BlogPage","2b2cad0b6c4f9c4d","Show all posts")}</button></div>}
      </>}
    </section>
  </div>;
}
