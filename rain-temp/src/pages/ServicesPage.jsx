import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import MotionHeading, { MotionCopy } from '../TextMotion';
import EditorialPage from '../EditorialPage';
import React from 'react';
import { PageHero, SectionHeading, PageCTA, CTA, TextLink } from '../PageUI';

const chapters = cmsData(()=>([
  {
    id: 'development',
    index: '01',
    label: cmsText("ServicesPage","887971590efa851b","DEVELOPMENT & PACKAGING"),
    title: <>{cmsText("ServicesPage","cc35bfd414c78a63","Before the")}<br />{cmsText("ServicesPage","c4b969ee662c91f6","first day on set.")}</>,
    image: 'camera-detail',
    alt: cmsText("ServicesPage","6b9acc3a4613dd1c","A close view of professional cinema camera equipment"),
    description: cmsText("ServicesPage","a4e0d31f7886f5c2","Development brings the story, script, collaborators and production approach together. Start with the material you have and the decisions still to be made."),
    details: [
      [cmsText("ServicesPage","ed3995abc38fe437","Story & script development"), cmsText("ServicesPage","7ebbfe5f8798018e","Shape the concept, treatment and screenplay around a clear creative direction. Share the format, language, intended audience and any references that explain the world of the story.")],
      [cmsText("ServicesPage","ba97541e184481b9","Packaging & talent attachment"), cmsText("ServicesPage","a1d52d06682ec233","Bring the project materials and attached collaborators into one picture. Identify the creative roles, talent conversations and production support you want to discuss.")],
    ],
    link: [cmsText("ServicesPage","f02466e428559726","Explore Develop"), '/develop/'],
  },
  {
    id: 'capability-financing',
    index: '02',
    label: cmsText("ServicesPage","895b024dcf568718","FINANCING & CO-PRODUCTION"),
    title: <>{cmsText("ServicesPage","cac47fa37998e151","A project.")}<br />{cmsText("ServicesPage","6a5efcfce1a4ad6c","A practical structure.")}</>,
    image: 'financing',
    alt: cmsText("ServicesPage","4926076446edb64b","Film collaborators studying a screenplay and storyboards in a production office"),
    description: cmsText("ServicesPage","8106e8e880d200e2","The project package, production approach and funding conversations need to work together. Outline the current stage and the partnerships you want to explore."),
    details: [
      [cmsText("ServicesPage","acc0612d929079e5","Film financing & investment"), cmsText("ServicesPage","fba532bebd835d92","Structure funding conversations and investment coordination around the project’s scope, package and production requirements.")],
      [cmsText("ServicesPage","0a4a683cc3404016","Co-production"), cmsText("ServicesPage","71e60cea421d68bd","Bring attached partners, the proposed collaboration and the production responsibilities into the same conversation. Define the support needed across teams and locations.")],
    ],
    link: [cmsText("ServicesPage","c2c4b8b45f247ef5","Explore international co-productions"), '/productions/#international-co-productions'],
  },
  {
    id: 'capability-planning',
    index: '03',
    label: cmsText("ServicesPage","dcb3720326e1bd5a","LOCATIONS, BUDGETS & SCHEDULES"),
    title: <>{cmsText("ServicesPage","61149e53e1d4a8d9","Put the pieces")}<br />{cmsText("ServicesPage","0f2a1d43a4ba499c","in place.")}</>,
    image: 'planning',
    alt: cmsText("ServicesPage","a635adf89ac68b35","Production collaborators reviewing a shoot plan in a historic courtyard"),
    description: cmsText("ServicesPage","90075e402693737a","Pre-production turns the creative brief into a working plan. Locations, timing, people and logistics all need a place in it."),
    details: [
      [cmsText("ServicesPage","1b30fe2401d453c5","Budgeting & scheduling"), cmsText("ServicesPage","4ccc2a4653232d73","Connect the production scope, script breakdown and availability to the budget and schedule. Bring dependencies and decisions into the plan before the shoot begins.")],
      [cmsText("ServicesPage","f5041c954a120e08","Production management"), cmsText("ServicesPage","5b2c6a049f1a193f","Keep schedules, budgets, people and decisions aligned. Agree on how updates reach the collaborators who need the current plan.")],
      [cmsText("ServicesPage","62b418a24d27fe75","Location & logistics management"), cmsText("ServicesPage","a8c9f2bbd71345b1","Plan locations, travel and production logistics together. Share intended locations, shooting dates and access requirements so the scope can be discussed.")],
    ],
    link: [cmsText("ServicesPage","860bf3e14860cf90","Discuss your production plan"), '/contact/#project-brief'],
  },
  {
    id: 'capability-casting',
    index: '04',
    label: cmsText("ServicesPage","2f487ce662d467e8","CASTING & TALENT"),
    title: <>{cmsText("ServicesPage","a21ef57813258506","The right person.")}<br />{cmsText("ServicesPage","c86d0b09256016f6","The right role.")}</>,
    image: 'casting',
    alt: cmsText("ServicesPage","aba9d790b0455258","An actress rehearsing a scene during a casting session"),
    description: cmsText("ServicesPage","47014325f4cdc508","Performance changes the feeling of a scene. Casting and talent coordination connect that creative decision to the practical needs of the production."),
    details: [
      [cmsText("ServicesPage","adcdbcf8df05c186","Casting & talent coordination"), cmsText("ServicesPage","0a6e3971a1742df2","Manage casting, talent and artist coordination around the brief. Share character descriptions, casting references and attached artists.")],
      [cmsText("ServicesPage","8001c962de704773","Availability & production planning"), cmsText("ServicesPage","4a40272346c173e3","Bring talent availability, rehearsals and shoot requirements into the schedule. Keep the relevant creative and production collaborators connected as the plan develops.")],
    ],
    link: [cmsText("ServicesPage","83d8cec8c292604b","Discuss your casting brief"), '/contact/#project-brief'],
  },
  {
    id: 'capability-filming',
    index: '05',
    label: cmsText("ServicesPage","f530a3c4d214ffd2","CREW, CAMERA & PRODUCTION"),
    title: <>{cmsText("ServicesPage","f84fc7eb698ed414","Keep the")}<br />{cmsText("ServicesPage","086ed5cab9879039","shoot moving.")}</>,
    image: 'filming',
    alt: cmsText("ServicesPage","75ae85dfaea08d83","A cinematographer operating a cinema camera on an atmospheric set"),
    description: cmsText("ServicesPage","7ae63ab1f5bb4bb7","Production brings the people, resources and decisions together on the day. The work calls for a shared plan and clear coordination on the ground."),
    details: [
      [cmsText("ServicesPage","b256dec03d4155b4","Line production & production management"), cmsText("ServicesPage","fb7ea48143ee1b3f","On-ground production leadership and coordination. Connect the schedule, budget, people and day-to-day decisions that keep the shoot moving.")],
      [cmsText("ServicesPage","ba79e7478a79838c","Crew & equipment management"), cmsText("ServicesPage","f715e16f5a0576cc","Assemble and coordinate crew, equipment and vendors around the production approach. Share the technical requirements and the team already attached.")],
      [cmsText("ServicesPage","94c192440fb1a265","Shooting & on-location production"), cmsText("ServicesPage","cffe96bbb39e78ff","Support the shoot on location, with the people and logistics aligned to the current production plan.")],
    ],
    link: [cmsText("ServicesPage","080ce0d7bfdcc5b2","Plan a shoot in India"), '/india-production-services/'],
  },
  {
    id: 'capability-design',
    index: '06',
    label: cmsText("ServicesPage","88f8e9141fb5add3","SET & PRODUCTION DESIGN"),
    title: <>{cmsText("ServicesPage","ae854e38fbf32425","Build the world")}<br />{cmsText("ServicesPage","ec8ad6fd5103049f","of the story.")}</>,
    image: 'design',
    alt: cmsText("ServicesPage","4ba22b9fde957f9c","Production designers creating the visual details of a period film set"),
    description: cmsText("ServicesPage","48743e1b9ad39fe7","Place, texture and the details in a frame help an audience understand the world. Production design connects that visual direction to the production plan."),
    details: [
      [cmsText("ServicesPage","05d1a37470f8e9ed","Set design & production design"), cmsText("ServicesPage","993444be7bd33876","Shape the visual world of the production around the script, creative references and intended locations.")],
      [cmsText("ServicesPage","1ad7dd0b0795c8f7","Art & production coordination"), cmsText("ServicesPage","8a061572eed41a6b","Connect the design requirements to locations, the schedule and the wider production team. Discuss what the story needs and how the visual approach fits the scope.")],
    ],
    link: [cmsText("ServicesPage","eeb4313c9a123cc3","Discuss your visual approach"), '/contact/#project-brief'],
  },
  {
    id: 'capability-post',
    index: '07',
    label: cmsText("ServicesPage","f8bf835d8fe7b995","POST-PRODUCTION & RELEASE"),
    title: <>{cmsText("ServicesPage","e3465a345523ccf0","From the footage.")}<br />{cmsText("ServicesPage","23d844b5bd1a247f","To the finished film.")}</>,
    image: 'post',
    alt: cmsText("ServicesPage","2b0a9c6b2090c3bf","A colorist refining a film in a grading and screening suite"),
    description: cmsText("ServicesPage","fd6d93a6f26fd9b6","Plan the handover after the shoot, the post-production work and the materials required for delivery."),
    details: [
      [cmsText("ServicesPage","51347a8ee15959b3","Post-production supervision"), cmsText("ServicesPage","98fa1189a3c99ff4","Oversee the path from captured material to the finished cut. Clarify the responsibilities and handovers across editing, sound, finishing and delivery.")],
      [cmsText("ServicesPage","7b31989d3e85f084","Distribution & release support"), cmsText("ServicesPage","2f2c07046c8ebb6c","Prepare the strategy and supporting materials needed for release. Discuss the format, audience and production partners involved in the next stage.")],
    ],
    link: [cmsText("ServicesPage","be739aad7abd78bb","Post-Production Supervision"), '/post-production/'],
  },
]));

