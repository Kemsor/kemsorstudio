import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import EditorialPage from '../EditorialPage';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './story-script.css';

const reads = cmsData(()=>([
  {label:cmsText("StoryScriptPage","d7f081ee769105a5","THE CREATIVE READ"), title:cmsText("StoryScriptPage","38a7c5e474761136","Does it move a reader?"), line:cmsText("StoryScriptPage","fd2b2d2bf18c2703","The story on its own terms."), points:[cmsText("StoryScriptPage","3cbeb9a87070a356","Structure and pacing"),cmsText("StoryScriptPage","59320fa2d0d7c7bc","Character goals and change"),cmsText("StoryScriptPage","2972f1cdac94e47b","Stakes that keep rising"),cmsText("StoryScriptPage","165469b7ccf94be8","Tone, voice and dialogue"),cmsText("StoryScriptPage","a8132e3c21eb186b","Who it’s for, and why they’ll care")]},
  {label:cmsText("StoryScriptPage","1ec0006c3409d445","THE PRODUCTION READ"), title:cmsText("StoryScriptPage","b7b9d159e7e078ce","Can it be made well?"), line:cmsText("StoryScriptPage","8a9652ca95aa5882","The story as a production."), points:[cmsText("StoryScriptPage","78f231b2d81146ee","Locations: how many, and where"),cmsText("StoryScriptPage","cef1ec402360e841","Cast size and key roles"),cmsText("StoryScriptPage","c4e48f087e72bf79","Day, night, period and weather"),cmsText("StoryScriptPage","72e539c2d61e48a4","Stunts, VFX and special needs"),cmsText("StoryScriptPage","c6ede170ffba8116","What the page will cost to shoot")]},
]));
const stages = cmsData(()=>([
  [cmsText("StoryScriptPage","f9c63192a95f5440","Idea"),cmsText("StoryScriptPage","61069ce4ba0cd1f6","A logline that captures the story in one line")],
  [cmsText("StoryScriptPage","57822fd959a22bd1","Concept"),cmsText("StoryScriptPage","28071fff620694a5","A one-page synopsis covering story, characters and audience")],
  [cmsText("StoryScriptPage","515b8b590ccfc239","Treatment or series bible"),cmsText("StoryScriptPage","4833032a5720d1a9","The full story in prose; for series, the world, characters and season arc")],
  [cmsText("StoryScriptPage","a3c49619c0969cca","First draft"),cmsText("StoryScriptPage","002e11c79bb42bd9","Structural notes on the whole script")],
  [cmsText("StoryScriptPage","ce5ec6f5fbc4231a","Revisions"),cmsText("StoryScriptPage","d2939290bc2e5332","Focused notes, draft by draft")],
  [cmsText("StoryScriptPage","66c1f64bcdd988fa","Production-ready draft"),cmsText("StoryScriptPage","af7b82ef0cd1924e","A script ready to package, budget and schedule")],
]));
const notes = cmsData(()=>([
  [cmsText("StoryScriptPage","24a9ecc6ddf71027","Story first"),cmsText("StoryScriptPage","e517b6b5bd32e384","Every note is based on what the story needs rather than personal taste.")],
  [cmsText("StoryScriptPage","ad66cf2fb5948762","Specific, never vague"),cmsText("StoryScriptPage","bbd435b9fd4d718e","We point to the page, the scene and the reason.")],
  [cmsText("StoryScriptPage","1be346b548481099","The writer leads"),cmsText("StoryScriptPage","3bb164c4483ff641","We suggest; the writer decides and rewrites.")],
  [cmsText("StoryScriptPage","6b595ecf0d348eb6","Protect the voice"),cmsText("StoryScriptPage","cd058992205dc8a0","Development should make the script more itself, not less.")],
]));
const formats = cmsData(()=>([
  [cmsText("StoryScriptPage","4f42c53938e6ac9e","Feature Films"),cmsText("StoryScriptPage","a89c9282a3222132","A story that sustains its full running time, with a clear spine and a strong ending")],
  [cmsText("StoryScriptPage","5c99df9b873f9142","Series & OTT"),cmsText("StoryScriptPage","fe85b6bbaa79bdae","A pilot that hooks, a season arc that holds, and a series bible platforms can assess")],
  [cmsText("StoryScriptPage","92f57e0f55950fe4","Documentaries"),cmsText("StoryScriptPage","88e105e371c98400","Research, access and a story outline that can adapt as real life unfolds")],
  [cmsText("StoryScriptPage","7c991b4ed0d1640b","Short Films"),cmsText("StoryScriptPage","b2df107d191c5fa1","One idea, fully realised, with every scene serving the story")],
]));
const deliverables = cmsData(()=>([
  cmsText("StoryScriptPage","9b2069b343cd12a8","Written script notes covering creative and production needs"),
  cmsText("StoryScriptPage","9f22226f48d1be27","Logline and one-page synopsis"),
  cmsText("StoryScriptPage","7a7dda15ed7fcda7","Treatment or series bible, where needed"),
  cmsText("StoryScriptPage","561d5402a8d23370","A production read: scenes flagged for cost and complexity"),
  cmsText("StoryScriptPage","56d37430427dd3d8","A clear recommendation on the next step"),
]));
const questions = cmsData(()=>([
  [cmsText("StoryScriptPage","2a1ae4091ffb75b6","Will you rewrite my script?"),cmsText("StoryScriptPage","5a456a586bd92794","No. You lead the rewrite. We give notes, talk them through and support each draft.")],
  [cmsText("StoryScriptPage","b3831e713530d01d","Is my work safe when I share it?"),<>{cmsText("StoryScriptPage","76b3fcc2534cfee0","Scripts are shared through ")}<a href="/script-to-production/">{cmsText("StoryScriptPage","a3d27aabe75ed0a9","Script to Production")}</a>{cmsText("StoryScriptPage","9f6ec39b50778546",", where terms are accepted before any review.")}</>],
  [cmsText("StoryScriptPage","78a8833b53c4a1cd","Can you develop documentaries?"),cmsText("StoryScriptPage","713ad61097181907","Yes. For documentaries, we develop the research, access plan, and story outline, knowing the story will evolve during the shoot.")],
  [cmsText("StoryScriptPage","020b39a0cbc2e0c8","What if the script isn’t ready yet?"),cmsText("StoryScriptPage","81ef26bb86c0366a","That’s what development is for. An idea or treatment is enough to begin.")],
]));
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Develop_01_Story_and_Script_Development_Content.docx.pdf.
export default function StoryScriptPage() {
  return <EditorialPage page="story-script"><div className="produce-hub story-script-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("StoryScriptPage","a2379c4d70fc7517","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/develop/">{cmsText("StoryScriptPage","852695cac633aa51","Develop")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("StoryScriptPage","f14bed8eb339fa3a","Story & Script")}</span></nav>
    <section className="inner-hero produce-hero" aria-labelledby="story-script-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="StoryScriptPage-1" src="/assets/stills/daylight-interior-production-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-interior-production-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("StoryScriptPage","4805fdb119aa06c3","01 · DEVELOP · STORY & SCRIPT")}</p><MotionHeading as="h1" id="story-script-title">{cmsText("StoryScriptPage","fd1d3ca731cb4a37","Story & Script Development.")}<span>{cmsText("StoryScriptPage","ccb6aac1503779f8","Every draft closer to the screen.")}</span></MotionHeading><MotionCopy>{cmsText("StoryScriptPage","220888bd31e4bd07","We work with writers and directors on structure, characters and a script that reads well and can be made.")}</MotionCopy><div className="produce-actions"><CTA href="/script-to-production/">{cmsText("StoryScriptPage","4218fe684e288729","Send us your script")}</CTA><TextLink href="#how-we-give-notes">{cmsText("StoryScriptPage","71de5e8c7cb559b4","How we give notes")}</TextLink></div></div>
      <div className="editorial-hero-graphic story-script-sample" aria-label="Illustrative screenplay with creative and production margin notes"><p className="story-sample-label">{cmsText("StoryScriptPage","0fd84c854929b2ca","SCREENPLAY STUDY · ILLUSTRATIVE")}</p><div className="story-sample-paper"><div className="story-script-lines" aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i}/>)}</div><span className="story-margin-note">{cmsText("StoryScriptPage","c2de5b42c09170c8","What does she want here?")}</span><span className="story-margin-note">{cmsText("StoryScriptPage","48d0f73ac09e9eb7","Raise the stakes")}</span><span className="story-margin-note">{cmsText("StoryScriptPage","137f5180bc9c6b02","Night exterior: can this be day?")}</span></div><p className="story-sample-caption">{cmsText("StoryScriptPage","5058146ab8166833","Creative notes and production notes, on the same page.")}</p></div>
    </section>

    <nav className="finance-subnav" aria-label="Development services"><span>{cmsText("StoryScriptPage","4767bfc10d69e61f","01 · DEVELOP")}</span><a href="/develop/">{cmsText("StoryScriptPage","3afb17bc9189676c","Overview")}</a><a href="/develop/story-script/" aria-current="page">{cmsText("StoryScriptPage","48c880428ba2e4aa","Story & Script")}</a><a href="/develop/packaging-talent/">{cmsText("StoryScriptPage","7ba7a9d129cad382","Packaging & Talent")}</a><a href="/develop/budgeting-scheduling/">{cmsText("StoryScriptPage","4ca657f238aad28d","Budgeting & Scheduling")}</a></nav>

    <section className="produce-section" id="two-tests" aria-labelledby="tests-title"><Label>{cmsText("StoryScriptPage","13fad49b387ad1f2","TWO TESTS · EVERY SCRIPT MUST PASS BOTH")}</Label><MotionHeading as="h2" id="tests-title">{cmsText("StoryScriptPage","4dc47abd4e398b25","A script has to pass two tests.")}<br/><em>{cmsText("StoryScriptPage","e7721cb456f12fde","Most development only checks one.")}</em></MotionHeading><MotionCopy className="story-intro">{cmsText("StoryScriptPage","622c2cd37d56a702","We review how the story reads and what it will take to produce. Our notes cover the writing as well as practical filming requirements.")}</MotionCopy><div className="story-reads">{reads.map(read=><article key={read.label}><p className="story-small">{read.label}</p><h3>{read.title}</h3><p>{read.line}</p><ul>{read.points.map(line=><li key={line}>{line}</li>)}</ul></article>)}</div></section>

    <section className="produce-section" id="idea-to-draft" aria-labelledby="stages-title"><Label>{cmsText("StoryScriptPage","6aeaf9acd4f860fc","FROM IDEA TO DRAFT")}</Label><MotionHeading as="h2" id="stages-title">{cmsText("StoryScriptPage","fba0c8f412aeb9cd","Wherever your story is,")}<br/><em>{cmsText("StoryScriptPage","8549a64c8473168c","we take the next step.")}</em></MotionHeading><p className="story-table-label">{cmsText("StoryScriptPage","9f5b0cc8e26a2bd7","WHAT WE DEVELOP AT EACH STAGE")}</p><div className="story-stages">{stages.map(([title,body],i)=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="how-we-give-notes" aria-labelledby="notes-title"><Label>{cmsText("StoryScriptPage","1a2ef27c461c3438","HOW WE GIVE NOTES · NOTES THAT HELP")}</Label><MotionHeading as="h2" id="notes-title">{cmsText("StoryScriptPage","cf5259dc305d0114","Notes that help.")}<br/><em>{cmsText("StoryScriptPage","8d02235b5acd550a","Clear, useful feedback.")}</em></MotionHeading><MotionCopy className="story-intro">{cmsText("StoryScriptPage","a624a30c94ac833c","Good notes make a writer want to open the file again. These are the rules we hold ourselves to.")}</MotionCopy><ol className="story-notes">{notes.map(([title,body],i)=><li key={title}><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>

    <section className="produce-section" id="by-format" aria-labelledby="formats-title"><Label>{cmsText("StoryScriptPage","394910e9aa937f17","BY FORMAT · EACH FORMAT DEVELOPS DIFFERENTLY")}</Label><MotionHeading as="h2" id="formats-title">{cmsText("StoryScriptPage","54f2d02411e58f04","Every format")}<br/><em>{cmsText("StoryScriptPage","9c551dff10e0398a","develops differently.")}</em></MotionHeading><div className="story-formats">{formats.map(([title,body],i)=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="what-you-receive" aria-labelledby="receive-title"><Label>{cmsText("StoryScriptPage","da711844ea53b488","WHAT YOU RECEIVE · AND WHO IT’S FOR")}</Label><MotionHeading as="h2" id="receive-title">{cmsText("StoryScriptPage","3cf111cf26a205b0","What you receive.")}<br/><em>{cmsText("StoryScriptPage","1a2881a07fa0697d","In writing, every time.")}</em></MotionHeading><ul className="story-deliverables">{deliverables.map(line=><li key={line}>{line}</li>)}</ul></section>

    {/* No approved project title, format, year or story development credits supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>{cmsText("StoryScriptPage","616af9238edaeb39","RELATED WORK")}</Label><div><MotionHeading as="h2" id="work-title">{cmsText("StoryScriptPage","036ded52482a776b","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("StoryScriptPage","3713ef67d7e0f2ae","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>{cmsText("StoryScriptPage","e9ac497fe23d494c","QUESTIONS · ABOUT YOUR SCRIPT")}</Label><MotionHeading as="h2" id="questions-title">{cmsText("StoryScriptPage","f83f85ea5038d666","Questions")}<br/><em>{cmsText("StoryScriptPage","507aeed5289a8d30","writers ask.")}</em></MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing inner-closing" id="send-your-script" aria-labelledby="closing-title"><Label>{cmsText("StoryScriptPage","3566bab6dae313b7","01 · DEVELOP")}</Label><div><MotionHeading as="h2" id="closing-title">{cmsText("StoryScriptPage","aee1c4747fc69f39","Send us the draft.")}<br/><em>{cmsText("StoryScriptPage","10a19690ba2f57f0","Or just the idea.")}</em></MotionHeading><div><MotionCopy>{cmsText("StoryScriptPage","303c7b2eb5987b31","Wherever the story is today, we’ll help you take it one draft closer to the screen.")}</MotionCopy><div className="produce-actions"><CTA href="/script-to-production/">{cmsText("StoryScriptPage","762fcec2d1437612","Send us your script")}</CTA><TextLink href="/script-to-production/">{cmsText("StoryScriptPage","41fd80d2cad94a5b","Script to Production")}</TextLink></div></div></div></section>
  </div></EditorialPage>;
}
