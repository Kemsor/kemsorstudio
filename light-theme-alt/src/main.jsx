import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { capabilities, clips, closingCopy, formats, introduction, serviceCopy, serviceChapters, stages, studioCopy } from './content';
import './styles.css';
import './brand.css';
import './pages.css';
import './light.css';
import './alternative.css';
import { pageInfo, pageHref } from './pageInfo';
import { navigation } from './navigation';
import SuppliedMedia from './SuppliedMedia';
const Pages = lazy(() => import('./Pages'));
import ScrollVision from './ScrollVision';
import Careers from './Careers';

const Arrow = () => <span aria-hidden="true">→</span>;
const CtaMark = () => <span className="cta-icon" aria-hidden="true">→</span>;
const number = index => String(index + 1).padStart(2, '0');
function RollingLabel({ children }) {
  return <span className="nav-roll"><span className="nav-roll-track"><span>{children}</span><span aria-hidden="true">{children}</span></span></span>;
}
function Brand() {
  return <a className="brand" href={import.meta.env.BASE_URL} aria-label="Kemsor Studios home"><img src={`${import.meta.env.BASE_URL}assets/kemsor-logo.webp`} width="3650" height="3300" alt="" /><span className="brand-name">Kemsor<span>Studios</span></span></a>;
}
function Header({ page }) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const menu = useRef(null);
  const header = useRef(null);
  const triggers = useRef({});
  const hoverTimer = useRef(null);
  const [drawerMode, setDrawerMode] = useState(() => window.matchMedia('(max-width: 1440px)').matches);
  const clearHover = () => { clearTimeout(hoverTimer.current); hoverTimer.current = null; };
  const close = () => { clearHover(); setOpen(false); setPanel(null); };
  const closeDrawer = () => { close(); menu.current?.focus(); };
  const enterItem = (event, item) => {
    if (drawerMode || event.pointerType !== 'mouse') return;
    clearHover(); setPanel(item.groups ? item.id : null);
  };
  const leaveItem = event => {
    if (drawerMode || event.pointerType !== 'mouse') return;
    clearHover(); hoverTimer.current = setTimeout(() => setPanel(null), 180);
  };
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1440px)');
    const update = () => { clearHover(); setDrawerMode(query.matches); setOpen(false); setPanel(null); };
    query.addEventListener('change', update);
    return () => { query.removeEventListener('change', update); clearHover(); };
  }, []);
  useEffect(() => {
    const onKey = event => {
      if (event.key !== 'Escape') return;
      if (panel) { clearHover(); setPanel(null); triggers.current[panel]?.focus(); }
      else if (open) { setOpen(false); menu.current?.focus(); }
    };
    const outside = event => { if (!header.current?.contains(event.target)) { setPanel(null); if (open) setOpen(false); } };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', outside); };
  }, [open, panel]);
  useEffect(() => {
    if (!open) return;
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    if (main) main.inert = true;
    if (footer) footer.inert = true;
    const trap = event => {
      if (event.key !== 'Tab') return;
      const focusable = [...header.current.querySelectorAll('#navigation a, #navigation button')].filter(el => el.getClientRects().length && !el.closest('[hidden]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const frame = requestAnimationFrame(() => header.current.querySelector('.drawer-close')?.focus());
    document.addEventListener('keydown', trap);
    return () => { cancelAnimationFrame(frame); if (main) main.inert = false; if (footer) footer.inert = false; document.removeEventListener('keydown',trap); };
  }, [open]);
  useEffect(close, [page]);
  return <><header ref={header} className="site-header reference-header" data-open={open}><Brand />
    <button ref={menu} className="menu-toggle" aria-expanded={open} aria-controls="navigation" onClick={() => { setOpen(!open); setPanel(null); }}>{open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '×' : '☰'}</span></button>
    <nav id="navigation" className={open ? 'is-open' : ''} aria-label="Main navigation" aria-hidden={drawerMode && !open ? true : undefined} inert={drawerMode && !open} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPanel(null); }}>
      <button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Close menu">Close <span aria-hidden="true">×</span></button>
      {navigation.map(item => <div className={`nav-item nav-item-${item.id}`} key={item.id} onPointerEnter={event => enterItem(event, item)} onPointerLeave={leaveItem}>
        {item.href ? <a className={item.cta ? 'nav-cta' : 'nav-direct'} href={item.href} onClick={close}><RollingLabel>{item.label}</RollingLabel>{item.cta && <CtaMark />}</a> : <>
          <button ref={el => { triggers.current[item.id] = el; }} className="nav-trigger" aria-expanded={panel === item.id} aria-controls={`menu-${item.id}`} onClick={() => { clearHover(); if (drawerMode) setPanel(panel === item.id ? null : item.id); else setPanel(item.id); }} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); clearHover(); setPanel(item.id); requestAnimationFrame(() => document.getElementById(`menu-${item.id}`)?.querySelector('a')?.focus()); } }}><RollingLabel>{item.label}</RollingLabel><span className="nav-chevron" aria-hidden="true" /></button>
          <div id={`menu-${item.id}`} className={`nav-dropdown ${item.id === 'capabilities' ? 'nav-mega' : ''}`} hidden={panel !== item.id}>
            {item.groups.map((group, index) => <div className="nav-group" key={group.title || index}>{group.title && <p className="nav-group-title">{group.title}</p>}{group.links.map(link => <a key={link.label} href={link.href} onClick={close}>{link.label}</a>)}</div>)}
          </div>
        </>}
      </div>)}
    </nav>
  </header>{open && <button className="menu-backdrop" aria-label="Close navigation" onClick={() => { close(); menu.current?.focus(); }} tabIndex={-1}/>}</>;
}
const heroSlides = [
  { video: `${import.meta.env.BASE_URL}assets/hero/studio-film-lite.mp4`, poster: `${import.meta.env.BASE_URL}assets/hero/poster.webp`, eyebrow: 'FILM & CONTENT PRODUCTION', lines: ['A story worth telling.', 'A team to make it.'], description: ['Production support for films, series and documentaries.', 'From development through to release.'], cta: 'Prepare a project brief', link: `${import.meta.env.BASE_URL}contact/` },
  { video: `${import.meta.env.BASE_URL}assets/hero/second/studio-film-lite.mp4`, poster: `${import.meta.env.BASE_URL}assets/hero/second/poster.webp`, eyebrow: 'REGIONAL & INTERNATIONAL CINEMA', lines: ['Rooted in a place.', 'Open to the world.'], description: ['Stories shaped by language, culture and location.', 'Support for collaborators working across borders.'], cta: 'Prepare a project brief', link: `${import.meta.env.BASE_URL}contact/` },
];
function Hero() {
  const videos = useRef([]);
  const section = useRef(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const [focused, setFocused] = useState(false);
  const slide = heroSlides[active];
  useEffect(() => {
    if (reduced || navigator.connection?.saveData) return;
    // Paint the poster and readable content before starting one background film.
    const timer = setTimeout(() => setEnabled(true), 500);
    return () => clearTimeout(timer);
  }, [reduced]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(section.current);
    const update = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    videos.current.forEach(track => {
      if (enabled && visible && tabVisible && !paused) {
        track.muted = true;
        track.play().catch(() => { if (!cancelled) setPlaying(false); });
      } else track.pause();
    });
    return () => { cancelled = true; videos.current.forEach(track => track?.pause()); };
  }, [active, enabled, visible, tabVisible, paused]);
  useEffect(() => {
    if (!enabled || !playing || reduced || paused || !visible || !tabVisible || focused) return;
    const timer = setTimeout(() => { setPlaying(false); setActive(index => (index + 1) % heroSlides.length); }, 5000);
    return () => clearTimeout(timer);
  }, [active, enabled, playing, reduced, paused, visible, tabVisible, focused]);
  return <section ref={section} className="hero cinema-hero hero-carousel" id="home" aria-labelledby="hero-title" aria-roledescription="carousel" data-slide={active + 1} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <img className="hero-image" src={slide.poster} alt="" width="1920" height="1080" fetchPriority="high" decoding="async" />
    <video key={slide.video} ref={el => { videos.current = el ? [el] : []; }} className="hero-image hero-slide-video is-active" style={{ opacity: playing && enabled ? 1 : 0 }} src={enabled ? slide.video : undefined} muted loop playsInline preload="none" aria-hidden="true" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setEnabled(false); }} />
    <div className="hero-shade" />
    <div className="hero-topline"><span><i /> KEMSOR / PRODUCTION STUDIO</span><span>FILM / SERIES / DOCUMENTARIES</span></div>
    <div className="hero-content"><p key={`eyebrow-${active}`} className="eyebrow hero-copy-in">{slide.eyebrow}</p>
      <h1 className="hero-title-reveal" tabIndex="-1" id="hero-title" aria-label="Kemsor Studios"><span className="hero-name" aria-hidden="true">KEMSOR</span><span className="hero-studios" aria-hidden="true">STUDIOS</span></h1>
      <div className="hero-summary"><div><p className="hero-tagline">{slide.lines[0]}<br />{slide.lines[1]}</p><p className="hero-description">{slide.description[0]}<br />{slide.description[1]}</p></div><div className="hero-actions"><a href={slide.link} className="button button-gold">{slide.cta} <CtaMark /></a><a href={`${import.meta.env.BASE_URL}services/`} className="text-link">Our services <Arrow /></a></div></div>
    </div>
    <div className="hero-bottom"><a href="#showcase">Explore the studio <span aria-hidden="true">↓</span></a><div className="hero-slide-controls" aria-label="Choose hero slide">{heroSlides.map((item, index) => <button type="button" key={item.video} aria-label={`Show hero slide ${index + 1}`} aria-pressed={active === index} onClick={() => { setPlaying(false); setActive(index); }}>{number(index)}</button>)}</div><button type="button" className="hero-motion" onClick={() => { if (!enabled) { setEnabled(true); setPaused(false); } else setPaused(!paused); }} aria-label={!enabled || paused ? 'Play hero film' : 'Pause hero film'}>{!enabled || paused ? '▶ PLAY FILM' : 'Ⅱ PAUSE FILM'}</button></div>
    <span className="hero-edge" aria-hidden="true">FILM · SERIES · DOCUMENTARIES</span>
  </section>;
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = e => setReduced(e.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  return reduced;
}
function VideoWordmark() {
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [explicit, setExplicit] = useState(false);
  const [unavailable, setUnavailable] = useState(null);
  const videos = useRef([]);
  const [nearby, setNearby] = useState(false);
  const section = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNearby(true);
    }, { rootMargin: '100px 0px' });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  const stop = () => { setActive(null); setPlaying(null); setExplicit(false); };
  const activate = (index, userAction = false) => { setActive(index); setExplicit(userAction); setUnavailable(null); };
  useEffect(() => {
    let cancelled = false;
    setPlaying(null);
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      if (index !== active || !explicit) { video.pause(); return; }
      if (!video.getAttribute('src')) video.src = `${import.meta.env.BASE_URL}assets/clips/${clips[index].key}-preview.mp4`;
      video.play().then(() => { if (!cancelled) setPlaying(index); }).catch(error => { if (!cancelled && error.name !== 'AbortError') { setPlaying(null); setUnavailable(index); } });
    });
    return () => { cancelled = true; videos.current.forEach(video => video?.pause()); };
  }, [active, explicit, reduced]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stop(); }, { threshold: 0 });
    observer.observe(section.current);
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hide);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', hide); };
  }, []);
  return <section className="showcase" id="showcase" ref={section} aria-label="KEMSOR in motion"><div className="section-meta"><span>A few frames that inspire us</span><span className="preview-hint">Select a frame to play <span aria-hidden="true">↓</span></span></div><div className="letter-panels" onPointerLeave={event => { if (event.pointerType === 'mouse') stop(); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) stop(); }}>
    {clips.map((clip, index) => <button key={clip.key} type="button" className={`letter-panel ${active === index ? 'is-active' : ''}`} aria-label={`${clip.letter} — ${clip.name} video preview`} aria-pressed={active === index} onPointerEnter={event => { if (event.pointerType === 'mouse') activate(index); }} onFocus={event => { if (event.currentTarget.matches(':focus-visible')) activate(index); }} onClick={() => { if (active === index && playing === index) stop(); else activate(index, true); }} onKeyDown={event => { if (event.key === 'Escape') stop(); }}><video ref={el => { videos.current[index] = el; }} poster={nearby ? `${import.meta.env.BASE_URL}assets/clips/${clip.key}.webp` : undefined} muted playsInline loop preload="none" disablePictureInPicture aria-hidden="true" /><span className="letter-glyph" aria-hidden="true">{clip.letter}</span><span className="letter-caption" aria-hidden="true">{number(index)} <span>{clip.name}</span></span></button>)}
    </div><div className="showcase-bottom"><span>IMAGINATION, IN EVERY FRAME.</span><span aria-live="polite">{unavailable !== null ? 'PREVIEW UNAVAILABLE — SHOWING STILL' : reduced ? 'REDUCED MOTION · TAP TO PLAY · SOUND OFF' : 'Visual references / Sound off'}</span></div></section>;
}
function Studio() {
  return <section className="studio light-section section-padding" id="studio" aria-labelledby="studio-title"><div className="section-label"><span>01 / THE STUDIO</span><span aria-hidden="true">✳</span></div><div className="studio-layout"><h2 id="studio-title">The work behind<br /><span>the story.</span></h2><div className="studio-copy"><p className="lead">{introduction}</p><p>{studioCopy}</p><div className="home-page-links"><a className="text-link" href={`${import.meta.env.BASE_URL}about/`}>Meet the studio <Arrow /></a><a className="text-link" href={`${import.meta.env.BASE_URL}services/`}>Explore Our Services <Arrow /></a></div></div></div><figure className="studio-camera"><img src={`${import.meta.env.BASE_URL}assets/services/filming.webp`} alt="A cinematographer operating a cinema camera on a warmly lit film set." loading="lazy" decoding="async" width="1672" height="941" /><figcaption><span>BEHIND EVERY FRAME</span><strong>On set, every detail counts.</strong></figcaption></figure><div className="studio-note"><span>DEVELOPMENT / PRODUCTION</span><span>POST-PRODUCTION / RELEASE</span></div></section>;
}
function Formats() {
  return <section className="formats section-padding" id="formats" aria-labelledby="formats-title"><div className="section-label"><span>02 / WHAT WE WORK ON</span><span>FILM / SERIES / DOCUMENTARIES</span></div><div className="section-heading"><h2 id="formats-title">Stories for<br /><span>different screens.</span></h2><p>Hindi, Regional &amp; International Cinema.<br />A world of stories, a shared creative spirit.</p></div><div className="format-grid">{formats.map((format, index) => <article className="format-card" key={format.title}><div className="format-image"><img src={`${import.meta.env.BASE_URL}assets/clips/${format.image}.webp`} alt="" loading="lazy" decoding="async" width="960" height="540" /><div className="format-image-shade" /><span className="format-number">{number(index)}</span><span className="format-category">{format.category}</span></div><h3>{format.title}</h3><p>{format.description}</p></article>)}</div><p className="image-note">A VISUAL EXPLORATION OF THE STORIES THAT INSPIRE US.</p><a className="text-link" href={`${import.meta.env.BASE_URL}projects/`}>Explore projects & story formats <Arrow /></a></section>;
}
function Services() {
  return <section className="services service-showcase" id="services" aria-labelledby="services-title">
    <div className="service-introduction section-padding">
      <div className="section-label"><span>03 / Production services</span><span>From development to release</span></div>
      <div className="section-heading"><h2 id="services-title">Good films take<br /><span>careful work.</span></h2><p>{serviceCopy}</p></div>
    </div>
    <div className="service-directory">
      {serviceChapters.map((chapter, index) => <article key={chapter.id} id={`service-${chapter.id}`} className="service-entry" style={{ zIndex: index + 1 }} aria-labelledby={`service-title-${chapter.id}`}>
        <span className="service-index">{number(index)}</span>
        <div className="service-entry-copy"><h3 id={`service-title-${chapter.id}`}>{chapter.heading}</h3><ul>{chapter.services.map(serviceIndex => <li key={serviceIndex}><h4>{capabilities[serviceIndex][0]}</h4><p>{capabilities[serviceIndex][1]}</p></li>)}</ul><a className="text-link" href={`${import.meta.env.BASE_URL}services/#capability-${chapter.id}`}>Explore this service <Arrow /></a></div>
        <img src={`${import.meta.env.BASE_URL}assets/services/${chapter.image}.webp`} alt={chapter.alt} width="1672" height="941" loading="lazy" decoding="async" style={{ objectPosition: chapter.position }} />
      </article>)}
    </div>
    <div className="service-section-end"><span>Ten capabilities across six production stages.</span><a href={`${import.meta.env.BASE_URL}services/`}>All production services <Arrow /></a></div>
  </section>;
}
function Process() {
  const [active, setActive] = useState(0);
  return <section className="process section-padding" id="process" aria-labelledby="process-title"><div className="section-label"><span>04 / HOW WE WORK</span><span>THE PRODUCTION PROCESS</span></div><div className="section-heading"><h2 id="process-title">From the first draft<br /><span>to the final cut.</span></h2><p>Six connected stages.<br />Built around the needs of your project.</p></div><div className="process-layout"><div className="process-art"><img src={`${import.meta.env.BASE_URL}assets/services/camera-detail.webp`} alt="Close-up of a cinema camera lens, matte box and focus controls in warm studio light." loading="lazy" decoding="async" width="1672" height="941" /><span className="process-art-label">TOOLS OF THE TRADE</span></div><div className="process-steps">{stages.map(([title, description], index) => <div className={`process-step ${active === index ? 'is-open' : ''}`} key={title}><h3><button type="button" aria-expanded={active === index} aria-controls={`stage-${index}`} onClick={() => setActive(active === index ? null : index)}><span className="step-number">{number(index)}</span><span>{title}</span><span className="step-icon" aria-hidden="true">{active === index ? '−' : '+'}</span></button></h3><div className="step-description" id={`stage-${index}`} hidden={active !== index}><p>{description}</p></div></div>)}</div></div></section>;
}
function ProjectDialog({ dialogRef }) {
  const [status, setStatus] = useState('Your brief stays on your device. Nothing is sent to Kemsor.');
  const submit = event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('project')).trim();
    const story = String(form.get('story')).trim();
    if (!title || !story) { setStatus('Please add a project name and a few words about your idea.'); return; }
    const text = `KEMSOR STUDIOS — PROJECT BRIEF\n\nProject: ${title}\nFormat: ${form.get('format')}\nStage: ${form.get('stage')}\n\nTHE IDEA\n${story}\n\nPrepared locally. This brief has not been submitted to Kemsor Studios.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Kemsor-Project-Brief.txt'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setStatus('Your brief is ready. Download started; nothing has been sent.');
  };
  return <dialog ref={dialogRef} aria-labelledby="brief-title" className="brief-dialog" onClick={event => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialogRef.current.close(); } }}><button className="dialog-close" aria-label="Close project brief" onClick={() => dialogRef.current.close()}>×</button><p className="eyebrow">YOUR PROJECT</p><h2 id="brief-title">A place to start.</h2><p>Put your idea into words. Download a brief to keep and share with your collaborators.</p><form onSubmit={submit}><label htmlFor="project-name">Project name</label><input id="project-name" name="project" required maxLength="120" placeholder="Your working title" /><div className="form-row"><div><label htmlFor="project-format">Format</label><select id="project-format" name="format"><option>Feature film</option><option>Web series & OTT</option><option>Short film</option><option>Documentary</option><option>International co-production</option><option>Regional cinema</option></select></div><div><label htmlFor="project-stage">Current stage</label><select id="project-stage" name="stage">{stages.map(([title]) => <option key={title}>{title}</option>)}</select></div></div><label htmlFor="project-story">Tell us about your idea</label><textarea id="project-story" name="story" required maxLength="5000" rows="4" placeholder="The story, the vision, and the support you need…" /><button className="button button-gold" type="submit">Download project brief <span aria-hidden="true">↓</span></button><p className="form-note" role="status">{status}</p></form></dialog>;
}
function Contact({ onOpen }) {
  return <section className="contact section-padding" id="contact" aria-labelledby="contact-title"><div className="section-label"><span>06 / YOUR PROJECT</span><span>LET’S FIND A STARTING POINT</span></div><div className="contact-heading"><h2 id="contact-title">What are you<br /><span>working on?</span></h2><button className="button button-gold contact-cta" onClick={onOpen}>Start a project <CtaMark /></button></div><div className="contact-bottom"><p>{closingCopy}</p><div><button className="text-link" onClick={onOpen}>Prepare a project brief <Arrow /></button><small>Download a brief to keep and share.<br />This does not send an enquiry.</small><a className="text-link" href={`${import.meta.env.BASE_URL}contact/`}>Discuss your project <Arrow /></a></div></div></section>;
}
function Footer() {
  return <footer className="site-footer"><div className="footer-top"><Brand /><p>FILM. MEDIA. CULTURE.<br />FILM / SERIES / DOCUMENTARIES.</p><a href="#main" className="back-top">BACK TO TOP ↑</a></div><nav className="footer-page-links" aria-label="Footer navigation">{Object.entries(pageInfo).map(([key, [label]]) => <a key={key} href={pageHref(key)}><RollingLabel>{label}</RollingLabel></a>)}</nav><div className="footer-bottom"><span>© {new Date().getFullYear()} Kemsor Studios</span><span>FROM IDEA TO AUDIENCE.</span></div></footer>;
}
// Update page content without reloading shared navigation.
function usePageNavigation() {
  const resolve = () => { const key = location.pathname.slice(import.meta.env.BASE_URL.length).split('/').filter(Boolean)[0] || 'home'; return pageInfo[key] ? key : 'home'; };
  const [page, setPage] = useState(resolve);
  useEffect(() => {
    const move = (focus = true) => {
      setPage(resolve());
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
        else window.scrollTo({ top: 0, behavior: 'instant' });
        if (focus && !location.hash) document.querySelector('main h1')?.focus({ preventScroll: true });
      }));
    };
    const click = event => {
      const link = event.target.closest?.('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      const key = url.pathname.slice(import.meta.env.BASE_URL.length).split('/').filter(Boolean)[0] || 'home';
      if (url.origin !== location.origin || !pageInfo[key] || (url.pathname !== pageHref(key) && url.pathname !== pageHref(key).replace(/\/$/, ''))) return;
      if (url.pathname === location.pathname && url.hash) return;
      event.preventDefault();
      history.pushState(null, '', url.pathname + url.hash);
      move();
    };
    const pop = () => move();
    document.addEventListener('click', click);
    window.addEventListener('popstate', pop);
    return () => { document.removeEventListener('click', click); window.removeEventListener('popstate', pop); };
  }, []);
  useEffect(() => {
    document.title = pageInfo[page][1];
    document.querySelector('meta[name="description"]').content = pageInfo[page][2];
  }, [page]);
  useEffect(() => {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    let observer;
    const reveal = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView();
      observer?.disconnect();
      return true;
    };
    if (reveal()) return;
    observer = new MutationObserver(reveal);
    observer.observe(document.getElementById('main'), { childList: true, subtree: true });
    const deadline = setTimeout(() => observer.disconnect(), 5000);
    return () => { observer.disconnect(); clearTimeout(deadline); };
  }, [page]);
  return page;
}
function App() {
  const page = usePageNavigation();
  const dialog = useRef(null);
  const openBrief = () => dialog.current.showModal();
  return <><div className={`site-content ${page === 'home' ? 'page-home' : 'page-interior'}`}><a className="skip-link" href="#main">Skip to content</a><Header page={page}/><main id="main" tabIndex="-1">{page === 'home' ? <><Hero /><div className="home-intro-line"><p>A production partner for the work<br/><span>between an idea and its audience.</span></p></div><VideoWordmark /><SuppliedMedia compact /><Studio /><Formats /><ScrollVision /><Services /><Process /><Careers /><Contact onOpen={openBrief} /></> : <Suspense fallback={<div className="page-pending" role="status">Opening the next chapter…</div>}><Pages key={page} page={page} onOpen={openBrief}/></Suspense>}</main><Footer /><ProjectDialog dialogRef={dialog} /></div></>;
}
createRoot(document.getElementById('root')).render(<App />);