const process = cmsData(()=>([
  [cmsText("ServicesPage","12a5cc282197fd37","Development & packaging"), cmsText("ServicesPage","772f0b5fa441ff83","Shape the concept, materials, creative team and production approach.")],
  [cmsText("ServicesPage","48b274edbf2e9440","Financing & co-production"), cmsText("ServicesPage","4aed781177b225df","Structure the project for funding conversations and production partnerships.")],
  [cmsText("ServicesPage","53e1b538688bd082","Pre-production"), cmsText("ServicesPage","dc4b5f4f0c7d6c6b","Prepare schedules, budgets, locations, casting, crew and logistics.")],
  [cmsText("ServicesPage","a0771b6227b54660","Production & line production"), cmsText("ServicesPage","c1f56731b4f52d10","Coordinate the people, resources and decisions that keep the shoot moving.")],
  [cmsText("ServicesPage","02d045aa57b49e9d","Post-production"), cmsText("ServicesPage","d1df1eacb3c99c40","Supervise the path from captured material to the finished film or series.")],
  [cmsText("ServicesPage","94e943371e9fdc8d","Distribution & release"), cmsText("ServicesPage","111a2c2d4a03f144","Support the strategy and materials needed to bring the work to audiences.")],
]));

const jumpLinks = cmsData(()=>([
  ...chapters.map(({ id, label }) => ({ id, label })),
  { id: 'india-production-services', label: cmsText("ServicesPage","e0a7700d99dbb9ea","08 / INDIA PRODUCTION SERVICES") },
  { id: 'festival-strategy', label: cmsText("ServicesPage","a5a6d3808136064e","09 / FESTIVAL STRATEGY") },
  { id: 'production-process', label: cmsText("ServicesPage","3167fba4c185d64f","10 / HOW WE WORK") },
]));

