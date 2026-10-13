import React from 'react';
import { PageHero, SectionHeading, PageCTA, TextLink } from '../PageUI.jsx';

const images = [
  { name: 'riders-scene', title: 'Scale & atmosphere', detail: 'A scene on horseback', width: 2048, height: 1436, alt: 'Riders on horseback moving through a misty scene.' },
  { name: 'costume-portrait', title: 'Character, up close', detail: 'Costume portrait', width: 959, height: 1280, alt: 'Close portrait of a performer in an ornate costume, lit in red and blue.' },
  { name: 'action-scene', title: 'In the middle of it', detail: 'Action scene', width: 1511, height: 815, alt: 'A performer holding a prop rifle on an action set.' },
  { name: 'white-olive-tree-poster', title: 'The White Olive Tree', detail: 'Supplied poster', width: 949, height: 1292, alt: 'The White Olive Tree poster, with its original lettering and cast imagery.' },
  { name: 'period-costume', title: 'A world in the details', detail: 'Period costume', width: 1079, height: 1541, alt: 'A performer in a gold period costume standing in a traditional colonnade.' },
  { name: 'detective-scene', title: 'An exchange on screen', detail: 'Dramatic scene', width: 1280, height: 719, alt: 'A performer in a red beret in a dramatic scene, with the original title in the upper corner.' },
  { name: 'office-scene', title: 'Across the desk', detail: 'Dramatic scene', width: 1280, height: 720, alt: 'A uniformed character seated at a desk in a dramatic scene.' },
  { name: 'ensemble-poster', title: 'An ensemble in frame', detail: 'Supplied poster', width: 996, height: 1280, alt: 'An ensemble action poster with its original titles and credits.' },
];

const formats = [
  { id: 'feature-films', number: '01', title: 'Feature films', label: 'A complete world. A full-length story.', copy: 'Development, production and release support for feature-length films, shaped around the screenplay, language, audience and scope of the production.', starting: 'Bring a synopsis or script, the current project stage and a sense of the scale you have in mind.' },
  { id: 'series-ott', number: '02', title: 'Series & OTT', label: 'The story continues.', copy: 'Episodic work needs a plan that holds across chapters. Story development, production scheduling and coordination connect the series as a whole to the needs of each episode.', starting: 'Bring the series premise, episode structure, target format and any available scripts or platform requirements.' },
  { id: 'documentaries', number: '03', title: 'Documentaries', label: 'Real stories. Considered production.', copy: 'A documentary begins with its subject and point of view. Research, access, interviews, locations and available material help determine the right production approach.', starting: 'Bring the central question, the people or places involved, existing research and the material already available.' },
  { id: 'short-films', number: '04', title: 'Short films', label: 'Make every frame count.', copy: 'A focused story deserves a focused plan. We discuss the script, essential locations and collaborators, then shape the production around the length and ambition of the short.', starting: 'Bring the script or treatment, intended running time, production stage and proposed shoot dates.' },
];

export function ProjectsPage() {
  return <>
    <PageHero eyebrow="PRODUCTIONS / STORY FORMATS" title="Stories take" accent="different forms." description="Films, series, documentaries and shorts. A shared creative vision, with a production plan shaped around the work." image="/assets/stills/riders-scene.webp" alt="Riders on horseback in a misty cinematic scene." caption="SUPPLIED PHOTOGRAPHY / SCALE & ATMOSPHERE" />
    <nav className="page-jump-nav" aria-label="Production formats">
      <a href="#project-showcase">Visual archive</a>{formats.map(format => <a href={`#${format.id}`} key={format.id}>{format.title}</a>)}<a href="#international-co-productions">International co-productions</a>
    </nav>
    <section className="page-section" id="project-showcase">
      <SectionHeading index="01" label="THE VISUAL ARCHIVE" title={<>Character. Place.<br />The moment in between.</>} description="A selection of the supplied screen images, portraits and posters, kept in their original composition." />
      <div className="project-collection">{images.map((image, index) => <figure className="project-item" key={image.name} data-reveal>
        <img className="page-image" src={`/assets/stills/${image.name}.webp`} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" style={{ aspectRatio: `${image.width} / ${image.height}`, objectFit: 'contain' }} />
        <figcaption><div><h3>{image.title}</h3><p className="page-caption">{image.detail}</p></div></figcaption>
      </figure>)}</div>
      <p className="page-caption">These images were supplied for the website. Individual production credits and Kemsor’s role have not yet been published.</p>
    </section>
    <section className="page-section" aria-label="Story formats">
      <SectionHeading index="02" label="WHAT WE MAKE" title={<>The format changes.<br />The care stays.</>} description="Start with the story. Then decide what its production needs." />
      <div className="page-grid">{formats.map(format => <article className="page-card" id={format.id} key={format.id} data-reveal>
        <p className="page-eyebrow">{format.label}</p><h2>{format.title}</h2><p>{format.copy}</p><p>{format.starting}</p><TextLink href="/contact/#project-brief">Prepare a {format.title === 'Series & OTT' ? 'series' : format.title === 'Documentaries' ? 'documentary' : format.title === 'Short films' ? 'short film' : 'feature film'} brief</TextLink>
      </article>)}</div>
    </section>
    <section className="page-section page-split" id="international-co-productions" data-reveal>
      <div className="page-copy"><p className="page-eyebrow">ACROSS TEAMS / ACROSS BORDERS</p><h2>One project.<br />More than one perspective.</h2><p className="page-lead">International co-productions connect creative teams, production partners and locations. A useful starting point is a clear picture of the project and each collaborator’s role.</p><TextLink href="/contact/#co-producers">Discuss a co-production</TextLink></div>
      <div className="page-card"><p className="page-eyebrow">BRING TO THE FIRST CONVERSATION</p><h3>The story and the partnership.</h3><p>The project format, development materials, attached partners and funding stage.</p><h3>The work on the ground.</h3><p>Proposed locations, languages, schedule and the production support needed in India.</p><h3>The next decision.</h3><p>The scope you want to agree, the people involved and the next milestone the project needs to reach.</p><TextLink href="/services/#india-production-services">Explore production support in India</TextLink></div>
    </section>
    <PageCTA eyebrow="YOUR NEXT PRODUCTION" title={<>What are you<br />working on?</>} description="A script, a treatment or a production already underway. Start with what you have." href="/contact/#project-brief">Start a project</PageCTA>
  </>;
}

export default ProjectsPage;
