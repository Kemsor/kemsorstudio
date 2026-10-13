import React from 'react';
import { PageHero, SectionHeading, PageCTA, TextLink } from '../PageUI';

const principles = [
  {
    title: 'Understand the story.',
    description: 'Start with the creative vision, the intended audience and the people bringing the project to life. Those choices give the production its direction.',
  },
  {
    title: 'Build the right plan.',
    description: 'Connect the scope of support to the project’s stage, scale, schedule and production needs. Make the next decisions clear before moving ahead.',
  },
  {
    title: 'Keep the work connected.',
    description: 'Coordinate collaborators and decisions across development, production, post-production and release. Keep the story in view as the work changes hands.',
  },
];

export function AboutPage() {
  return (
    <div className="inner-page page-about">
      <PageHero
        eyebrow="THE STUDIO / ABOUT KEMSOR"
        title="Behind every film."
        accent="A team."
        description="Kemsor works with filmmakers, studios and production partners on films, series and documentaries. We help develop the project, plan the production and coordinate the people who bring it to screen."
        image="/assets/services/filming.webp"
        alt="A cinematographer working with a cinema camera on a film set"
        caption="STORY. PEOPLE. PRODUCTION."
      />

      <section className="page-section" aria-labelledby="about-partner-title">
        <div className="page-grid">
          <div data-reveal>
            <p className="page-eyebrow">01 / ONE PRODUCTION PARTNER</p>
            <h2 id="about-partner-title">Different stages.<br />A shared plan.</h2>
          </div>
          <div className="page-copy" data-reveal>
            <p className="page-lead">Some projects need support from the first draft. Others need a team on the ground, help through post-production or a plan for release.</p>
            <p>We shape our role around the stage and scope of your project. A script in development and a production ready to shoot begin with different questions. The practical starting point is to understand what you have, what comes next and where support can make a difference.</p>
            <TextLink href="/services/">Explore our production support</TextLink>
          </div>
        </div>
      </section>

      <section className="page-section" aria-label="How Kemsor approaches production">
        <SectionHeading index="02" label="HOW WE THINK" title={<>The way we<br />approach the work.</>} description="Creative decisions and production decisions belong in the same conversation." />
        <div className="page-principles">
          {principles.map((principle, index) => (
            <article className="page-card" data-reveal key={principle.title}>
              <span className="page-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section page-split" aria-labelledby="about-craft-title">
        <figure className="page-image" data-reveal>
          <img src="/assets/services/planning.webp" alt="Production collaborators reviewing a location plan in a courtyard" loading="lazy" decoding="async" width="1672" height="941" />
          <figcaption className="page-caption">THE STORY SETS THE DIRECTION.</figcaption>
        </figure>
        <div className="page-copy" data-reveal>
          <p className="page-eyebrow">03 / FILM, SERIES &amp; DOCUMENTARIES</p>
          <h2 id="about-craft-title">Different languages.<br />Shared craft.</h2>
          <p className="page-lead">Stories are shaped by language, place and audience.</p>
          <p>Hindi, regional and international cinema. Films, series and documentaries. The format changes the production approach, while the work still calls for a connected creative team and a practical plan.</p>
          <p>We support teams working across locations and production partnerships, with the scope shaped around the story they want to make.</p>
          <TextLink href="/projects/">Explore the story formats</TextLink>
        </div>
      </section>

      <section className="page-section" id="leadership" aria-labelledby="leadership-title">
        <div className="page-grid">
          <div data-reveal>
            <p className="page-eyebrow">04 / LEADERSHIP</p>
            <h2 id="leadership-title">The people<br />behind Kemsor.</h2>
          </div>
          <div className="page-copy" data-reveal>
            <p className="page-lead">Leadership profiles forthcoming.</p>
            <p>Profiles will be published here as the studio information is updated.</p>
            <TextLink href="/careers/">Explore the disciplines behind a production</TextLink>
          </div>
        </div>
      </section>

      <PageCTA
        eyebrow="THE NEXT CHAPTER"
        title="What are you working on?"
        description="Start with what you have: a script, a brief or a production already in progress. Outline the project, its stage and the support you need."
      >Discuss your project</PageCTA>
    </div>
  );
}

export default AboutPage;
