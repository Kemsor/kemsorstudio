import {cmsText,cmsData} from '../siteContent';
import PageVisuals from '../VisualChapters';
import SiteIcon from '../SiteIcon';
import React, { useLayoutEffect, useRef, useState } from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import { useReducedMotion } from '../useMotion';
import './series-ott.css';

const episodeTitles = cmsData(()=>([cmsText("SeriesOttPage","3c6d7013a5ab5155","The promise"), cmsText("SeriesOttPage","206e37f6fe42568e","The hook deepens"), cmsText("SeriesOttPage","e4f2bf29744ab429","First twist"), cmsText("SeriesOttPage","7deea8616a153e60","Midpoint"), cmsText("SeriesOttPage","fb28b3683581a779","Everything changes"), cmsText("SeriesOttPage","e1cba169632f9e49","The cost"), cmsText("SeriesOttPage","dc8d095b0572a6d6","Into the dark"), cmsText("SeriesOttPage","c08e6890f535d653","The payoff")]));
const platformNeeds = cmsData(()=>([
  [cmsText("SeriesOttPage","e7f5c228dd299fc5","A clear idea of who it’s for"), cmsText("SeriesOttPage","1af3fedc05c19096","An audience-first logline and positioning")],
  [cmsText("SeriesOttPage","12ee726aa19c02c7","A pilot that hooks"), cmsText("SeriesOttPage","9cf8f026f8c19dcc","Pilot development with structural notes")],
  [cmsText("SeriesOttPage","326e5a1f6eb2ede2","A season that holds"), cmsText("SeriesOttPage","ffdb824c1921608b","A season arc, episode by episode")],
  [cmsText("SeriesOttPage","b8b0930e6127b510","A world worth returning to"), cmsText("SeriesOttPage","e1e416a9e4834b88","A series bible: world, characters, tone and future seasons")],
  [cmsText("SeriesOttPage","c0001c3fc5b43e62","People who can deliver it"), cmsText("SeriesOttPage","2ba3bbebdc2244cc","A creator, director and lead-cast package")],
  [cmsText("SeriesOttPage","a1c787f2f5a9a600","Numbers that hold up"), cmsText("SeriesOttPage","4a46da163579fbeb","A season budget and block schedule")],
]));
const problems = cmsData(()=>([
  [cmsText("SeriesOttPage","b444fd2c12d3ca13","It’s shot out of order"), cmsText("SeriesOttPage","6576e9839dbb5756","Scenes from many episodes are shot together, location by location. One script change can affect several episodes at once."), cmsText("SeriesOttPage","16fb55d4372299d9","Scripts locked by block, with a change log across episodes.")],
  [cmsText("SeriesOttPage","ce4056afaf8f7feb","Cast is needed for months"), cmsText("SeriesOttPage","9281deb997fde8ea","Lead actors are committed across a long schedule, alongside other work."), cmsText("SeriesOttPage","b4af1fadea08df95","Cast availability built into the schedule from day one.")],
  [cmsText("SeriesOttPage","43a311314d308756","Many directors, one show"), cmsText("SeriesOttPage","60ec9dcacbfc62e9","Episodes are often split between directors, but the audience must feel one voice."), cmsText("SeriesOttPage","12fb9b1c955cc8f7","A shared look book, tone guide and continuity system.")],
  [cmsText("SeriesOttPage","9306df85f0e20568","Every episode is a delivery"), cmsText("SeriesOttPage","8c23bfa2857f0b36","Each episode needs its own masters, subtitles, artwork and QC."), cmsText("SeriesOttPage","58921499351e7dfa","An episodic post and delivery pipeline, tracked episode by episode.")],
]));
const pipeline = cmsData(()=>([
  [cmsText("SeriesOttPage","a1f59b7c01b38180","Develop"), cmsText("SeriesOttPage","6e496b7aa0922646","Pilot, season arc and series bible")],
  [cmsText("SeriesOttPage","72cd4a9c9f1c66d1","Package"), cmsText("SeriesOttPage","4294643d76fbc055","Creator, director and lead cast")],
  [cmsText("SeriesOttPage","3dbb9b22f340daec","Pitch"), cmsText("SeriesOttPage","fc4219f1a42f16a2","Package tailored to the platform")],
  [cmsText("SeriesOttPage","3be328948f7ec809","Plan"), cmsText("SeriesOttPage","7eb4040c11aabc32","Season budget and block schedule")],
  [cmsText("SeriesOttPage","3d0f3818a575263b","Shoot"), cmsText("SeriesOttPage","114c0787dc0f70cc","Block by block, with daily reports")],
  [cmsText("SeriesOttPage","e34e5b29406357e5","Deliver"), cmsText("SeriesOttPage","b4a3500eb1f494cf","Episodic post, QC and platform deliverables")],
]));
const formats = cmsData(()=>([
  [cmsText("SeriesOttPage","5720e78bfda210d6","Limited series"), cmsText("SeriesOttPage","aef098986bcbecca","One story, told completely in one season.")],
  [cmsText("SeriesOttPage","003badbf78ae22d7","Returning series"), cmsText("SeriesOttPage","f7f3de27f9fb59e3","A world built to come back season after season.")],
  [cmsText("SeriesOttPage","a573a223018597fe","Docuseries"), cmsText("SeriesOttPage","aea2c65bf8389108","Real stories with an episodic shape.")],
  [cmsText("SeriesOttPage","1a6ad5c06e099c24","Regional-language series"), cmsText("SeriesOttPage","7fc3e02b8e48b63d","Stories in the language of their place, made for streaming audiences.")],
]));
const questions = cmsData(()=>([
  [cmsText("SeriesOttPage","e76b2ac1cec00a96","Do I need the whole season written?"), cmsText("SeriesOttPage","d887d9e62069991a","Usually not. A pilot script, a season arc and a series bible are often enough to start conversations.")],
  [cmsText("SeriesOttPage","930bad54151b4e54","Do you take series to platforms?"), cmsText("SeriesOttPage","f0587b77132c13be","We prepare and package the series with you, and coordinate conversations with platforms where it’s the right fit.")],
  [cmsText("SeriesOttPage","9ec490cac20a1b49","Can you produce a series that’s already commissioned?"), cmsText("SeriesOttPage","d7dd6b749ca353cf","Yes. We can plan and run production for a commissioned season, or the parts you need.")],
  [cmsText("SeriesOttPage","8f4ea440d0490053","Do you make docuseries?"), cmsText("SeriesOttPage","4ff2952d54bbb7c2","Yes. We plan research, access and an episodic story shape that can adapt as filming unfolds.")],
]));
const locations = cmsData(()=>([cmsText("SeriesOttPage","e7373c758d5e4b04","Family home"), cmsText("SeriesOttPage","0f45614ada775998","Police station"), cmsText("SeriesOttPage","143f4482ab7fc3aa","Market")]));
// Illustrative scenes only; these are the same twelve scenes in both views.
const scenes = Array.from({ length:12 }, (_, index) => ({ id:index + 1, episode:Math.floor(index / 3) + 1, location:index % 3 }));

