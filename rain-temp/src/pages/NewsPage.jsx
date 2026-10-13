import React from 'react';
import { PageHero, SectionHeading, PageCTA, TextLink } from '../PageUI.jsx';

import { notes } from '../productionNotes';
import { CmsEntries } from '../CmsContent';

export function NewsPage() {
  return <>
    <PageHero eyebrow="NEWSROOM / STUDIO NOTES" title="A closer look" accent="at the work." description="Notes on the process, the practical details and the conversations that bring stories to screen." image="/assets/stills/office-scene.webp" alt="A character seated across a desk in a supplied dramatic scene." caption="SUPPLIED SCREEN IMAGE / IN CONVERSATION" />
    <CmsEntries type="news" heading="Studio updates." />
    <section className="page-section" id="studio-notes">
      <SectionHeading index="01" label="FROM THE STUDIO" title={<>Useful things<br />to start with.</>} description="Three practical notes for a project’s next chapter." />
      <div className="page-principles">{notes.map(note => <article className="page-card" key={note.id} data-reveal><p className="page-eyebrow">{note.category}</p><h3>{note.title}</h3><p>{note.summary}</p><TextLink href={`#${note.id}`}>Read the note</TextLink></article>)}</div>
    </section>
    <section className="page-section" aria-label="Production notes">{notes.map(note => <article className="editorial-note page-split" id={note.id} key={note.id} data-reveal>
      <div className="page-copy"><p className="page-eyebrow">{note.category}</p><h2>{note.title}</h2></div>
      <div className="page-copy"><p className="page-lead">{note.introduction}</p>{note.sections.map(([title, copy]) => <section key={title}><h3>{title}</h3><p>{copy}</p></section>)}<TextLink href="#studio-notes">Back to the notes</TextLink></div>
    </article>)}</section>
    <section className="page-section page-grid" id="press-media" data-reveal>
      <div className="page-copy"><p className="page-eyebrow">PRESS & MEDIA</p><h2>Information<br />from the studio.</h2><p className="page-lead">Press materials and a direct media contact will be published here when they are available.</p><p>For now, use the downloadable brief to record the publication, subject, material requested and your deadline. Keep the copy ready for a future conversation.</p><TextLink href="/contact/#project-brief">Prepare a media request</TextLink></div>
      <div className="page-card"><p className="page-eyebrow">STUDIO ANNOUNCEMENTS</p><h3>More to share.<br />When it is ready.</h3><p>No studio announcements are published here yet. Project updates and official news will appear in this space as they are made available.</p><p className="page-caption">The production notes above are practical guidance, separate from studio announcements.</p></div>
    </section>
    <PageCTA eyebrow="PUT THE IDEA INTO WORDS" title={<>The first conversation<br />starts with a few details.</>} description="Tell us what you are working on and which part of the journey needs support." href="/contact/#project-brief">Prepare your brief</PageCTA>
  </>;
}

export default NewsPage;
