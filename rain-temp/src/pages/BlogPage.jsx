import React from 'react';
import { PageHero, PageCTA, SectionHeading, TextLink } from '../PageUI';
import { notes as fallbackNotes } from '../productionNotes';
import { CmsText, useCms } from '../CmsContent';
import '../blog.css';

const images = ['office-scene', 'action-scene', 'detective-scene'];
const descriptions = ['A dramatic scene with a character seated at a desk.', 'A performer in tactical costume on a film set.', 'A character in a period uniform in a dramatic scene.'];

export default function BlogPage() {
  const { entries, connected } = useCms();
  const notes = connected ? entries.filter(entry => entry.type === 'blog').map(entry => ({ ...entry, id: entry.slug, category: entry.metadata?.category || 'STUDIO NOTES', introduction: entry.body, sections: [], cms: true })) : fallbackNotes;
  return <>
    <PageHero eyebrow="BLOG / BEHIND THE FRAME" title="Stories about" accent="making stories." description="Ideas, practical notes and a closer look at the work that brings a production to screen." image="/assets/stills/office-scene.webp" alt={descriptions[0]} caption="FROM THE FIRST IDEA TO THE FINISHED FRAME" />
    <section className="page-section" id="blog-posts">
      <SectionHeading index="01" label="THE PRODUCTION JOURNAL" title={<>Behind every frame,<br />a thousand decisions.</>} description="Explore development, planning and the next chapter after the shoot." />
      <div className="blog-grid">{notes.map((note, index) => <article key={note.id} className="blog-card" data-reveal>
        <a href={`#${note.id}`} className="blog-card-image" aria-label={`Read: ${note.title}`}><img src={note.image_url || `/assets/stills/${images[index % images.length]}.webp`} alt={note.image_alt || descriptions[index % images.length]} width="1280" height="720" loading="lazy" decoding="async" /></a>
        <p className="page-eyebrow">{note.category}</p><h2><a href={`#${note.id}`}>{note.title}</a></h2><p>{note.summary}</p><TextLink href={`#${note.id}`}>Read the story</TextLink>
      </article>)}</div>
      {!notes.length && <p>New stories will appear here as the studio publishes them.</p>}
    </section>
    <section className="page-section" aria-label="Blog articles">{notes.map(note => <article key={note.id} id={note.id} className="editorial-note page-split" data-reveal>
      <div className="page-copy"><p className="page-eyebrow">{note.category}</p><h2>{note.title}</h2><TextLink href="#blog-posts">All stories</TextLink></div>
      <div className="page-copy">{note.cms ? <CmsText text={note.introduction} /> : <p className="page-lead">{note.introduction}</p>}{note.sections.map(([title, copy]) => <section key={title}><h3>{title}</h3><p>{copy}</p></section>)}</div>
    </article>)}</section>
    <PageCTA eyebrow="YOUR NEXT STORY" title={<>An idea worth<br />putting into words.</>} description="Explore the support your production needs and prepare a brief for its next chapter." href="/contact/#project-brief">Prepare your brief</PageCTA>
  </>;
}
