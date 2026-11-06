import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import PageVisuals from '../VisualChapters';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import React, { useEffect, useState } from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './what-we-make-page.css';

// Content: Kemsor_What_We_Make_Page_Content.docx.pdf.
const formats = cmsData(()=>([
  {
    id: 'feature-films', number: '01', title: cmsText("WhatWeMakePage","834e31b024989843","Feature Films"), accent: cmsText("WhatWeMakePage","f0c4698123ba14d0","Built for the big screen."), context: cmsText("WhatWeMakePage","b6a95da6274ce3cb","INCLUDING REGIONAL CINEMA"), image: 'coastal-motorcycle-chase',
    alt: cmsText("WhatWeMakePage","cd5d91816edfab70","Supplied illustration of two performers in a motorcycle chase beside the coast, with a helicopter overhead"),
    hook: cmsText("WhatWeMakePage","36f15828fd64c14d","You’ve lived with this story for years. Now it needs a production that can carry it."),
    body: cmsText("WhatWeMakePage","b9971c2fdad084a3","A feature needs a packaged script, a financing plan that holds and a shoot where every day counts. We keep the creative vision and production plan together from first pitch to final delivery. That includes regional cinema: stories rooted in language and place, produced with local knowledge."),
    capabilities: [[cmsText("WhatWeMakePage","509751bc9d761f4c","Development & packaging"), cmsText("WhatWeMakePage","10a41b8c42ab1f80","A script and creative package ready to pitch")], [cmsText("WhatWeMakePage","77f2047ce11aef52","Financing coordination"), cmsText("WhatWeMakePage","05a37bd0dcebb3ed","Investors met with a clear budget and plan")], [cmsText("WhatWeMakePage","f84842a04ea2acfc","Pre-production"), cmsText("WhatWeMakePage","f95dca8b64ca1a28","Casting, crew, locations and design, settled early")], [cmsText("WhatWeMakePage","3e20164983e25126","Line production"), cmsText("WhatWeMakePage","c5933a8465b9ec48","The shoot run day to day, on set and on location")], [cmsText("WhatWeMakePage","62301e92b114fa54","Post supervision"), cmsText("WhatWeMakePage","c9b7873c573a2a6b","Edit, sound, colour and VFX through to delivery")], [cmsText("WhatWeMakePage","51ffdfb5e7c70c6d","Release support"), cmsText("WhatWeMakePage","58c7a9eb0262d049","Coordination with platforms and distributors")]],
    audience: cmsText("WhatWeMakePage","a2d199236d42ad53","Writers, directors, producers and studios"), action: cmsText("WhatWeMakePage","e57ac0de7b2105b0","Talk to us about your feature"),
  },
  {
    id: 'series-ott', number: '02', title: cmsText("WhatWeMakePage","3748d501cfe5fd66","Series & OTT"), accent: cmsText("WhatWeMakePage","dfb2fff3b1b3c6af","Built to keep them watching."), context: cmsText("WhatWeMakePage","5b7fa1620be6de6d","EPISODIC · STREAMING · PLATFORM-READY"), image: 'work-dance-set',
    alt: cmsText("WhatWeMakePage","c595cac95e011e0e","Illustrative episodic production with performers and a camera crew on set"),
    hook: cmsText("WhatWeMakePage","d1defe3037cf088f","Episode one earns the click. Every episode after earns the audience."),
    body: cmsText("WhatWeMakePage","cde2f2400d6dc5e6","Episodic storytelling depends on consistency in tone, performance, schedule and delivery. We plan series production around the story’s arc and the platform’s needs, so the final episode holds up as well as the first."),
    capabilities: [[cmsText("WhatWeMakePage","534f5ac24684fb3e","Series packaging"), cmsText("WhatWeMakePage","35f9714a6530aec6","A concept and creative package ready for platforms")], [cmsText("WhatWeMakePage","c2472c7b0da598e4","Multi-episode planning"), cmsText("WhatWeMakePage","fc52f421b116cad6","Budgets and schedules built across the whole season")], [cmsText("WhatWeMakePage","24e4f43d90b89b70","Casting & crew continuity"), cmsText("WhatWeMakePage","2f60afedb4b0ee36","The right people, kept together episode to episode")], [cmsText("WhatWeMakePage","477e3df923b3e8b3","Production management"), cmsText("WhatWeMakePage","b147d394a2d6b24f","Day-to-day control of a long, demanding shoot")], [cmsText("WhatWeMakePage","e2245ae0bef3eb25","Post supervision"), cmsText("WhatWeMakePage","cfc12cdbe3d6b836","Edit, sound, colour and VFX to platform deliverables")], [cmsText("WhatWeMakePage","f47f3cf19b3ffea5","Platform coordination"), cmsText("WhatWeMakePage","620242cc2472652b","Clear communication with the platform through release")]],
    audience: cmsText("WhatWeMakePage","5c89e34e5d46272d","Creators, producers, studios and OTT platforms"), action: cmsText("WhatWeMakePage","0b4e6fea2d273f00","Talk to us about your series"),
  },
  {
    id: 'documentaries', number: '03', title: cmsText("WhatWeMakePage","29603078d2e0749f","Documentaries"), accent: cmsText("WhatWeMakePage","fa3ae246d002af9e","Real stories, told with care."), context: cmsText("WhatWeMakePage","58838469ff0a44b8","RESEARCHED · RESPECTFUL · REAL"), image: 'work-forest-set',
    alt: cmsText("WhatWeMakePage","2f905584ff011b9d","Illustrative location shoot with a small production crew in a forest"),
    hook: cmsText("WhatWeMakePage","eaf8f90c9e93fcad","Real life doesn’t follow a call sheet. Your production should be ready for that."),
    body: cmsText("WhatWeMakePage","c52a2aa0e8b1deb4","Documentaries depend on trust from the people on camera, the communities you film in and the audience. We plan around access, research and the unexpected while protecting the integrity of the story."),
    capabilities: [[cmsText("WhatWeMakePage","64e6708485b8e593","Development"), cmsText("WhatWeMakePage","ea3a0e0727eb47bb","The idea shaped into a story worth funding")], [cmsText("WhatWeMakePage","74191c1fa24fa870","Financing & co-production"), cmsText("WhatWeMakePage","3f1f8394099cd2d4","Partners and investors aligned on the same goal")], [cmsText("WhatWeMakePage","0bee9a530475b1c4","Location & logistics"), cmsText("WhatWeMakePage","a53830245182eb9b","Real-world shoots planned with respect for place")], [cmsText("WhatWeMakePage","69d313172c18d179","Crew & equipment"), cmsText("WhatWeMakePage","edfb5f9712eb64c4","Sized to the shoot, ready to move when the story does")], [cmsText("WhatWeMakePage","4ffc5a1109e111d4","Post supervision"), cmsText("WhatWeMakePage","e3f05fa8aee34342","Where documentaries are often truly written")], [cmsText("WhatWeMakePage","87059f06969e454f","Release support"), cmsText("WhatWeMakePage","72c61d4270655006","Deliverables prepared for platforms and distributors")]],
    audience: cmsText("WhatWeMakePage","db13d0c49097dedc","Documentary filmmakers, producers, platforms and international partners"), action: cmsText("WhatWeMakePage","66c4b52e04152d60","Talk to us about your documentary"),
  },
  {
    id: 'short-films', number: '04', title: cmsText("WhatWeMakePage","dbcbaa05c1181230","Short Films"), accent: cmsText("WhatWeMakePage","2b64ed59f0098e25","Every shot counts."), context: cmsText("WhatWeMakePage","c13058de82521ebc","COMPACT FORMAT · FULL CRAFT"), image: 'daylight-park-production',
    alt: cmsText("WhatWeMakePage","ddff711cd92f8a70","Supplied illustration of a small camera crew filming children playing in a sunny park"),
    hook: cmsText("WhatWeMakePage","3a9f80c73e8ae337","A short film is a calling card, a proof of concept, a voice announcing itself."),
    body: cmsText("WhatWeMakePage","1193a78639c5fab2","In a compact format, every shot and every rupee counts. We help first-time and established filmmakers make the most of a tight budget and a short schedule."),
    capabilities: [[cmsText("WhatWeMakePage","0b0c14a2654ed05d","Script & packaging"), cmsText("WhatWeMakePage","ba8b387255cd3d86","A sharper script and a clear creative plan")], [cmsText("WhatWeMakePage","ed16327ddf189682","Realistic budgets"), cmsText("WhatWeMakePage","2ec31ef4003b3930","Grounded in production realities, not optimism")], [cmsText("WhatWeMakePage","9fd51de17fd5fd86","Casting & talent"), cmsText("WhatWeMakePage","90d59f1248bc2aa6","Cast and crew drawn from the Kemsor Talent Network")], [cmsText("WhatWeMakePage","3fc7352dbf4e09c0","Compact shoots"), cmsText("WhatWeMakePage","6ea85f73a6fbc30b","Line production built for short, focused schedules")], [cmsText("WhatWeMakePage","3d9be31c940eb3c1","Post supervision"), cmsText("WhatWeMakePage","89fb70cc1dbbb629","Edit, sound and colour finished to a high standard")], [cmsText("WhatWeMakePage","e9643832e4328e6b","Deliverables for release"), cmsText("WhatWeMakePage","e3f3b647c919cce4","Ready for the platforms and screens you’re aiming at")]],
    audience: cmsText("WhatWeMakePage","3063021de24df061","Writers and directors, whether it’s your first film or your fifth"), action: cmsText("WhatWeMakePage","e645f75d3d469732","Talk to us about your short"),
  },
]));
const ways = cmsData(()=>([
  [cmsText("WhatWeMakePage","e06c56b1e8468bce","An early idea"), cmsText("WhatWeMakePage","ff2107798bdc193a","Shape it into a project that’s ready to pitch."), '/services/#development', cmsText("WhatWeMakePage","a6c9a35f4257bb8a","Development")],
  [cmsText("WhatWeMakePage","c1c93fe9b15179f3","A finished script"), cmsText("WhatWeMakePage","91a1afa108dbc1b3","Build the budget, the plan and the team around it."), '/script-to-production/', cmsText("WhatWeMakePage","cb8018682a4f9109","Script to Production")],
  [cmsText("WhatWeMakePage","d60c0fb0bd0784d1","A greenlit project"), cmsText("WhatWeMakePage","f02aa4bfa0450625","Get it shot on set, on location and on schedule."), '/produce/line-production/', cmsText("WhatWeMakePage","f994ab7dad5d19c2","Line production")],
  [cmsText("WhatWeMakePage","454db9d2a49571a1","Footage in the can"), cmsText("WhatWeMakePage","8022dc45ee2b697f","Carry it through post and out to audiences."), '/services/#capability-post', cmsText("WhatWeMakePage","4a1f2db3c3946e62","Post & release")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}
function FormatImage({ name, alt, preview = false }) {
  const base = `/assets/stills/${name}`;
  return <StudioImage mediaSlot={preview?"WhatWeMakePage-preview":"WhatWeMakePage-1"} src={`${base}-960.webp`} srcSet={[640, 960, 1600].map(width => `${base}-${width}.webp ${width}w`).join(', ')} sizes={preview ? "(max-width: 700px) 44vw, 23vw" : "(max-width: 700px) 90vw, 75vw"} alt={alt} width="960" height="540" loading={preview ? "eager" : "lazy"} decoding="async"/>;
}

Label.displayName = 'EditorialLabel';

export default function WhatWeMakePage() {
  const [activeFormat, setActiveFormat] = useState('feature-films');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top);
      if (visible.length) setActiveFormat(visible[0].target.id);
    }, { rootMargin: cmsText("WhatWeMakePage","a7720ebfc20db922","-18% 0px -55% 0px") });
    formats.forEach(format => { const element = document.getElementById(format.id); if(element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  return <PageVisuals page="what-we-make"><div className="produce-hub what-we-make-page">
    <div className="make-top-strip"><a href="/">{cmsText("WhatWeMakePage","8139051b177404eb","KEMSOR STUDIOS")}</a><span>{cmsText("WhatWeMakePage","5941a7345c94b805","STORY. CRAFT. CINEMA.")}</span></div>
    <section className="inner-hero produce-hero make-hero" aria-labelledby="make-title"><div className="produce-hero-content"><p className="produce-kicker">{cmsText("WhatWeMakePage","a73164199bb2d391","WHAT WE MAKE")}</p><MotionHeading as="h1" id="make-title">{cmsText("WhatWeMakePage","563a5bccec8c2383","Every story has a shape.")}<span>{cmsText("WhatWeMakePage","36db3a937bbf80d7","We build for it.")}</span></MotionHeading><MotionCopy>{cmsText("WhatWeMakePage","06a4d63779d9147b","Feature films, series, documentaries and short films each ask something different of a production. We plan for your format so the story reaches the screen as you imagined it.")}</MotionCopy><CTA href="/contact/?partner=filmmakers">{cmsText("WhatWeMakePage","454b66781fbc7261","Bring us your story")}</CTA></div><div className="make-contact-sheet" aria-label="Explore our formats">{formats.map(format => <a href={`/what-we-make/${format.id}/`} key={format.id}><div className="make-sheet-photo"><FormatImage name={format.image} alt={format.alt} preview/></div><span className="make-sheet-caption">{format.title}<Arrow/></span></a>)}</div><div className="produce-hero-foot"><span>{cmsText("WhatWeMakePage","cb843179b470dbb7","FEATURES · SERIES · DOCUMENTARIES · SHORTS")}</span><a href="#make-formats">{cmsText("WhatWeMakePage","9320ce1aa202ca43","Find your format ")}<span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div></section>

    <SectionSubmenu id="make-formats" page={activeFormat} menu={{label:'WHAT WE MAKE',name:'Choose a story format',href:'/what-we-make/',pages:formats.map(format=>[format.id,format.title])}}/>

    <section className="produce-section make-promise" aria-labelledby="make-promise-label"><Label>{cmsText("WhatWeMakePage","00f4838e612615e6","ONE QUESTION, EVERY FORMAT")}</Label><MotionHeading as="h2" id="make-promise-label">{cmsText("WhatWeMakePage","5d68d83369ab0479","Whatever you’re making, we start in the same place: ")}<em>{cmsText("WhatWeMakePage","ab0f640ce451c3a0","what does this story need to reach its audience?")}</em></MotionHeading></section>

    {formats.map((format, index) => <section className={`produce-section make-format${index % 2 ? ' make-format-reversed' : ''}`} id={format.id} aria-labelledby={`${format.id}-title`} key={format.id}>
      <Label end={format.context}>{format.title.toUpperCase()}</Label>
      <div className="make-format-intro"><figure className="make-format-image"><FormatImage name={format.image} alt={format.alt}/><figcaption><span>{format.title}</span></figcaption></figure><div className="make-format-copy"><MotionHeading as="h2" id={`${format.id}-title`}>{format.title}.<br/><em>{format.accent}</em></MotionHeading><p className="make-hook">{format.hook}</p><p>{format.body}</p><TextLink href={`/what-we-make/${format.id}/`}>{cmsText("WhatWeMakePage","3139ed64bd1237c2","Explore ")}{format.title}</TextLink></div></div>
      <div className="make-capability-head studio-ledger-head"><h3>{cmsText("WhatWeMakePage","b89b9c3f76ec9591","What we bring")}</h3><span>{cmsText("WhatWeMakePage","e1004668ef12a902","What it means for you")}</span></div><dl className="make-capabilities studio-ledger studio-ledger-pairs">{format.capabilities.map(([title, description]) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl>
      <div className="make-format-foot"><p><span>{cmsText("WhatWeMakePage","5f5d5b466e28159e","MADE FOR")}</span>{format.audience}</p><CTA href="/contact/?partner=filmmakers">{format.action}</CTA></div>
      {/* Related-work cards stay hidden until a cleared still, title, year,
          platform (for series) and confirmed Kemsor credit are supplied. */}
    </section>)}

    <section className="produce-section make-coproduction" aria-labelledby="make-coproduction-title"><Label>{cmsText("WhatWeMakePage","0207d6191ca22b73","ACROSS BORDERS")}</Label><div><MotionHeading as="h2" id="make-coproduction-title">{cmsText("WhatWeMakePage","d7db20118c7587b7","Making it with")}<br/><em>{cmsText("WhatWeMakePage","9f4671494e4e5106","partners abroad?")}</em></MotionHeading><div><MotionCopy>{cmsText("WhatWeMakePage","bb355877b8ec90e5","Any of these formats can be built as an international co-production. We align partners across companies and borders on shared creative and production goals. We also provide local support for productions filming in India.")}</MotionCopy><div className="produce-actions"><CTA href="/productions/#international-co-productions">{cmsText("WhatWeMakePage","306d5a8ccf39884d","Explore co-productions")}</CTA><TextLink href="/india-production-services/">{cmsText("WhatWeMakePage","9e20d49395d99a54","India Production Services")}</TextLink></div></div></div></section>

    <section className="produce-section make-ways" aria-labelledby="make-ways-title"><Label>{cmsText("WhatWeMakePage","62372c1d02be200a","WHEREVER YOU ARE · THERE’S A WAY IN")}</Label><div className="make-ways-head"><MotionHeading as="h2" id="make-ways-title">{cmsText("WhatWeMakePage","d5e2fb2d14f4be53","Bring us the story")}<br/><em>{cmsText("WhatWeMakePage","65b7e20dc1e8bdd4","at any stage.")}</em></MotionHeading><MotionCopy>{cmsText("WhatWeMakePage","b573a0a42834a78c","You don’t need everything figured out. Bring us in at the start or at the stage where you need us most.")}</MotionCopy></div><div className="make-ways-grid">{ways.map(([title, description, href, action], index) => <a href={href} key={title}><h3>{title}</h3><p>{description}</p><span className="make-way-link">{action}<Arrow /></span></a>)}</div></section>

    <section className="produce-section produce-closing inner-closing" aria-labelledby="make-closing-title"><Label>{cmsText("WhatWeMakePage","7fd282b17492b3ff","YOUR NEXT PROJECT")}</Label><div><MotionHeading as="h2" id="make-closing-title">{cmsText("WhatWeMakePage","3b1fda94fcdce7eb","What are you")}<br/><em>{cmsText("WhatWeMakePage","992a7632efae043d","making?")}</em></MotionHeading><div><MotionCopy>{cmsText("WhatWeMakePage","d3ba4b8b6dd26bdf","Tell us about your feature, series, documentary or short and where it stands. We’ll help find the next step.")}</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("WhatWeMakePage","71a53832b68074a9","Start a conversation")}</CTA><TextLink href="/productions/">{cmsText("WhatWeMakePage","a8532bb7b8f12862","Explore productions")}</TextLink></div></div></div></section>
  </div></PageVisuals>;
}
