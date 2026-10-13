import React from 'react';
import { PageHero, SectionHeading, PageCTA, TextLink } from '../PageUI.jsx';

const notes = [
  { id: 'a-useful-brief', number: '01', category: 'DEVELOPMENT', title: 'A clear brief is a strong beginning.', summary: 'The first few details that make a production conversation useful.', introduction: 'A working title is only the start. A useful brief gives collaborators a shared picture of what you want to make, where the project stands and what needs to happen next.', sections: [
    ['The story and its audience', 'Describe the central idea, format, language and intended audience. A short synopsis and a few creative references can help explain the tone without replacing the story itself.'],
    ['What is already in place', 'Note the material available: a treatment, screenplay, research, attached collaborators or an existing production plan. Separate the decisions already made from the questions that still need a conversation.'],
    ['The support you want to discuss', 'Outline the proposed timing, locations and scope of support. You do not need every answer before starting; it helps to be clear about the next decision.'],
  ] },
  { id: 'before-the-first-take', number: '02', category: 'PRE-PRODUCTION', title: 'Before the first day on set.', summary: 'Give the moving parts a shared plan before the cameras roll.', introduction: 'A shoot brings many disciplines together. Pre-production connects their needs, so the schedule reflects the work and the collaborators know what each day asks of them.', sections: [
    ['Read the script as a production', 'Look at the scenes through locations, cast, crew, equipment and design. Identify the dependencies early: a location may change the schedule, and a sequence may need preparation before the shoot.'],
    ['Bring the practical details together', 'Connect availability, location access, travel and equipment requirements. Keep the current version of the plan visible to the people who need it.'],
    ['Give changes a clear route', 'Agree on who coordinates decisions and how updates reach the team. The plan should make the day easier to navigate when circumstances change.'],
  ] },
  { id: 'beyond-the-final-frame', number: '03', category: 'POST & RELEASE', title: 'Think beyond the final frame.', summary: 'The path to an audience begins before a film is finished.', introduction: 'Development, production and post-production decisions shape what comes next. A clear handover helps the project move from captured material to a finished work and its next conversation.', sections: [
    ['Keep the intended screen in view', 'Discuss the format, language and audience from the beginning. These choices give the team a shared context for the finished work.'],
    ['Plan the path through post', 'Talk through editing, sound, finishing and delivery with the relevant collaborators. Clarify responsibilities, expected materials and the order in which decisions need to be made.'],
    ['Prepare the next conversation', 'Release planning may involve positioning, supporting materials and festival preparation. The scope depends on the project and the partners involved; start by identifying what the next milestone needs.'],
  ] },
];

export function NewsPage() {
  return <>
    <PageHero eyebrow="NEWSROOM / STUDIO NOTES" title="A closer look" accent="at the work." description="Notes on the process, the practical details and the conversations that bring stories to screen." image="/assets/stills/office-scene.webp" alt="A character seated across a desk in a supplied dramatic scene." caption="SUPPLIED SCREEN IMAGE / IN CONVERSATION" />
    <section className="page-section" id="studio-notes">
      <SectionHeading index="01" label="FROM THE STUDIO" title={<>Useful things<br />to start with.</>} description="Three practical notes for a project’s next chapter." />
      <div className="page-principles">{notes.map(note => <article className="page-card" key={note.id} data-reveal><span className="page-number">{note.number}</span><p className="page-eyebrow">{note.category}</p><h3>{note.title}</h3><p>{note.summary}</p><TextLink href={`#${note.id}`}>Read the note</TextLink></article>)}</div>
    </section>
    <section className="page-section" aria-label="Production notes">{notes.map(note => <article className="editorial-note page-split" id={note.id} key={note.id} data-reveal>
      <div className="page-copy"><span className="page-number">{note.number}</span><p className="page-eyebrow">{note.category}</p><h2>{note.title}</h2></div>
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
