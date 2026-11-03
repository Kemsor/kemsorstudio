import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import React,{useEffect,useRef,useState} from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import { CTA, TextLink } from '../PageUI';
import './india-production-services.css';

const enquiry = '/contact/?partner=international-productions';
const benefits = cmsData(()=>([
  [cmsText("IndiaProductionServicesPage","b0c286155305ec83","Range of locations"), cmsText("IndiaProductionServicesPage","4e1c93d8fa8665f6","Many looks from one production base, which can simplify travel and planning")],
  [cmsText("IndiaProductionServicesPage","9582f42e3315909b","Experienced crews"), cmsText("IndiaProductionServicesPage","a7b091f65f8ae100","Departments staffed by people who work on features, series and documentaries")],
  [cmsText("IndiaProductionServicesPage","e5d169418973186e","Depth of talent"), cmsText("IndiaProductionServicesPage","f24df7ea0ebb1f9c","Lead and supporting cast, specialist performers and background artists")],
  [cmsText("IndiaProductionServicesPage","b92c31cae5f0aacf","Craft and build"), cmsText("IndiaProductionServicesPage","b38237dfe488c289","Set construction, costume, props and art teams with real depth")],
  [cmsText("IndiaProductionServicesPage","579840b47a236848","Value"), cmsText("IndiaProductionServicesPage","8ee4601cf5f13a64","Strong production value for the budget, when the shoot is planned well")],
]));
const services = cmsData(()=>([
  [cmsText("IndiaProductionServicesPage","5e8d0d1afd7fca35","Line production"), cmsText("IndiaProductionServicesPage","eacce8bb6e76e64c","Day-to-day management of the shoot in India, covering budget, schedule, people and problem-solving")],
  [cmsText("IndiaProductionServicesPage","9f38678bf9d93f5e","Locations"), cmsText("IndiaProductionServicesPage","bd0cfcce2758ea5b","Scouting, recces, location agreements and on-the-day location management")],
  [cmsText("IndiaProductionServicesPage","689d61706e999165","Permissions"), cmsText("IndiaProductionServicesPage","45476309796a4915","Coordinating the permissions a shoot needs with location owners and the relevant authorities")],
  [cmsText("IndiaProductionServicesPage","069aaf1bcbf6f683","Crew"), cmsText("IndiaProductionServicesPage","78b71995769aa8f8","Experienced local crew across departments, working alongside your heads of department")],
  [cmsText("IndiaProductionServicesPage","94e3c0380ce8c6aa","Equipment"), cmsText("IndiaProductionServicesPage","bc106e37e1858dcf","Camera, lighting, grip and sound packages sourced to your specification")],
  [cmsText("IndiaProductionServicesPage","94bdb74e918f1034","Casting & talent"), cmsText("IndiaProductionServicesPage","c25be0a841fd305d","Local cast, specialist performers and background artists, coordinated through the Kemsor Talent Network")],
  [cmsText("IndiaProductionServicesPage","36cd9ef1da6039ff","Logistics"), cmsText("IndiaProductionServicesPage","00ffd9a079dae489","Travel within India, accommodation, transport, catering and unit facilities")],
  [cmsText("IndiaProductionServicesPage","652ad996cf5608fa","Production design"), cmsText("IndiaProductionServicesPage","f939bc7a7554e4ec","Set builds, art department, props and location dressing")],
  [cmsText("IndiaProductionServicesPage","b592b990724d93ab","Budgets & cost reports"), cmsText("IndiaProductionServicesPage","135deb888a3583ec","Budgets and regular cost reports in the currency and format you agree with us")],
  [cmsText("IndiaProductionServicesPage","c3fed38b08cf5df7","Post & delivery"), cmsText("IndiaProductionServicesPage","2904a52ef91d8b18","Post-production supervision and deliverables, if you want to finish here too")],
]));
const steps = cmsData(()=>([
  [cmsText("IndiaProductionServicesPage","d3e2e8c701e398f7","Brief"), cmsText("IndiaProductionServicesPage","9ba22d056d111286","Tell us about the story, the locations you have in mind, your dates, and your budget range. We come back with honest feedback on what is possible.")],
  [cmsText("IndiaProductionServicesPage","f3a0afa2440d5cdf","Recce & plan"), cmsText("IndiaProductionServicesPage","6b8991dcf4959792","We scout options, share photos and practical notes, and recce with your director and heads of department when you’re ready.")],
  [cmsText("IndiaProductionServicesPage","eed182a8f5e6ca86","Budget & schedule"), cmsText("IndiaProductionServicesPage","dd9edf3430047f3a","A detailed budget and shooting schedule built for India, with every assumption written down.")],
  [cmsText("IndiaProductionServicesPage","9bbd6bfff665d68f","Permissions & prep"), cmsText("IndiaProductionServicesPage","5962e9cac051c978","Permissions, crew, equipment, cast, travel and accommodation confirmed and tracked against the schedule.")],
  [cmsText("IndiaProductionServicesPage","5838bd1dff95cde2","The shoot"), cmsText("IndiaProductionServicesPage","e640f29073451cfc","We run the production on the ground, with daily reports so you always know where things stand.")],
  [cmsText("IndiaProductionServicesPage","4c660816e871e80a","Wrap & handover"), cmsText("IndiaProductionServicesPage","0f1f106d6f49f1a2","Locations returned properly, accounts closed, and footage, records and paperwork handed over in order.")],
]));
function JourneyProcess(){
 const list=useRef(null),current=useRef(null),[active,setActive]=useState(-1);
 function place(card,event){
  const parent=list.current;if(!card||!parent)return;
  current.current=card;
  const box=card.getBoundingClientRect(),frame=parent.getBoundingClientRect();
  parent.style.setProperty('--process-x',`${box.left-frame.left}px`);parent.style.setProperty('--process-y',`${box.top-frame.top}px`);
  parent.style.setProperty('--process-width',`${box.width}px`);parent.style.setProperty('--process-height',`${box.height}px`);
  if(event){parent.style.setProperty('--process-glow-x',`${event.clientX-box.left}px`);parent.style.setProperty('--process-glow-y',`${event.clientY-box.top}px`);}
  setActive(Number(card.dataset.step));
 }
 useEffect(()=>{const observer=new ResizeObserver(()=>{if(current.current)place(current.current);});if(list.current)observer.observe(list.current);return()=>observer.disconnect();},[]);
 function leave(){const focused=document.activeElement;if(list.current?.contains(focused)){place(focused.closest('li'));return;}current.current=null;setActive(-1);}
 return <ol ref={list} className="india-process india-process-sliding" data-active={active>=0} onPointerLeave={leave} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)){current.current=null;setActive(-1);}}}>{steps.map(([title,copy],index)=><li key={title} data-step={index} data-active={active===index} tabIndex={0} onPointerEnter={event=>place(event.currentTarget,event)} onPointerMove={event=>place(event.currentTarget,event)} onFocus={event=>place(event.currentTarget)}><span className="india-step-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>;
}
const international = cmsData(()=>([
  [cmsText("IndiaProductionServicesPage","5ddce5fa2d41ec91","One point of contact"), cmsText("IndiaProductionServicesPage","aa12fcf3299986c1","A named Kemsor lead who knows your production inside out.")],
  [cmsText("IndiaProductionServicesPage","e460d29cbcf32fdf","Your reporting format"), cmsText("IndiaProductionServicesPage","a2035127fbd23c38","Budgets and cost reports in the currency and structure your financiers expect.")],
  [cmsText("IndiaProductionServicesPage","cfceffa277c454d2","Time zones planned for"), cmsText("IndiaProductionServicesPage","ed9c09fd6f939a86","A reporting schedule agreed at the start so decisions reach you in time, wherever you are.")],
  [cmsText("IndiaProductionServicesPage","7026975b392545c8","Clear communication on set"), cmsText("IndiaProductionServicesPage","b09e48afd6f1e900","Our team works in English and bridges local languages with crew, cast and communities.")],
]));
const formats = cmsData(()=>([
  [cmsText("IndiaProductionServicesPage","1e95182335530185","Feature films"), cmsText("IndiaProductionServicesPage","0545718cb64d27e2","Full shoots or specific blocks, from a single location to multi-city schedules")],
  [cmsText("IndiaProductionServicesPage","5031fdf0fb63bcc0","Series & OTT"), cmsText("IndiaProductionServicesPage","74cc368661372adc","Episodic shoots with consistent crews and schedules across blocks")],
  [cmsText("IndiaProductionServicesPage","d7e293f94174d1df","Documentaries"), cmsText("IndiaProductionServicesPage","6e01739ce084137a","Small, mobile units, access planning and sensitive work with communities")],
  [cmsText("IndiaProductionServicesPage","d616f3006d9d350e","Short films"), cmsText("IndiaProductionServicesPage","aaca3591788fcaac","Compact, efficient shoots that make every day count")],
  [cmsText("IndiaProductionServicesPage","8a463057a7bbbd2f","International co-productions"), cmsText("IndiaProductionServicesPage","2ff7960b533fd081","A local production partner for the India part of the project")],
]));
const questions = cmsData(()=>([
  [cmsText("IndiaProductionServicesPage","bd71d55e1ea196a2","How far ahead should we start planning?"), cmsText("IndiaProductionServicesPage","d16097bcac51d539","As early as you can. Permissions, locations, and key crew all take time to secure, and earlier planning gives you more choice. If your timeline is short, tell us anyway, and we’ll be honest about what is realistic.")],
  [cmsText("IndiaProductionServicesPage","d31178403137c5e9","Can you handle just one part of our shoot?"), cmsText("IndiaProductionServicesPage","0d5cc29d8d9e1264","Yes. Many productions use us for locations, crew, or line production only. We fit around your team.")],
  [cmsText("IndiaProductionServicesPage","2defcf64fa0d71a5","Will we work with one person or many?"), cmsText("IndiaProductionServicesPage","c8e6f1c39676826a","You will have one named Kemsor lead, supported by department heads as the shoot needs them.")],
  [cmsText("IndiaProductionServicesPage","2b2e72b23548a1e0","How will costs be reported?"), cmsText("IndiaProductionServicesPage","ab162a03a1bd558f","In the currency and format we agree on at the start, with regular cost reports during preparation and the shoot.")],
  [cmsText("IndiaProductionServicesPage","14e57b12cdd3a1ed","Can Kemsor co-produce, not just service the shoot?"), <>{cmsText("IndiaProductionServicesPage","7a1dac99af234c4a","Yes, depending on the project. See ")}<PartnershipLinks/>.</>],
  [cmsText("IndiaProductionServicesPage","9986318c82cf87c1","Do you help with incentives and visas?"), cmsText("IndiaProductionServicesPage","99ea01317fe83010","We prepare the production documentation those processes need. Eligibility and individual visa routes are confirmed by your advisors and the relevant authorities.")],
]));

function PartnershipLinks() {
  return <><a href="/finance/co-production/">{cmsText("IndiaProductionServicesPage","475d85a9e90c5200","Co-Production")}</a>{cmsText("IndiaProductionServicesPage","8828c3964e4442e9"," and ")}<a href="/finance/international-co-productions/">{cmsText("IndiaProductionServicesPage","69d47d707b333cb3","International Co-Productions")}</a></>;
}
function Label({ children, number }) {
  return <div className="india-label"><span>{children}</span><span aria-hidden="true">{number}</span></div>;
}
function RowList({ rows, headings }) {
  return <><div className="india-row-head studio-ledger-head" aria-hidden="true"><span>{headings[0]}</span><span>{headings[1]}</span></div><dl className="india-row-list studio-ledger studio-ledger-pairs">{rows.map(([title, copy]) => <div key={title}><dt>{title}</dt><dd>{copy}</dd></div>)}</dl></>;
}

function IndiaImage({image,alt,caption,number}){
 return <figure className="india-editorial-image"><div className="india-editorial-image-window"><StudioImage mediaSlot="IndiaProductionServicesPage-1" src={`/assets/stills/${image}-960.webp`} srcSet={[640,960,1600].map(width=>`/assets/stills/${image}-${width}.webp ${width}w`).join(', ')} sizes="(max-width:800px) 90vw, 45vw" width="960" height="640" alt={alt} loading="lazy" decoding="async"/><span className="india-image-index" aria-hidden="true">{number}{cmsText("IndiaProductionServicesPage","88257d10b41881be"," / INDIA")}</span></div><figcaption><span>{caption}</span><span>{cmsText("IndiaProductionServicesPage","37e2ec31b3f5f91f","ILLUSTRATIVE VISUAL")}</span></figcaption></figure>;
}
export default function IndiaProductionServicesPage() {
  return <div className="india-services-page">
    <section className="inner-hero india-hero india-width" aria-labelledby="india-title">
      <div className="india-hero-top"><a href="/">{cmsText("IndiaProductionServicesPage","b5072bfdf63df855","KEMSOR STUDIOS")}</a><span>{cmsText("IndiaProductionServicesPage","8afdd981d5deca23","INDIA PRODUCTION SERVICES")}</span></div>
      <div className="india-hero-grid">
        <div><p className="india-kicker">{cmsText("IndiaProductionServicesPage","9105c24212ec0e60","INDIA PRODUCTION SERVICES")}</p><MotionHeading as="h1" id="india-title">{cmsText("IndiaProductionServicesPage","3e2038878e5d41ab","Filming in India? ")}<em>{cmsText("IndiaProductionServicesPage","c961787424dada37","Work with people who know the ground.")}</em></MotionHeading></div>
        <div className="india-hero-copy"><MotionCopy>{cmsText("IndiaProductionServicesPage","a816a31eb5edf6a9","India offers deserts and snowlines, coastlines and megacities, palaces and village lanes. Kemsor plans, staffs and runs your shoot here so you can focus on the work.")}</MotionCopy><div className="india-actions"><CTA href={enquiry}>{cmsText("IndiaProductionServicesPage","e3f9280b3a77399b","Plan a shoot in India")}</CTA><TextLink href="#what-we-handle">{cmsText("IndiaProductionServicesPage","a126a41195987786","See what we handle")}</TextLink></div></div>
      </div>
      <figure className="india-hero-visual"><StudioImage mediaSlot="IndiaProductionServicesPage-2" src="/assets/stills/daylight-valley-production-1600.webp" srcSet="/assets/stills/daylight-valley-production-640.webp 640w, /assets/stills/daylight-valley-production-960.webp 960w, /assets/stills/daylight-valley-production-1600.webp 1600w" sizes="(max-width: 1440px) 90vw, 1280px" width="1600" height="679" alt={"Supplied illustrative artwork of a film crew working beside a river in a mountain valley"} fetchPriority="high" decoding="async"/><figcaption>{cmsText("IndiaProductionServicesPage","6dd0b26f8becc7ce","VISUAL STUDY / SUPPLIED ARTWORK")}</figcaption></figure>
    </section>

    <section className="india-section india-width india-backdrops-editorial" aria-labelledby="india-backdrops-title">
      <Label number="01">{cmsText("IndiaProductionServicesPage","8797b8fe0fe5e874","WHY INDIA")}</Label>
      <div className="india-story-split"><div className="india-story-copy"><div className="india-intro-grid"><MotionHeading as="h2" id="india-backdrops-title">{cmsText("IndiaProductionServicesPage","16b5991ddf10953a","One country. ")}<em>{cmsText("IndiaProductionServicesPage","bbc27cfb6a64b748","Almost every backdrop.")}</em></MotionHeading><div><MotionCopy>{cmsText("IndiaProductionServicesPage","4ab7c2c00ef25960","India offers high mountains and open desert, tropical coast and dense forest, historic architecture and busy cities. We help you find locations that suit the story and plan the travel between them.")}</MotionCopy><MotionCopy>{cmsText("IndiaProductionServicesPage","7d38dac04f7aaec0","India also has one of the world’s most active film industries, working across many languages and regions. That means experienced crews, skilled craftspeople and a deep pool of acting talent, in more places than most visiting productions expect.")}</MotionCopy></div></div></div><IndiaImage image="daylight-snow-production" alt={"Illustrative film production in a snow-covered Indian mountain landscape"} caption={cmsText("IndiaProductionServicesPage","8a62d5d3c88d550a","MANY LANDSCAPES. ONE PRODUCTION BASE.")} number="01"/></div>
      <RowList rows={benefits} headings={['What India offers', 'What it means for your production']}/>
    </section>

    <section className="india-section india-band india-band-dark" aria-labelledby="india-preparation-title"><div className="india-width">
      <Label number="02">{cmsText("IndiaProductionServicesPage","a7e725d017aa3373","THE HONEST PART")}</Label>
      <div className="india-story-split india-image-first"><IndiaImage image="development-packaging" alt={"Illustrative creative development and production planning scene"} caption={cmsText("IndiaProductionServicesPage","8e131ae96aa1b70c","THE WORK STARTS BEFORE THE FIRST SHOT.")} number="02"/><div className="india-story-copy"><div className="india-intro-grid"><MotionHeading as="h2" id="india-preparation-title">{cmsText("IndiaProductionServicesPage","b5eb1d681597bcba","India ")}<em>{cmsText("IndiaProductionServicesPage","e2f9113387d1b199","rewards preparation.")}</em></MotionHeading><div><MotionCopy>{cmsText("IndiaProductionServicesPage","be1182c0f50f23a8","Filming here is very rewarding, but it is not something to improvise. Distances are large, permissions involve more than one authority, languages change from region to region, and the way a set runs can differ from what an international team is used to.")}</MotionCopy><MotionCopy>{cmsText("IndiaProductionServicesPage","345a7d20f33fb29a","A good local partner closes that gap. We understand what international productions expect: clear budgets, reliable schedules, safe sets, and regular reporting, and we understand how things work on the ground here. Our job is to make those two worlds fit together.")}</MotionCopy></div></div></div></div></div></section>

    <section className="india-section india-width" id="what-we-handle" aria-labelledby="india-services-title">
      <Label number="03">{cmsText("IndiaProductionServicesPage","24a45363331ad81c","WHAT WE HANDLE")}</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-services-title">{cmsText("IndiaProductionServicesPage","8562f16ea5fbc258","Everything between your plan and ")}<em>{cmsText("IndiaProductionServicesPage","b18ea7229d3f2237","your first shot.")}</em></MotionHeading><MotionCopy>{cmsText("IndiaProductionServicesPage","809a4cfe05bb572c","Use us for the whole shoot or only the parts you need. Scope is shaped to the project, never imposed as a fixed package.")}</MotionCopy></div>
      <RowList rows={services} headings={['Service', 'What it covers']}/>
      <p className="india-partnership-note">{cmsText("IndiaProductionServicesPage","07206ba59d8fb225","Need a partner on the project itself? See ")}<PartnershipLinks/>.</p>
    </section>

    <section className="india-section india-band india-band-soft" aria-labelledby="india-process-title"><div className="india-width">
      <Label number="04">{cmsText("IndiaProductionServicesPage","e5b300cfa699e020","HOW IT WORKS")}</Label>
      <MotionHeading as="h2" id="india-process-title">{cmsText("IndiaProductionServicesPage","df9e60ba8206f857","From first email ")}<em>{cmsText("IndiaProductionServicesPage","78bad5526b6ac562","to final wrap.")}</em></MotionHeading>
      <JourneyProcess/>
    </div></section>

    <section className="india-section india-band india-band-dark india-borders-editorial" aria-labelledby="india-international-title"><div className="india-width">
      <Label number="05">{cmsText("IndiaProductionServicesPage","881597dd89e4403e","WORKING ACROSS BORDERS")}</Label>
      <div className="india-story-split"><div className="india-story-copy"><div className="india-intro-grid"><MotionHeading as="h2" id="india-international-title">{cmsText("IndiaProductionServicesPage","3a903ec61cc70516","Far from home, but ")}<em>{cmsText("IndiaProductionServicesPage","8d0cebf5b2c4f985","never out of the loop.")}</em></MotionHeading><ul className="india-international-list">{international.map(([title, copy]) => <li key={title}><h3>{title}</h3><p>{copy}</p></li>)}<li><p>{cmsText("IndiaProductionServicesPage","1e8b8f51c847904a","International standards: safe sets, fair working hours and clear documentation throughout.")}</p></li></ul></div></div><IndiaImage image="work-camera-crew" alt={"Illustrative camera crew working together on a film set"} caption={cmsText("IndiaProductionServicesPage","6410e4545a305d89","LOCAL KNOWLEDGE. A SHARED WAY OF WORKING.")} number="05"/></div></div></section>

    <section className="india-section india-width" aria-labelledby="india-formats-title">
      <Label number="06">{cmsText("IndiaProductionServicesPage","cc9a135f86b88b7a","FORMATS")}</Label>
      <MotionHeading as="h2" id="india-formats-title">{cmsText("IndiaProductionServicesPage","e9a5ad53958dd25f","Built for the way you’re making it.")}</MotionHeading>
      <RowList rows={formats} headings={['Format', 'How we support it']}/>
    </section>

    <section className="india-section india-band india-band-warm india-respect" aria-labelledby="india-respect-title"><div className="india-width">
      <Label number="07">{cmsText("IndiaProductionServicesPage","f800b7db982aa7bb","HOW WE FILM")}</Label>
      <div className="india-story-split india-image-first"><IndiaImage image="daylight-park-production" alt={"Illustrative crew filming on location in a green outdoor setting"} caption={cmsText("IndiaProductionServicesPage","f0bec129557e710d","GOOD PRODUCTIONS LEAVE GOOD RELATIONSHIPS.")} number="07"/><div className="india-story-copy"><div className="india-intro-grid"><MotionHeading as="h2" id="india-respect-title">{cmsText("IndiaProductionServicesPage","82e45220169b00b4","We film ")}<em>{cmsText("IndiaProductionServicesPage","e621ad085d3dab1b","as guests.")}</em></MotionHeading><MotionCopy>{cmsText("IndiaProductionServicesPage","8bafc7e40de568cb","Every location belongs to a family, a community or a city. We speak to people before the cameras arrive, keep our promises and leave places as we found them.")}</MotionCopy></div></div></div></div></section>

    <section className="india-section india-width" aria-labelledby="india-paperwork-title">
      <Label number="08">{cmsText("IndiaProductionServicesPage","2d6566b865bbd5bc","INCENTIVES & PAPERWORK")}</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-paperwork-title">{cmsText("IndiaProductionServicesPage","60fcbcdfba4e4768","The fine print, handled carefully.")}</MotionHeading><div><MotionCopy>{cmsText("IndiaProductionServicesPage","2a631772075fd7dc","India offers national and state-level support for some productions filming here. Whether a project qualifies depends on its details and the rules in force at the time. We prepare the production information that applications need, and work alongside your legal and financial advisors, who confirm eligibility with the relevant authorities.")}</MotionCopy><MotionCopy>{cmsText("IndiaProductionServicesPage","b6da89215846c73f","The same applies to visas and other formal requirements for visiting cast and crew: we provide the production documentation, and your advisors confirm the right route for each person.")}</MotionCopy></div></div>
    </section>

    <section className="india-section india-width" aria-labelledby="india-questions-title">
      <Label number="09">{cmsText("IndiaProductionServicesPage","7c58a64618825f38","QUESTIONS")}</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-questions-title">{cmsText("IndiaProductionServicesPage","d334cc3d9b1e13a5","Before you book the flights.")}</MotionHeading><div className="india-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="india-section india-width india-closing" aria-labelledby="india-closing-title">
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-closing-title">{cmsText("IndiaProductionServicesPage","a1896c78dab97432","Tell us where the story ")}<em>{cmsText("IndiaProductionServicesPage","6936956288409969","needs to go.")}</em></MotionHeading><div><MotionCopy>{cmsText("IndiaProductionServicesPage","e2eb1694ec6fe756","Share the script, the locations you’re imagining and your dates. We’ll come back with a clear, honest view of how to make it happen in India.")}</MotionCopy><div className="india-actions"><CTA href={enquiry}>{cmsText("IndiaProductionServicesPage","449fcedeb488a22a","Plan a shoot in India")}</CTA><TextLink href="/contact/">{cmsText("IndiaProductionServicesPage","2fb315b0630513c0","Talk to the studio")}</TextLink></div></div></div>
    </section>
  </div>;
}