function Label({ children, number }) {
  return <div className="series-label"><span>{children}</span><span aria-hidden="true">{number}</span></div>;
}
function WritersBoard() {
  return <div className="series-writers-board" aria-labelledby="series-board-title">
    <p className="series-board-label" id="series-board-title">{cmsText("SeriesOttPage","d1622cf2c19e113d","SEASON 1 · YOUR SERIES")}</p>
    <ol className="series-board-episodes">{episodeTitles.map((title,index) => <li key={title}><span>{cmsText("SeriesOttPage","bce4521c3459eedd","EP ")}{String(index + 1).padStart(2,'0')}</span><p>{title}</p><i aria-hidden="true"/></li>)}</ol>
    <ul className="series-story-threads" aria-label="Story threads">{[cmsText("SeriesOttPage","f4ab2b8abc971969","Main story"),cmsText("SeriesOttPage","bdf056afa93f799e","Character arc"),cmsText("SeriesOttPage","2c07c7a0f96585cc","Mystery thread")].map((thread,index) => <li key={thread}><span className={`series-thread series-thread-${index}`} aria-hidden="true"/>{thread}</li>)}</ul>
  </div>;
}
function SeasonPlan() {
  const [view, setView] = useState('audience');
  const reduced = useReducedMotion();
  const tiles = useRef(new Map());
  const before = useRef(null);
  const audience = view === 'audience';
  const orderedScenes = audience ? scenes : [...scenes].sort((a,b) => a.location - b.location || a.episode - b.episode);
  const changeView = next => {
    if(next === view)return;
    before.current = reduced ? null : new Map([...tiles.current].map(([id, node]) => [id, node.getBoundingClientRect()]));
    setView(next);
  };
  useLayoutEffect(() => {
    const previous = before.current;
    before.current = null;
    if(!previous || reduced)return;
    const animations = [];
    for(const [id, node] of tiles.current){
      const old = previous.get(id), current = node.getBoundingClientRect();
      if(old && typeof node.animate === 'function')animations.push(node.animate([
        { transform:`translate(${old.left - current.left}px, ${old.top - current.top}px)`, opacity:.65 },
        { transform:cmsText("SeriesOttPage","eaac90a3575fc0fd","translate(0, 0)"), opacity:1 },
      ],{ duration:650, easing:'cubic-bezier(.22,.61,.36,1)' }));
    }
    return () => animations.forEach(animation => animation.cancel());
  },[view,reduced]);
  return <div className="series-season-plan">
    <div className="series-view-toggle" role="group" aria-label="Season shooting plan view"><button type="button" aria-pressed={audience} aria-controls="series-scenes-panel" onClick={() => changeView('audience')}>{cmsText("SeriesOttPage","42539d61a9598846","How the audience watches")}</button><button type="button" aria-pressed={!audience} aria-controls="series-scenes-panel" onClick={() => changeView('crew')}>{cmsText("SeriesOttPage","5115bb40dc32ba11","How the crew shoots")}</button></div>
    <div className="series-scene-legend" aria-label="Episode colours">{[1,2,3,4].map(episode => <span key={episode} className={`series-episode-${episode}`}><i aria-hidden="true"/>{cmsText("SeriesOttPage","71c863737703e2cc","Episode ")}{episode}</span>)}</div>
    <div className="series-scenes-scroll" role="region" aria-label={audience ? 'Scenes grouped by episode' : 'Scenes grouped by location'} tabIndex="0" id="series-scenes-panel">
      <div className={`series-scenes-layout ${audience ? 'series-audience-view' : 'series-crew-view'}`}>
        <div className="series-scene-headings" aria-live="polite">{audience ? [1,2,3,4].map(episode => <h3 key={episode}>{cmsText("SeriesOttPage","3d7ddea8047d7299","Episode ")}{episode}</h3>) : locations.map((location,index) => <h3 key={location}><span>{cmsText("SeriesOttPage","b8ed7c31efdc9f17","Block ")}{index + 1}{cmsText("SeriesOttPage","14b3979289e7e25c"," · Location ")}{String.fromCharCode(65 + index)}</span>{location}</h3>)}</div>
        <ol className="series-scene-grid" aria-label={audience ? 'Episode order' : 'Location blocks'}>{orderedScenes.map(scene => <li key={scene.id} ref={node => {if(node)tiles.current.set(scene.id,node);else tiles.current.delete(scene.id);}} className={`series-scene series-episode-${scene.episode}`} data-scene={scene.id} data-episode={scene.episode} data-location={scene.location} style={{ gridColumn:audience ? scene.episode : scene.location + 1, gridRow:audience ? scene.location + 1 : scene.episode }}><span>{cmsText("SeriesOttPage","c83d95031badc2ca","EP ")}{String(scene.episode).padStart(2,'0')}{cmsText("SeriesOttPage","7713fbc2c40942e3"," · SC ")}{String(scene.id).padStart(2,'0')}</span><p>{locations[scene.location]}</p></li>)}</ol>
      </div>
    </div>
    <p className="series-plan-caption">{cmsText("SeriesOttPage","3fc88ff5ee31f6c9","Illustrative: 4 episodes, 12 scenes, 3 locations. Colour = episode.")}</p>
  </div>;
}

