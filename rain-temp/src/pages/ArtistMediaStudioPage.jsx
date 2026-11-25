import React, {useState} from 'react';
import {EditorialHero} from '../EditorialPage';
import {CTA, TextLink} from '../PageUI';
import FaqPanel from '../FaqPanel';
import {CmsEntries, useCms} from '../CmsContent';
import StudioImage from '../StudioImage';
import EnquiryForm from '../EnquiryForm';
import './artist-media-studio.css';

const services = [
  {
    title: 'Artist Portfolios', goal: 'Get Cast', purpose: 'Getting cast',
    description: 'Shot from the other side of the casting table. Casting teams shortlist from a few frames, so your portfolio is planned to be honest, well lit, and easy to say yes to.',
    includes: ['Close-up headshot, profile and full-length frames', 'Two to three looks: everyday, formal, and one character look', 'Intro video with your name, height, languages, and skills', 'A directed self-tape scene', 'Files sized for casting portals, agency decks and Instagram'],
    audience: 'Actors, models, dancers and new faces building their first book.',
  },
  {
    title: 'Photoshoots', goal: 'Get Signed or Booked', purpose: 'Getting signed or booked',
    description: 'Lit like film key art. Studio or location, every shoot starts with a mood board and a shot list we agree on with you before the day.',
    includes: ['Press and promo photos for labels, promoters and media', 'Single, album and EP cover art, print-ready', 'Editorial, fashion and lookbook shoots', 'Poster-style images for launches, gigs and tours'],
    audience: 'Musicians, bands, performers and personal brands.',
  },
  {
    title: 'Short Videos & Reels', goal: 'Grow Your Audience', featured: true, purpose: 'Growing an audience',
    description: 'One planned shoot day gives you a month of posts. We plan your reels like a short film: hooks written first, shots designed for vertical, and one consistent look across every post.',
    includes: ['Vertical 9:16 reels with captions in Hindi, English, or regional languages', 'Music videos, performance clips, and lyric visuals', 'Behind-the-scenes and launch teasers', 'Thumbnails and covers from the same shoot'],
    audience: 'Creators, influencers, artists with a release coming up, and founders.',
  },
  {
    title: 'Podcasting', goal: 'Launch a Show', purpose: 'Launching a podcast',
    description: 'Your own podcast set, designed around your show by our production designers. Every episode is recorded on multiple cameras with broadcast sound, then cut into a full episode and short clips.',
    includes: ['Set design built around your show’s identity', 'Multi-camera recording and professional sound', 'Full episode edit, mix and colour', 'Clips for Reels and Shorts from every episode, plus thumbnails', 'Remote guests recorded and edited in alongside the studio cameras'],
    audience: 'Hosts launching a show, audio podcasts moving to video, and brands starting a series.',
  },
];
const shootIncludes = [
  ['Creative direction', 'Concept, looks, and shot list agreed before the day.'],
  ['Film lighting', 'The biggest difference between a phone shoot and a film shoot.'],
  ['A director on set', 'Someone guiding your poses, delivery, and energy, frame by frame.'],
  ['Professional sound', 'Clean audio for every video and podcast.'],
  ['In-house post', 'Retouching, editing, colour and sound finished by the same team.'],
];
const steps = [
  ['Brief', 'A short call about your goal, your audience and the references you like.'],
  ['Prep', 'Mood board, looks, shot list or episode outline, plus wardrobe and styling.'],
  ['Shoot', 'A directed session with a Kemsor crew, in our studio or on location.'],
  ['Post', 'Selects, retouching, edit, colour and sound, with one round of changes.'],
  ['Deliver', 'Files sized for casting portals, Instagram, YouTube, Spotify and print.'],
];
const questions = [
  ['I’m new to acting. What should my first portfolio include?', 'A headshot, a profile shot, a full-length shot, and a short intro video. Two or three looks is enough. We’ll plan them with you on the brief call.'],
  ['Will a Kemsor portfolio get me into a Kemsor production?', 'No portfolio guarantees a role. With your consent, your profile can be added to the Kemsor Talent Network that our casting team searches.'],
  ['Do I need experience in front of the camera?', 'No. A director guides you through every frame, the same way we work with actors on set.'],
  ['Can you shoot in my language?', 'Yes. We shoot in Hindi, English, or regional languages, with captions.'],
  ['What should I bring to the shoot?', 'The outfits agreed in prep, any props or instruments, and references you love. We send a checklist before the day.'],
  ['Who owns the photos and videos?', 'You can use them for your portfolio, social media, and promotion. Commercial and paid-ad use is agreed in your quote.'],
];
const workFormats = ['Portfolios', 'Photoshoots', 'Reels', 'Podcasts'];
const workFormat = entry => workFormats.find(format => format.toLowerCase() === entry.metadata?.category?.trim().toLowerCase());
const purposes = [...services.map(service => service.purpose), 'Not sure yet'];

