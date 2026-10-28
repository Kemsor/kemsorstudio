import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import EditorialPage from '../EditorialPage';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './story-script.css';

const reads = [
  {label:'THE CREATIVE READ', title:'Does it move a reader?', line:'The story on its own terms.', points:['Structure and pacing','Character goals and change','Stakes that keep rising','Tone, voice and dialogue','Who it’s for, and why they’ll care']},
  {label:'THE PRODUCTION READ', title:'Can it be made well?', line:'The story as a production.', points:['Locations: how many, and where','Cast size and key roles','Day, night, period and weather','Stunts, VFX and special needs','What the page will cost to shoot']},
];
const stages = [
  ['Idea','A logline that captures the story in one line'],
  ['Concept','A one-page synopsis covering story, characters and audience'],
  ['Treatment or series bible','The full story in prose; for series, the world, characters and season arc'],
  ['First draft','Structural notes on the whole script'],
  ['Revisions','Focused notes, draft by draft'],
  ['Production-ready draft','A script ready to package, budget and schedule'],
];
const notes = [
  ['Story first','Every note is based on what the story needs rather than personal taste.'],
  ['Specific, never vague','We point to the page, the scene and the reason.'],
  ['The writer leads','We suggest; the writer decides and rewrites.'],
  ['Protect the voice','Development should make the script more itself, not less.'],
];
const formats = [
  ['Feature Films','A story that sustains its full running time, with a clear spine and a strong ending'],
  ['Series & OTT','A pilot that hooks, a season arc that holds, and a series bible platforms can assess'],
  ['Documentaries','Research, access and a story outline that can adapt as real life unfolds'],
  ['Short Films','One idea, fully realised, with every scene serving the story'],
];
const deliverables = [
  'Written script notes covering creative and production needs',
  'Logline and one-page synopsis',
  'Treatment or series bible, where needed',
  'A production read: scenes flagged for cost and complexity',
  'A clear recommendation on the next step',
];
const questions = [
  ['Will you rewrite my script?','No. You lead the rewrite. We give notes, talk them through and support each draft.'],
  ['Is my work safe when I share it?',<>Scripts are shared through <a href="/script-to-production/">Script to Production</a>, where terms are accepted before any review.</>],
  ['Can you develop documentaries?','Yes. For documentaries, we develop the research, access plan, and story outline, knowing the story will evolve during the shoot.'],
  ['What if the script isn’t ready yet?','That’s what development is for. An idea or treatment is enough to begin.'],
];
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Develop_01_Story_and_Script_Development_Content.docx.pdf.
export default function StoryScriptPage() {
  return <EditorialPage page="story-script"><div className="produce-hub story-script-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/develop/">Develop</a><span aria-hidden="true">/</span><span aria-current="page">Story &amp; Script</span></nav>
    <section className="produce-hero" aria-labelledby="story-script-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/daylight-interior-production-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-interior-production-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">01 · DEVELOP · STORY &amp; SCRIPT</p><MotionHeading as="h1" id="story-script-title">Story &amp; Script Development.<span>Every draft closer to the screen.</span></MotionHeading><MotionCopy>We work with writers and directors on structure, characters and a script that reads well and can be made.</MotionCopy><div className="produce-actions"><CTA href="/script-to-production/">Send us your script</CTA><TextLink href="#how-we-give-notes">How we give notes</TextLink></div></div>
      <div className="editorial-hero-graphic story-script-sample" aria-label="Illustrative screenplay with creative and production margin notes"><p className="story-sample-label">SCREENPLAY STUDY · ILLUSTRATIVE</p><div className="story-sample-paper"><div className="story-script-lines" aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i}/>)}</div><span className="story-margin-note">What does she want here?</span><span className="story-margin-note">Raise the stakes</span><span className="story-margin-note">Night exterior: can this be day?</span></div><p className="story-sample-caption">Creative notes and production notes, on the same page.</p></div>
    </section>

    <nav className="finance-subnav" aria-label="Development services"><span>01 · DEVELOP</span><a href="/develop/">Overview</a><a href="/develop/story-script/" aria-current="page">Story &amp; Script</a><a href="/develop/packaging-talent/">Packaging &amp; Talent</a><a href="/develop/budgeting-scheduling/">Budgeting &amp; Scheduling</a></nav>

    <section className="produce-section" id="two-tests" aria-labelledby="tests-title"><Label>TWO TESTS · EVERY SCRIPT MUST PASS BOTH</Label><MotionHeading as="h2" id="tests-title">A script has to pass two tests.<br/><em>Most development only checks one.</em></MotionHeading><MotionCopy className="story-intro">It has to move a reader. And it has to be makeable. Because Kemsor also produces, we read every script with both eyes open.</MotionCopy><div className="story-reads">{reads.map(read=><article key={read.label}><p className="story-small">{read.label}</p><h3>{read.title}</h3><p>{read.line}</p><ul>{read.points.map(line=><li key={line}>{line}</li>)}</ul></article>)}</div></section>

    <section className="produce-section" id="idea-to-draft" aria-labelledby="stages-title"><Label>FROM IDEA TO DRAFT</Label><MotionHeading as="h2" id="stages-title">Wherever your story is,<br/><em>we take the next step.</em></MotionHeading><p className="story-table-label">WHAT WE DEVELOP AT EACH STAGE</p><div className="story-stages">{stages.map(([title,body],i)=><article key={title}><span className="story-small">0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="how-we-give-notes" aria-labelledby="notes-title"><Label>HOW WE GIVE NOTES · NOTES THAT HELP</Label><MotionHeading as="h2" id="notes-title">Notes that help.<br/><em>Not notes that hurt.</em></MotionHeading><MotionCopy className="story-intro">Good notes make a writer want to open the file again. These are the rules we hold ourselves to.</MotionCopy><ol className="story-notes">{notes.map(([title,body],i)=><li key={title}><span className="story-small">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>

    <section className="produce-section" id="by-format" aria-labelledby="formats-title"><Label>BY FORMAT · EACH FORMAT DEVELOPS DIFFERENTLY</Label><MotionHeading as="h2" id="formats-title">Every format<br/><em>develops differently.</em></MotionHeading><div className="story-formats">{formats.map(([title,body],i)=><article key={title}><span className="story-small">0{i+1} / 04</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="what-you-receive" aria-labelledby="receive-title"><Label>WHAT YOU RECEIVE · AND WHO IT’S FOR</Label><MotionHeading as="h2" id="receive-title">What you receive.<br/><em>In writing, every time.</em></MotionHeading><ul className="story-deliverables">{deliverables.map(line=><li key={line}>{line}</li>)}</ul></section>

    {/* No approved project title, format, year or story development credits supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>QUESTIONS · ABOUT YOUR SCRIPT</Label><MotionHeading as="h2" id="questions-title">Questions<br/><em>writers ask.</em></MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="send-your-script" aria-labelledby="closing-title"><Label>01 · DEVELOP</Label><div><MotionHeading as="h2" id="closing-title">Send us the draft.<br/><em>Or just the idea.</em></MotionHeading><div><MotionCopy>Wherever the story is today, we’ll help you take it one draft closer to the screen.</MotionCopy><div className="produce-actions"><CTA href="/script-to-production/">Send us your script</CTA><TextLink href="/script-to-production/">Script to Production</TextLink></div></div></div></section>
  </div></EditorialPage>;
}
