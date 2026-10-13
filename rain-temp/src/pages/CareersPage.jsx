import React from 'react';
import { PageHero, SectionHeading, PageCTA, TextLink } from '../PageUI.jsx';
import DirectorChair from '../DirectorChair.jsx';
import { CmsEntries, useCms } from '../CmsContent';

const disciplines = [
  ['Development & creative', 'Story development, research, packaging and creative coordination. The work begins with understanding the idea and helping it take a useful form.'],
  ['Production & logistics', 'Scheduling, locations, casting, crew and on-ground coordination. Connect the practical details so the production team can do its work.'],
  ['Camera, art & craft', 'Cinematography, equipment, sets and production design. Build the visual world of the project through the choices behind each frame.'],
  ['Post & release', 'Editing coordination, finishing supervision and release support. Help the captured material move towards a finished work and its audience.'],
];

export function CareersPage({ paused = false }) {
  const { entries } = useCms();
  const hasRoles = entries.some(entry => entry.type === 'career');
  return <>
    <PageHero eyebrow="CAREERS / THE PEOPLE BEHIND THE FRAME" title="Different crafts." accent="One film crew." description="Production brings many disciplines together. Every project depends on the people who connect the creative vision to the work." image="/assets/chair/turn-seated.webp" alt="Concept artwork of a filmmaker seated in a director’s chair." caption="CONCEPT ARTWORK / A SEAT FOR THE NEXT CHAPTER" />
    <nav className="page-jump-nav" aria-label="Careers sections"><a href="#production-disciplines">The disciplines</a><a href="#your-next-chapter">The next chapter</a><a href="#openings">Current opportunities</a></nav>
    <section className="page-section" id="production-disciplines">
      <SectionHeading index="01" label="THE PEOPLE BEHIND THE PROCESS" title={<>A story needs<br />more than one skill.</>} description="These are the areas of work that support a production’s journey." />
      <div className="page-grid">{disciplines.map(([title, copy], index) => <article className="page-card" key={title} data-reveal><h3>{title}</h3><p>{copy}</p></article>)}</div>
      <p className="page-caption">These disciplines describe production work. They are not listings for current vacancies.</p>
    </section>
    <section className="page-section page-split" id="your-next-chapter" data-reveal>
      <div className="page-copy"><p className="page-eyebrow">THE NEXT CHAPTER</p><h2>There is a person<br />behind every frame.</h2><p className="page-lead">A production is a shared effort: creative judgment, technical craft and the practical work that keeps people moving together.</p><p>When opportunities are published, the role details will explain the discipline, responsibilities and application process. Keep a clear picture of the work you do and the projects that show it.</p><TextLink href="#openings">See current opportunities</TextLink></div>
      <DirectorChair paused={paused} />
    </section>
    <section className="page-section" id="openings">
      <SectionHeading index="02" label="CURRENT OPPORTUNITIES" title="Current roles." description="A clear place for the next opening, when it is available." />
      {hasRoles ? <CmsEntries type="career" compact /> : <div className="opening-status" data-reveal><div><h3>No open roles listed right now.</h3><p>Future opportunities and application details will appear here. Check back for a role that fits your discipline and experience.</p></div></div>}
    </section>
    <PageCTA eyebrow="PRODUCTION PARTNERSHIPS" title={<>Working on a project<br />of your own?</>} description="If you are looking for production support or a creative collaboration, outline the project and the stage it has reached." href="/contact/#filmmakers">Explore working together</PageCTA>
  </>;
}

export default CareersPage;