export default function ArtistMediaStudioPage() {
  const {entries} = useCms();
  const [purpose, setPurpose] = useState('');
  const [filter, setFilter] = useState('All');
  const sections = entries.filter(entry => entry.type === 'page' && entry.metadata?.page === 'artist-digital-media-studio');
  const work = sections.filter(workFormat);
  const visibleWork = work.filter(entry => filter === 'All' || workFormat(entry) === filter);
  return <div className="artist-media-page">
    <EditorialHero page="artist-digital-media-studio" id="artist-studio-title" eyebrow="STUDIO · ARTIST & DIGITAL MEDIA"
      title="Artist & Digital Media Studio." accent="Shot like cinema. Cut for the feed."
      description="Portfolios, photoshoots, reels and podcasts made by Kemsor’s film crew. We plan every shoot around what you need it to do next, whether that’s a casting call, a release, or a growing audience."
      image="/assets/stills/work-camera-crew-960.webp" alt="Film crew working with a production camera"
      actions={<><CTA href="#send-enquiry">Start a conversation</CTA><TextLink href="#recent-shoots">See the work</TextLink></>}/>
    <section className="artist-media-section" aria-labelledby="artist-intro">
      <h2 id="artist-intro">A film house, now open to artists.</h2>
      <div><p>Kemsor makes feature films, series and documentaries. Our crews light actors, frame performances, and grade footage for the big screen every working day.</p>
      <p>The Artist &amp; Digital Media Studio brings that same team to the work artists and creators need most: a portfolio that gets you called in, photos that make a label take notice, reels people stop for, and a podcast that looks as good as it sounds.</p></div>
    </section>
    <section className="artist-media-section" aria-labelledby="artist-services">
      <p className="page-eyebrow">WHAT IS YOUR SHOOT FOR?</p>
      <h2 id="artist-services">Decide the job before you shoot.</h2>
      <p>A portfolio for a casting call and a reel for brand deals are shot very differently. Start with what you need the work to do, and we’ll plan the shoot from there.</p>
      <div className="artist-media-services">{services.map(service=><article key={service.purpose}>
        <p className="page-eyebrow">{service.goal}{service.featured && ' · Most booked'}</p><h3>{service.title}</h3>
        <p>{service.description}</p>
        <ul>{service.includes.map(item=><li key={item}>{item}</li>)}</ul>
        <p><strong>Good for:</strong> {service.audience}</p>
        <a className="line-link" href="#send-enquiry" onClick={()=>setPurpose(service.purpose)} aria-label={`Get a quote for ${service.title}`}>Get a quote</a>
      </article>)}</div>
    </section>
    <section className="artist-media-section" aria-labelledby="artist-includes">
      <h2 id="artist-includes">What every shoot includes.</h2>
      <dl className="artist-media-list">{shootIncludes.map(([title,description])=><div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl>
    </section>
    <section className="artist-media-section" aria-labelledby="artist-honest">
      <h2 id="artist-honest">The honest part.</h2>
      <p>A portfolio doesn’t get you cast. It gets you into the room. A reel won’t build an audience on its own. Posting consistently does. That’s why your shoot is run by directors, cinematographers and editors from Kemsor Productions, and planned around the next step you want. If a simpler shoot will do the job, we’ll tell you.</p>
    </section>
    <section className="artist-media-section" aria-labelledby="artist-steps">
      <h2 id="artist-steps">From brief to delivery.</h2>
      <ol className="artist-media-steps">{steps.map(([title,description])=><li key={title}><strong>{title}</strong><p>{description}</p></li>)}</ol>
      <p>Most shoots go from brief to delivery in 2–3 weeks.</p>
    </section>
    <section id="recent-shoots" className="artist-media-section" aria-labelledby="artist-work">
      <h2 id="artist-work">Recent shoots.</h2>
      {work.length ? <>
        <div className="artist-media-filters" role="group" aria-label="Filter recent shoots">
          {['All', ...workFormats].map(format=><button type="button" key={format} aria-pressed={filter === format} onClick={()=>setFilter(format)}>{format}</button>)}
        </div>
        {visibleWork.length ? <div className="artist-media-services">{visibleWork.map(entry=><article key={entry.id}>
          {entry.image_url && <StudioImage src={entry.image_url} alt={entry.image_alt || ''} loading="lazy"/>}
          <h3>{entry.title}</h3>
          <p>{[workFormat(entry), entry.metadata.year].filter(Boolean).join(' · ')}</p>
          {entry.summary && <p><strong>Made for:</strong> {entry.summary}</p>}
        </article>)}</div> : <p role="status">No shoots in this format yet.</p>}
      </> : <p>Selected work coming soon.</p>}
    </section>
    <CmsEntries entries={sections.filter(entry => !workFormat(entry))}/>
    <section data-managed-faq className="standard-faq-simple" aria-labelledby="artist-faq">
      <FaqPanel heading={<h2 id="artist-faq">Questions.</h2>}>
        <div className="standard-faq-list">{questions.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </FaqPanel>
    </section>
    <section className="artist-media-section artist-media-contact" aria-labelledby="artist-contact">
      <div><h2 id="artist-contact">Know what it’s for? Let’s shoot it.</h2>
      <p>Tell us about the shoot and where you want it to take you. We’ll come back within one working day with a plan and a quote.</p></div>
      <EnquiryForm standalone showHeading={false} initialCategory="creative" initialSubject="Artist & Digital Media Studio"
        artistBrief={{purposes, purpose, setPurpose}}/>
    </section>
  </div>;
}
