import React from 'react';
import { PageHero, SectionHeading, PageCTA, CTA, TextLink } from '../PageUI';

const chapters = [
  {
    id: 'development',
    index: '01',
    label: 'DEVELOPMENT & PACKAGING',
    title: <>Before the<br />first day on set.</>,
    image: 'camera-detail',
    alt: 'A close view of professional cinema camera equipment',
    description: 'Development brings the story, script, collaborators and production approach together. Start with the material you have and the decisions still to be made.',
    details: [
      ['Story & script development', 'Shape the concept, treatment and screenplay around a clear creative direction. Share the format, language, intended audience and any references that explain the world of the story.'],
      ['Packaging & talent attachment', 'Bring the project materials and attached collaborators into one picture. Identify the creative roles, talent conversations and production support you want to discuss.'],
    ],
    link: ['Prepare a development brief', '/contact/#project-brief'],
  },
  {
    id: 'capability-financing',
    index: '02',
    label: 'FINANCING & CO-PRODUCTION',
    title: <>A project.<br />A practical structure.</>,
    image: 'financing',
    alt: 'Film collaborators studying a screenplay and storyboards in a production office',
    description: 'The project package, production approach and funding conversations need to work together. Outline the current stage and the partnerships you want to explore.',
    details: [
      ['Film financing & investment', 'Structure funding conversations and investment coordination around the project’s scope, package and production requirements.'],
      ['Co-production', 'Bring attached partners, the proposed collaboration and the production responsibilities into the same conversation. Define the support needed across teams and locations.'],
    ],
    link: ['Explore international co-productions', '/projects/#international-co-productions'],
  },
  {
    id: 'capability-planning',
    index: '03',
    label: 'LOCATIONS, BUDGETS & SCHEDULES',
    title: <>Put the pieces<br />in place.</>,
    image: 'planning',
    alt: 'Production collaborators reviewing a shoot plan in a historic courtyard',
    description: 'Pre-production turns the creative brief into a working plan. Locations, timing, people and logistics all need a place in it.',
    details: [
      ['Budgeting & scheduling', 'Connect the production scope, script breakdown and availability to the budget and schedule. Bring dependencies and decisions into the plan before the shoot begins.'],
      ['Production management', 'Keep schedules, budgets, people and decisions aligned. Agree on how updates reach the collaborators who need the current plan.'],
      ['Location & logistics management', 'Plan locations, travel and production logistics together. Share intended locations, shooting dates and access requirements so the scope can be discussed.'],
    ],
    link: ['Discuss your production plan', '/contact/#project-brief'],
  },
  {
    id: 'capability-casting',
    index: '04',
    label: 'CASTING & TALENT',
    title: <>The right person.<br />The right role.</>,
    image: 'casting',
    alt: 'An actress rehearsing a scene during a casting session',
    description: 'Performance changes the feeling of a scene. Casting and talent coordination connect that creative decision to the practical needs of the production.',
    details: [
      ['Casting & talent coordination', 'Manage casting, talent and artist coordination around the brief. Share character descriptions, casting references and attached artists.'],
      ['Availability & production planning', 'Bring talent availability, rehearsals and shoot requirements into the schedule. Keep the relevant creative and production collaborators connected as the plan develops.'],
    ],
    link: ['Discuss your casting brief', '/contact/#project-brief'],
  },
  {
    id: 'capability-filming',
    index: '05',
    label: 'CREW, CAMERA & PRODUCTION',
    title: <>Keep the<br />shoot moving.</>,
    image: 'filming',
    alt: 'A cinematographer operating a cinema camera on an atmospheric set',
    description: 'Production brings the people, resources and decisions together on the day. The work calls for a shared plan and clear coordination on the ground.',
    details: [
      ['Line production & production management', 'On-ground production leadership and coordination. Connect the schedule, budget, people and day-to-day decisions that keep the shoot moving.'],
      ['Crew & equipment management', 'Assemble and coordinate crew, equipment and vendors around the production approach. Share the technical requirements and the team already attached.'],
      ['Shooting & on-location production', 'Support the shoot on location, with the people and logistics aligned to the current production plan.'],
    ],
    link: ['Plan a shoot in India', '/services/#india-production-services'],
  },
  {
    id: 'capability-design',
    index: '06',
    label: 'SET & PRODUCTION DESIGN',
    title: <>Build the world<br />of the story.</>,
    image: 'design',
    alt: 'Production designers creating the visual details of a period film set',
    description: 'Place, texture and the details in a frame help an audience understand the world. Production design connects that visual direction to the production plan.',
    details: [
      ['Set design & production design', 'Shape the visual world of the production around the script, creative references and intended locations.'],
      ['Art & production coordination', 'Connect the design requirements to locations, the schedule and the wider production team. Discuss what the story needs and how the visual approach fits the scope.'],
    ],
    link: ['Discuss your visual approach', '/contact/#project-brief'],
  },
  {
    id: 'capability-post',
    index: '07',
    label: 'POST-PRODUCTION & RELEASE',
    title: <>From the footage.<br />To the finished film.</>,
    image: 'post',
    alt: 'A colorist refining a film in a grading and screening suite',
    description: 'The journey continues after the shoot. Think about the handover, the finishing process and the materials needed for the intended screen.',
    details: [
      ['Post-production supervision', 'Oversee the path from captured material to the finished cut. Clarify the responsibilities and handovers across editing, sound, finishing and delivery.'],
      ['Distribution & release support', 'Prepare the strategy and supporting materials needed for release. Discuss the format, audience and production partners involved in the next stage.'],
    ],
    link: ['Discuss your post-production plan', '/contact/#project-brief'],
  },
];