export default function SeriesOttPage() {
  return <PageVisuals page="series-ott"><div className="series-ott-page">
    <section className="inner-hero series-hero series-width" aria-labelledby="series-title">
      <div className="series-hero-grid"><div><p className="series-kicker">{cmsText("SeriesOttPage","2e69786ebe77452e","PRODUCTIONS · SERIES & OTT")}</p><MotionHeading as="h1" id="series-title">{cmsText("SeriesOttPage","5011f50ffbf0e88f","Series & OTT.")}</MotionHeading><MotionHeading as="h2" className="series-hero-accent">{cmsText("SeriesOttPage","9c7af18d25fb52c8","Eight episodes. ")}<em>{cmsText("SeriesOttPage","2c0f21f8a40a6880","One promise.")}</em></MotionHeading><MotionCopy>{cmsText("SeriesOttPage","3adef39849029027","Kemsor plans each series across the full season. We coordinate scripts, cast, filming and post-production so the story, visual approach and delivery requirements remain consistent across episodes.")}</MotionCopy><div className="series-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("SeriesOttPage","17bd02dc9d960e8d","Talk to us about your series")}</CTA><TextLink href="#season-shooting">{cmsText("SeriesOttPage","325c6e50f14a6885","See how a season is shot")}</TextLink></div></div><WritersBoard/></div>
    </section>
    <SectionSubmenu section="what-we-make" page="series-ott"/>

    <section className="series-section series-width" aria-labelledby="series-commission-title">
      <Label number="01">{cmsText("SeriesOttPage","923748cf27976c2e","BEFORE A SERIES IS COMMISSIONED")}</Label>
      <MotionHeading as="h2" id="series-commission-title">{cmsText("SeriesOttPage","8e2d31f649fb669e","What platforms usually look for ")}<em>{cmsText("SeriesOttPage","ba12d7cabad9d04d","and what we build with you.")}</em></MotionHeading>
      <div className="series-commission-head studio-ledger-head" aria-hidden="true"><span>{cmsText("SeriesOttPage","3340aabb3bc86a75","Platforms usually look for")}</span><span>{cmsText("SeriesOttPage","f14f7f60e0d1a4d3","We build with you")}</span></div><dl className="series-commission-list studio-ledger studio-ledger-pairs">{platformNeeds.map(([need, support]) => <div key={need}><dt>{need}</dt><dd>{support}</dd></div>)}</dl>
      <MotionCopy className="series-platform-note">{cmsText("SeriesOttPage","60df4d42091923f8","Every platform has its own priorities. We tailor the package to the one you’re approaching.")}</MotionCopy>
    </section>

    <section className="series-section series-width" aria-labelledby="series-problem-title">
      <Label number="02">{cmsText("SeriesOttPage","42bc0cd5901f9d51","THE SEASON PROBLEM")}</Label>
      <MotionHeading as="h2" id="series-problem-title">{cmsText("SeriesOttPage","79a4952948156a94","Why a series isn’t just a long film.")}</MotionHeading>
      <div className="series-problem-head" aria-hidden="true"><span>{cmsText("SeriesOttPage","084490226f82c0ec","Problem")}</span><span>{cmsText("SeriesOttPage","fc452027ea6585c9","Why it happens")}</span><span>{cmsText("SeriesOttPage","22acb6ca5d512b51","How we plan")}</span></div><div className="series-problems">{problems.map(([problem, why, plan]) => <article key={problem}><h3>{problem}</h3><p><span className="series-mobile-label">{cmsText("SeriesOttPage","0f7d3b99a38703a4","Why it happens")}</span>{why}</p><p><span className="series-mobile-label">{cmsText("SeriesOttPage","e1f3857bbd6dedcf","How we plan")}</span>{plan}</p></article>)}</div>
    </section>

    <section className="series-section series-width" id="season-shooting" aria-labelledby="series-shooting-title">
      <Label number="03">{cmsText("SeriesOttPage","80b9b8f2395407f8","HOW A SEASON IS SHOT")}</Label>
      <div className="series-intro-grid"><MotionHeading as="h2" id="series-shooting-title">{cmsText("SeriesOttPage","555fb2b1b4c12b0f","The audience watches in order. ")}<em>{cmsText("SeriesOttPage","dca91d2f2e0d35d2","The crew shoots by location.")}</em></MotionHeading><MotionCopy>{cmsText("SeriesOttPage","31a8160937187064","Toggle the views to see how scenes from four episodes are regrouped into shoot blocks and why planning a series is a different craft.")}</MotionCopy></div>
      <SeasonPlan/>
    </section>

    <section className="series-section series-width" aria-labelledby="series-pipeline-title">
      <Label number="04">{cmsText("SeriesOttPage","eb1e16bbe81807bc","FROM PITCH TO PLATFORM")}</Label>
      <MotionHeading as="h2" id="series-pipeline-title">{cmsText("SeriesOttPage","02df239c97c41bf7","From pitch to platform.")}</MotionHeading>
      <ol className="series-pipeline">{pipeline.map(([title, copy],index) => <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>
    </section>

    <section className="series-section series-width" aria-labelledby="series-formats-title">
      <Label number="05">{cmsText("SeriesOttPage","30cf444921b0e7d5","SERIES WE MAKE")}</Label>
      <div className="series-intro-grid"><MotionHeading as="h2" id="series-formats-title">{cmsText("SeriesOttPage","985f497eb45dc3a1","Series we make.")}</MotionHeading><dl className="series-format-list studio-ledger studio-ledger-pairs">{formats.map(([type, copy]) => <div key={type}><dt>{type}</dt><dd>{copy}</dd></div>)}</dl></div>
    </section>

    <section className="series-section series-width" aria-labelledby="series-slate-title">
      <Label number="06">{cmsText("SeriesOttPage","c4365dc29d5f8fcc","ON OUR SLATE")}</Label>
      <div className="series-intro-grid"><MotionHeading as="h2" id="series-slate-title">{cmsText("SeriesOttPage","faa7d28563b5c045","Series.")}</MotionHeading><div><TextLink href="/productions/#series-ott">{cmsText("SeriesOttPage","790b8df0fa71a26f","See all series")}</TextLink></div></div>
      {/* Stills, titles, seasons, episode counts, language, platform, year and roles require confirmed production records. */}
    </section>

    <section className="series-section series-width" aria-labelledby="series-questions-title">
      <Label number="07">{cmsText("SeriesOttPage","e78e28d93a6ebdbf","BEFORE YOU PITCH")}</Label>
      <div className="series-intro-grid"><MotionHeading as="h2" id="series-questions-title">{cmsText("SeriesOttPage","256629916deff8af","Before you pitch.")}</MotionHeading><div className="series-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="series-section series-width series-closing" aria-labelledby="series-closing-title">
      <div className="series-intro-grid"><div><MotionHeading as="h2" id="series-closing-title">{cmsText("SeriesOttPage","e31a9865751f2e22","Pitch us episode one.")}</MotionHeading><MotionCopy>{cmsText("SeriesOttPage","15dd713859946e51","Share your idea, pilot script or series bible. We’ll review the material and discuss what the project needs next.")}</MotionCopy><div className="series-actions"><CTA href="/script-to-production/">{cmsText("SeriesOttPage","b2a641b0f0285888","Send us your pilot")}</CTA><TextLink href="/contact/">{cmsText("SeriesOttPage","24781b21c6781ced","Talk to the studio")}</TextLink></div></div><figure className="series-next-episode"><span>{cmsText("SeriesOttPage","b5f9b29f846c4388","Next episode")}</span><div className="series-next-number" aria-hidden="true">01</div><figcaption><strong>{cmsText("SeriesOttPage","cbb4fa36152fc4b3","E01 · Your series")}</strong><span>{cmsText("SeriesOttPage","cea32b4fa8234c71","Starting when you are")}</span></figcaption></figure></div>
    </section>
  </div></PageVisuals>;
}