export function ServicesPage() {
  return (
    <EditorialPage page="services"><div className="inner-page page-services">
      <PageHero
        eyebrow={cmsText("ServicesPage","138664f7279cf36f","CAPABILITIES / PRODUCTION SUPPORT")}
        title={cmsText("ServicesPage","4963197ce1689fcd","From the first idea.")}
        accent={cmsText("ServicesPage","f615fe6eb7e98691","To the final frame.")}
        description={cmsText("ServicesPage","d4f6a4c09e605d72","Financing, locations, casting, crew, production and post. Practical support for the decisions and details that make a shoot work.")}
        image="/assets/services/design.webp"
        alt={"Production designers preparing the details of a period film set"}
        caption={cmsText("ServicesPage","fdc20328e583a78f","CREATIVE VISION. PRACTICAL PRODUCTION.")}
      />

      <nav className="page-jump-nav" aria-label="Production services and process">
        {jumpLinks.map(({ id, label }) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <section className="page-section" aria-label="Choose the support your production needs">
        <div className="page-grid">
          <div data-reveal>
            <p className="page-eyebrow">{cmsText("ServicesPage","19558593bf8dc527","SHAPED AROUND YOUR PROJECT")}</p>
            <MotionHeading as="h2">{cmsText("ServicesPage","e5e1d65d46855bb2","Start where")}<br />{cmsText("ServicesPage","8a139a833b6fbdab","you are.")}</MotionHeading>
          </div>
          <div className="page-copy" data-reveal>
            <MotionCopy className="page-lead">{cmsText("ServicesPage","251e22cec3e460c9","A project in development needs a different conversation from a shoot already in motion.")}</MotionCopy>
            <MotionCopy>{cmsText("ServicesPage","fd3c7794183176c6","Tell us what is ready, which collaborators are attached and the support you want to discuss. We shape our role around the stage and scope of the production.")}</MotionCopy>
            <TextLink href="/contact/#project-brief">{cmsText("ServicesPage","f38305364b9a22f2","Prepare a clear starting point")}</TextLink>
          </div>
        </div>
      </section>

      <div className="page-directory" aria-label="Production capabilities">
        {chapters.map((chapter, index) => (
          <section className={`page-section service-chapter${index % 2 ? ' is-reversed' : ''}`} id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
            <figure className="page-image" data-reveal>
              <StudioImage mediaSlot="ServicesPage-1" src={`/assets/services/${chapter.image}.webp`} alt={chapter.alt} loading="lazy" decoding="async" width="1672" height="941" />
              <figcaption className="page-caption">{chapter.label}</figcaption>
            </figure>
            <div className="page-copy" data-reveal>
              <p className="page-eyebrow">{chapter.label}</p>
              <MotionHeading as="h2" id={`${chapter.id}-title`}>{chapter.title}</MotionHeading>
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
          <p className="page-eyebrow">{cmsText("ServicesPage","41fc12812dec05e0","08 / INDIA PRODUCTION SERVICES")}</p>
          <MotionHeading as="h2" id="india-support-title">{cmsText("ServicesPage","be36d1162c2a7cb3","A production team")}<br />{cmsText("ServicesPage","95a5afd7a54551c0","on the ground.")}</MotionHeading>
          <MotionCopy className="page-lead">{cmsText("ServicesPage","fc24eb2284441425","Local planning and coordination for your shoot in India.")}</MotionCopy>
          <MotionCopy>{cmsText("ServicesPage","d1ab299680b4b713","Locations, casting coordination, crew and equipment, logistics and line production. Outline your intended locations in India, shooting dates and production requirements so the scope of support can be discussed.")}</MotionCopy>
          <div className="service-details">
            <article><h3>{cmsText("ServicesPage","a035f383d5e8ed0a","Before the shoot")}</h3><MotionCopy>{cmsText("ServicesPage","1aaca2e435c2a010","Bring location plans, crew requirements and the proposed schedule into one practical production brief.")}</MotionCopy></article>
            <article><h3>{cmsText("ServicesPage","7640593a86a8e18a","On the ground")}</h3><MotionCopy>{cmsText("ServicesPage","368e20ae12e14e78","Coordinate the people, resources and logistics needed to support the production plan.")}</MotionCopy></article>
          </div>
          <CTA href="/contact/#international-productions">{cmsText("ServicesPage","574dd959486502a4","Plan your production in India")}</CTA>
          <TextLink href="/india-production-services/">{cmsText("ServicesPage","76dbd2aa589a0290","Explore India Production Services")}</TextLink>
        </div>
        <figure className="page-image" data-reveal>
          <StudioImage mediaSlot="ServicesPage-2" src="/assets/services/planning.webp" alt={"Production collaborators reviewing a location plan in a courtyard"} loading="lazy" decoding="async" width="1672" height="941" />
          <figcaption className="page-caption">{cmsText("ServicesPage","19cc82c82c97d1d6","YOUR STORY. A CONNECTED LOCAL PLAN.")}</figcaption>
        </figure>
      </section>

      <section className="page-section" id="festival-strategy" aria-labelledby="festival-strategy-title">
        <div className="page-grid">
          <div data-reveal>
            <p className="page-eyebrow">{cmsText("ServicesPage","7175235af2c581b1","09 / FESTIVAL & AWARDS PLANNING")}</p>
            <MotionHeading as="h2" id="festival-strategy-title">{cmsText("ServicesPage","acd27b085588f640","Think beyond")}<br />{cmsText("ServicesPage","6236351bd9b5207b","the final frame.")}</MotionHeading>
          </div>
          <div className="page-copy" data-reveal>
            <MotionCopy className="page-lead">{cmsText("ServicesPage","93ce8d9e6b155365","Festival submissions and awards planning begin with the project’s release priorities.")}</MotionCopy>
            <MotionCopy>{cmsText("ServicesPage","26ff4cbe4c35d06e","If they are part of your release plan, include your intended festivals, deadlines and available materials in the brief. The appropriate scope can then be discussed alongside the wider release strategy.")}</MotionCopy>
            <TextLink href="/release/festival-awards-strategy/">{cmsText("ServicesPage","a10b66d2ba394e21","Festival & Awards Strategy")}</TextLink>
          </div>
        </div>
      </section>

      <section className="page-section" id="production-process" aria-label="How Kemsor approaches the six stages of production">
        <SectionHeading index="10" label="HOW WE WORK" title={<>{cmsText("ServicesPage","6df79ee4b05b8064","Six stages.")}<br />{cmsText("ServicesPage","60ef8d048a00e8f9","One production.")}</>} description={cmsText("ServicesPage","ce0d09a250dd1550","Support from concept and team planning through production, finishing and release.")} />
        <div className="process-grid">
          {process.map(([title, description], index) => (
            <article className="page-card" data-reveal key={title}>
              
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <PageCTA eyebrow={cmsText("ServicesPage","a0930d7a10a3fc7e","YOUR NEXT STEP")} title={cmsText("ServicesPage","83d50b61b1261ef5","Bring us the starting point.")} description={cmsText("ServicesPage","dbf4bc71b199aca2","A script, a brief or a production already in progress. Share the project stage, proposed schedule and the support you need.")}>{cmsText("ServicesPage","2c67c50d8c7a3f6b","Discuss your production")}</PageCTA>
    </div></EditorialPage>
  );
}

export default ServicesPage;