const process = [
  ['Development & packaging', 'Shape the concept, materials, creative team and production approach.'],
  ['Financing & co-production', 'Structure the project for funding conversations and production partnerships.'],
  ['Pre-production', 'Prepare schedules, budgets, locations, casting, crew and logistics.'],
  ['Production & line production', 'Coordinate the people, resources and decisions that keep the shoot moving.'],
  ['Post-production', 'Supervise the path from captured material to the finished film or series.'],
  ['Distribution & release', 'Support the strategy and materials needed to bring the work to audiences.'],
];

const jumpLinks = [
  ...chapters.map(({ id, index, label }) => ({ id, label: `${index} / ${label}` })),
  { id: 'india-production-services', label: '08 / INDIA PRODUCTION SERVICES' },
  { id: 'festival-strategy', label: '09 / FESTIVAL STRATEGY' },
  { id: 'production-process', label: '10 / HOW WE WORK' },
];

export function ServicesPage() {
  return (
    <div className="inner-page page-services">
      <PageHero
        eyebrow="CAPABILITIES / PRODUCTION SUPPORT"
        title="From the first idea."
        accent="To the final frame."
        description="Financing, locations, casting, crew, production and post. Practical support for the decisions and details that make a shoot work."
        image="/assets/services/design.webp"
        alt="Production designers preparing the details of a period film set"
        caption="CREATIVE VISION. PRACTICAL PRODUCTION."
      />

      <nav className="page-jump-nav" aria-label="Production services and process">
        {jumpLinks.map(({ id, label }) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <section className="page-section" aria-label="Choose the support your production needs">
        <div className="page-grid">
          <div data-reveal>
            <p className="page-eyebrow">SHAPED AROUND YOUR PROJECT</p>
            <h2>Start where<br />you are.</h2>
          </div>
          <div className="page-copy" data-reveal>
            <p className="page-lead">A project in development needs a different conversation from a shoot already in motion.</p>
            <p>Tell us what is ready, which collaborators are attached and the support you want to discuss. We shape our role around the stage and scope of the production.</p>
            <TextLink href="/contact/#project-brief">Prepare a clear starting point</TextLink>
          </div>
        </div>
      </section>

      <div className="page-directory" aria-label="Production capabilities">
        {chapters.map((chapter, index) => (
          <section className={`page-section service-chapter${index % 2 ? ' is-reversed' : ''}`} id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
            <figure className="page-image" data-reveal>
              <img src={`/assets/services/${chapter.image}.webp`} alt={chapter.alt} loading="lazy" decoding="async" width="1672" height="941" />
              <figcaption className="page-caption">{chapter.index} / {chapter.label}</figcaption>
            </figure>
            <div className="page-copy" data-reveal>
              <p className="page-eyebrow">{chapter.index} / {chapter.label}</p>
              <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
              <p className="page-lead">{chapter.description}</p>
              <div className="service-details">
                {chapter.details.map(([title, description]) => (
                  <article key={title}>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
              <TextLink href={chapter.link[1]}>{chapter.link[0]}</TextLink>
            </div>
          </section>
        ))}
      </div>

      <section className="page-section page-split" id="india-production-services" aria-labelledby="india-support-title">
        <div className="page-copy" data-reveal>
          <p className="page-eyebrow">08 / INDIA PRODUCTION SERVICES</p>
          <h2 id="india-support-title">A production team<br />on the ground.</h2>
          <p className="page-lead">Local planning and coordination for your shoot in India.</p>
          <p>Locations, casting coordination, crew and equipment, logistics and line production. Outline your intended locations in India, shooting dates and production requirements so the scope of support can be discussed.</p>
          <div className="service-details">
            <article><h3>Before the shoot</h3><p>Bring location plans, crew requirements and the proposed schedule into one practical production brief.</p></article>
            <article><h3>On the ground</h3><p>Coordinate the people, resources and logistics needed to support the production plan.</p></article>
          </div>
          <CTA href="/contact/#international-productions">Plan your production in India</CTA>
        </div>
        <figure className="page-image" data-reveal>
          <img src="/assets/services/planning.webp" alt="Production collaborators reviewing a location plan in a courtyard" loading="lazy" decoding="async" width="1672" height="941" />
          <figcaption className="page-caption">YOUR STORY. A CONNECTED LOCAL PLAN.</figcaption>
        </figure>
      </section>

      <section className="page-section" id="festival-strategy" aria-labelledby="festival-strategy-title">
        <div className="page-grid">
          <div data-reveal>
            <p className="page-eyebrow">09 / FESTIVAL &amp; AWARDS PLANNING</p>
            <h2 id="festival-strategy-title">Think beyond<br />the final frame.</h2>
          </div>
          <div className="page-copy" data-reveal>
            <p className="page-lead">Festival submissions and awards planning begin with the project’s release priorities.</p>
            <p>If they are part of your release plan, include your intended festivals, deadlines and available materials in the brief. The appropriate scope can then be discussed alongside the wider release strategy.</p>
            <TextLink href="/contact/#project-brief">Discuss your release plan</TextLink>
          </div>
        </div>
      </section>

      <section className="page-section" id="production-process" aria-label="How Kemsor approaches the six stages of production">
        <SectionHeading index="10" label="HOW WE WORK" title={<>Six stages.<br />One production.</>} description="A connected journey from the concept and creative team to the finished work and its audience." />
        <div className="process-grid">
          {process.map(([title, description], index) => (
            <article className="page-card" data-reveal key={title}>
              <span className="page-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <PageCTA eyebrow="YOUR NEXT STEP" title="Bring us the starting point." description="A script, a brief or a production already in progress. Share the project stage, proposed schedule and the support you need.">
        Discuss your production
      </PageCTA>
    </div>
  );
}

export default ServicesPage;
