import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import FinanceLayout from '../FinanceLayout';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './international-co-productions.css';

const contact = '/contact/?partner=international-productions';
const directions = cmsData(()=>([
  [cmsText("InternationalCoProductionsPage","bba261c2887b7d1a","Into India"), cmsText("InternationalCoProductionsPage","abceb28236313a85","International producers and platforms looking for an Indian partner"), cmsText("InternationalCoProductionsPage","7c3d1983738a7c00","A local production partner, with locations, crew, casting and line production on the ground")],
  [cmsText("InternationalCoProductionsPage","3f02a187730fcd88","Out to the world"), cmsText("InternationalCoProductionsPage","b27770530e02174b","Indian creators and producers seeking international partners"), cmsText("InternationalCoProductionsPage","fbe8d61fc863d028","A project packaged with a clear budget and plan international partners can assess")],
]));
const crossings = cmsData(()=>([
  [cmsText("InternationalCoProductionsPage","b5bbb70a136ef363","The story"), cmsText("InternationalCoProductionsPage","f5aa9d491a54bf6b","Creative expectations shaped by different cultures and languages"), cmsText("InternationalCoProductionsPage","e7cccdd24eab2436","Creative goals agreed in writing, in a shared language, before production")],
  [cmsText("InternationalCoProductionsPage","84cdb8fa36e1bcaf","The money"), cmsText("InternationalCoProductionsPage","9937f4df998fe8b1","Different currencies, budgeting styles and reporting needs"), cmsText("InternationalCoProductionsPage","bef76c36ee82351e","One budget presented clearly for every partner, with reporting they can follow")],
  [cmsText("InternationalCoProductionsPage","82925335a259b015","The people"), cmsText("InternationalCoProductionsPage","f8d40b16118e68fd","Crew and talent from several countries, working together"), cmsText("InternationalCoProductionsPage","7bd0e6209463c27e","Crews coordinated across borders, with clear roles and one production lead")],
  [cmsText("InternationalCoProductionsPage","4f89a199632b2a4d","The footage"), cmsText("InternationalCoProductionsPage","80328b5c4054b620","Shoots and post split across countries"), cmsText("InternationalCoProductionsPage","90550824ceec243f","Clear delivery specifications and handovers between every stage")],
]));
const reporting = cmsData(()=>([
  [cmsText("InternationalCoProductionsPage","381c6c6a65fec68c","Agreed reporting rhythm"), cmsText("InternationalCoProductionsPage","59d313453a286779","Regular updates on progress, spend and schedule")],
  [cmsText("InternationalCoProductionsPage","a3ee463c74ceadba","One point of contact"), cmsText("InternationalCoProductionsPage","4bc3f2cc3e5aa53a","A named Kemsor lead for each partner")],
  [cmsText("InternationalCoProductionsPage","07ab23d7fc358ccc","Decisions in writing"), cmsText("InternationalCoProductionsPage","a64010b677cddbfa","Clear records partners in any country can refer back to")],
]));
const steps = cmsData(()=>([
  [cmsText("InternationalCoProductionsPage","5114a51761654a4f","Find common ground"), cmsText("InternationalCoProductionsPage","98dfae2378aa5140","Partners agree the story, the audience, and why they are making it together.")],
  [cmsText("InternationalCoProductionsPage","8dc20ad952e88321","Build one plan"), cmsText("InternationalCoProductionsPage","7afc19b123b35166","One budget, one schedule and one set of responsibilities for every country.")],
  [cmsText("InternationalCoProductionsPage","f44d31a518ae6304","Split the work"), cmsText("InternationalCoProductionsPage","14022a7579b7b63b","Shoot, post, and delivery divided clearly between partners.")],
  [cmsText("InternationalCoProductionsPage","12ca43d859e1ba55","Deliver as one"), cmsText("InternationalCoProductionsPage","a1cf1288ef9f2dc0","A single production, delivered to every partner’s market.")],
]));
const audiences = cmsData(()=>([
  cmsText("InternationalCoProductionsPage","c4280a1c1e97dccc","International producers and studios seeking an Indian partner"),
  cmsText("InternationalCoProductionsPage","8c6f7ddc4465fb52","Indian creators and producers seeking international partners"),
  cmsText("InternationalCoProductionsPage","0355dc6f474904da","Platforms commissioning cross-border projects"),
  cmsText("InternationalCoProductionsPage","f3040128452cd147","Financiers backing projects across markets"),
]));
const questions = cmsData(()=>([
  [cmsText("InternationalCoProductionsPage","33f63947079b2001","Do you handle official treaty co-production applications?"), cmsText("InternationalCoProductionsPage","48da61cee0b4a117","We prepare the production-side documents. Eligibility and applications are handled with partners’ legal advisors and the relevant authorities.")],
  [cmsText("InternationalCoProductionsPage","2597473e6facb44c","Can international crews film in India with your support?"), cmsText("InternationalCoProductionsPage","9e986cd038c66086","Yes. Our India Production Services cover line production, locations and logistics, crew and equipment, and casting coordination.")],
  [cmsText("InternationalCoProductionsPage","b2f572b293bf02dc","Which countries do you work with?"), cmsText("InternationalCoProductionsPage","c15ea6e3d219a447","We welcome conversations with partners from any market.")],
  [cmsText("InternationalCoProductionsPage","edc6b81b7a8b6140","Can you help an Indian project find international partners?"), cmsText("InternationalCoProductionsPage","2f7d6e67bafb0925","Yes. We package the project with a clear budget and plan, and bring international partners into the conversation.")],
]));
function Label({children}) { return <div className="produce-label"><span>{children}</span></div>; }
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Finance_03_International_Co-Productions.docx.pdf.
export default function InternationalCoProductionsPage() {
  return <FinanceLayout page="international-co-productions"><div className="produce-hub international-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("InternationalCoProductionsPage","1ca8681b6f1e24b7","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/finance/">{cmsText("InternationalCoProductionsPage","840ba51627b62451","Finance")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("InternationalCoProductionsPage","a1f3dc3c19d1eda2","International Co-Productions")}</span></nav>
    <section className="inner-hero produce-hero" aria-labelledby="international-title">
      <figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="InternationalCoProductionsPage-1" src="/assets/stills/daylight-valley-production-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-valley-production-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure>
      <div className="produce-hero-content"><p className="produce-kicker">{cmsText("InternationalCoProductionsPage","c725952b371df2fc","02 · FINANCE · INTERNATIONAL CO-PRODUCTIONS")}</p><MotionHeading as="h1" id="international-title">{cmsText("InternationalCoProductionsPage","e6035558ddac46f0","International Co-Productions.")}<span>{cmsText("InternationalCoProductionsPage","2d81338d6ca36ca6","One story. Many countries. One plan.")}</span></MotionHeading><MotionCopy>{cmsText("InternationalCoProductionsPage","7a76335c477ffe8e","Cross-border productions bring together money, talent and audiences, as well as different currencies, working practices, languages and time zones. Kemsor builds a shared plan and provides production support in India.")}</MotionCopy><div className="produce-actions"><CTA href={contact}>{cmsText("InternationalCoProductionsPage","9f535ef71daeec31","Start an international conversation")}</CTA><TextLink href="/india-production-services/">{cmsText("InternationalCoProductionsPage","38b35cd27981764e","Filming in India? See India Production Services")}</TextLink></div></div>
    </section>

    <section className="produce-section" id="two-directions" aria-labelledby="directions-title"><Label>{cmsText("InternationalCoProductionsPage","57087a4fe5cb2f49","TWO DIRECTIONS · ONE PARTNER")}</Label><MotionHeading as="h2" id="directions-title">{cmsText("InternationalCoProductionsPage","729a017b3aa2fb6e","Coming to India.")}<br/><em>{cmsText("InternationalCoProductionsPage","3cf90cfbfcf1310b","Or taking India to the world.")}</em></MotionHeading><div className="international-directions">{directions.map(([title,who,brings],i)=><article key={title}><div className="international-direction-label"><span>0{i+1}</span><span aria-hidden="true">{i===0?'→':'←'}</span></div><h3>{title}</h3><p className="international-small-label">{cmsText("InternationalCoProductionsPage","6c2707fb0d763a1f","FOR")}</p><p>{who}</p><p className="international-small-label">{cmsText("InternationalCoProductionsPage","cbc00013e0f5107f","WHAT KEMSOR BRINGS")}</p><p>{brings}</p></article>)}</div></section>

    <section className="produce-section" id="what-crosses-the-border" aria-labelledby="crossings-title"><Label>{cmsText("InternationalCoProductionsPage","7d49da8b10f51dcd","WHAT CROSSES THE BORDER")}</Label><MotionHeading as="h2" id="crossings-title">{cmsText("InternationalCoProductionsPage","32b148df529c0a69","Four things move between countries.")}<br/><em>{cmsText("InternationalCoProductionsPage","32ce1ec99e7d230f","Each needs a plan.")}</em></MotionHeading><div className="international-crossings">{crossings.map(([title,challenge,handling],i)=><article key={title}><div><span className="international-small-label">0{i+1} / 04</span><h3>{title}</h3></div><div><p className="international-small-label">{cmsText("InternationalCoProductionsPage","b2404e59c007e0fb","THE CHALLENGE")}</p><p>{challenge}</p></div><div><p className="international-small-label">{cmsText("InternationalCoProductionsPage","2577f938e191cbd3","HOW KEMSOR HANDLES IT")}</p><p>{handling}</p></div></article>)}</div></section>

    <section className="produce-section" id="communication" aria-labelledby="communication-title"><Label>{cmsText("InternationalCoProductionsPage","64071dfc215a3bfc","COMMUNICATION · ACROSS TIME ZONES")}</Label><MotionHeading as="h2" id="communication-title">{cmsText("InternationalCoProductionsPage","5c0911603b5f3049","When partners are hours apart,")}<br/><em>{cmsText("InternationalCoProductionsPage","f5f10f775950d246","communication can’t be an afterthought.")}</em></MotionHeading><MotionCopy className="international-intro">{cmsText("InternationalCoProductionsPage","707270e3be2b6196","We agree with each partner what updates they will receive, how often and from whom, so risks and decisions reach them in time to act across time zones.")}</MotionCopy><div className="international-reporting">{reporting.map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section international-frameworks" id="treaties-incentives" aria-labelledby="treaties-title"><Label>{cmsText("InternationalCoProductionsPage","133386ea40ba128c","TREATIES & INCENTIVES")}</Label><MotionHeading as="h2" id="treaties-title">{cmsText("InternationalCoProductionsPage","af742ecbaaf766be","Where official frameworks apply,")}<br/><em>{cmsText("InternationalCoProductionsPage","3ce4e757a53cdc92","we prepare the production side.")}</em></MotionHeading><MotionCopy className="international-intro">{cmsText("InternationalCoProductionsPage","63ec08392a463695","Some international co-productions may qualify for official co-production treaties or production incentives. Eligibility and applications are confirmed by partners with their legal advisors and the relevant authorities. Kemsor prepares the production-side information those processes need: budgets, schedules, crew and location plans.")}</MotionCopy></section>

    <section className="produce-section produce-process" id="how-it-works" aria-labelledby="process-title"><Label>{cmsText("InternationalCoProductionsPage","ab4ecc4b7cb83116","HOW IT WORKS")}</Label><MotionHeading as="h2" id="process-title">{cmsText("InternationalCoProductionsPage","14f18f8e3b7ba105","How it works.")}</MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><span className="produce-step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>

    <section className="produce-section" id="who-its-for" aria-labelledby="audiences-title"><Label>{cmsText("InternationalCoProductionsPage","c18c622f7215f107","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="audiences-title">{cmsText("InternationalCoProductionsPage","02e087814854c7d4","Who it’s for.")}</MotionHeading><ul className="international-audiences">{audiences.map(line=><li key={line}>{line}</li>)}</ul></section>

    {/* The source provides a card format, but no approved project or country credits. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>{cmsText("InternationalCoProductionsPage","bbef41f4d5c44bcf","RELATED WORK")}</Label><div><MotionHeading as="h2" id="work-title">{cmsText("InternationalCoProductionsPage","127861a1bc45235e","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("InternationalCoProductionsPage","cc4aae469c07f347","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>{cmsText("InternationalCoProductionsPage","9dad3b47ebc61043","QUESTIONS")}</Label><MotionHeading as="h2" id="questions-title">{cmsText("InternationalCoProductionsPage","b0bcf521babb5ea9","Questions.")}</MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="international-conversation" aria-labelledby="conversation-title"><Label>{cmsText("InternationalCoProductionsPage","d2415826a181d444","INTERNATIONAL CO-PRODUCTIONS")}</Label><div><MotionHeading as="h2" id="conversation-title">{cmsText("InternationalCoProductionsPage","cd1ca9306eec4cf6","Different countries.")}<br/><em>{cmsText("InternationalCoProductionsPage","8e6788dd88960a57","Same story.")}</em></MotionHeading><div><MotionCopy>{cmsText("InternationalCoProductionsPage","00106fdb755a5390","Wherever your partners are, start with a conversation. We’ll show you how the project could come together across borders.")}</MotionCopy><CTA href={contact}>{cmsText("InternationalCoProductionsPage","f675207c94557979","Start an international conversation")}</CTA></div></div><MotionCopy className="finance-disclaimer">{cmsText("InternationalCoProductionsPage","147bacaf278c4632","Kemsor coordinates co-production and production planning. It does not provide legal, tax or investment advice, or confirm eligibility for treaties or incentives.")}</MotionCopy></section>
  </div></FinanceLayout>;
}
