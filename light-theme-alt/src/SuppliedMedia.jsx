import React, { useEffect, useRef, useState } from 'react';

const asset = name => `${import.meta.env.BASE_URL}assets/supplied/${name}`;
export const suppliedPhotos = [
  { file:'costume-portrait.webp', width:959, height:1280, caption:'Costume portrait', alt:'Portrait of a performer wearing an ornate crown and embroidered costume in red light.' },
  { file:'period-costume.webp', width:1079, height:1541, caption:'Period costume', alt:'A performer in a gold period costume standing in a courtyard with red columns.' },
  { file:'office-scene.webp', width:1280, height:720, caption:'An office scene', alt:'A character in uniform seated behind an office desk; the original broadcaster markings are visible.' },
  { file:'riders-scene.webp', width:2048, height:1436, caption:'Riders in the mist', alt:'A group of masked riders on horseback moving through a misty scene.' },
  { file:'action-scene.webp', width:1511, height:815, caption:'An action scene', alt:'A performer holding a prop rifle on an industrial set beside yellow pipework.' },
  { file:'white-olive-tree-poster.webp', width:949, height:1292, caption:'The White Olive Tree — poster', alt:'The White Olive Tree promotional poster with its original artwork and lettering.' },
  { file:'detective-scene.webp', width:1280, height:719, caption:'A period detective scene', alt:'A character wearing a red turban and dark uniform in a period detective scene.' },
  { file:'ensemble-poster.webp', width:996, height:1280, caption:'Ensemble poster', alt:'An ensemble action poster with its original Chinese lettering and production credits.' },
];

export default function SuppliedMedia({ compact = false }) {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(null);
  const video = useRef(null);
  const dialog = useRef(null);
  useEffect(() => {
    const hide = () => { if (document.hidden) video.current?.pause(); };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); video.current?.pause(); };
  }, []);
  useEffect(() => {
    if (!started || !video.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.current?.pause(); });
    observer.observe(video.current);
    return () => observer.disconnect();
  }, [started]);
  const openPhoto = photo => { setSelected(photo); dialog.current.showModal(); };
  const photos = compact ? suppliedPhotos.filter((_, i) => [0,3,5,7].includes(i)) : suppliedPhotos;
  return <section className={`supplied-media section-padding ${compact ? 'supplied-media-preview' : ''}`} aria-labelledby={compact ? 'supplied-home-title' : 'supplied-projects-title'}>
    <div className="section-label"><span>PRODUCTIONS / STILLS &amp; FILM</span><span>On screen &amp; behind the frame</span></div>
    <div className="section-heading"><h2 id={compact ? 'supplied-home-title' : 'supplied-projects-title'}>A closer look<br/><span>at the frame.</span></h2><p>Costumes, characters and scenes.<br/>A collection of film imagery and footage.</p></div>
    {!compact && <div className="supplied-film">
      {started ? <video ref={video} src={asset('supplied-film.mp4')} poster={asset('film-poster.webp')} controls autoPlay playsInline preload="none" aria-label="Watch the supplied film clip" onError={() => { setFailed(true); setStarted(false); }} /> : <div className="supplied-film-cover"><img src={asset('film-poster.webp')} alt="Preview frame from the film clip." width="636" height="360" loading="lazy" decoding="async"/><button type="button" className="button button-gold" onClick={() => { setFailed(false); setStarted(true); }}>Watch film clip <span aria-hidden="true">▶</span></button></div>}
      <div className="supplied-film-caption"><span>Film clip</span><span>3 min 20 sec / Play with sound</span></div>
      {failed && <p role="status">The video could not be loaded. Press “Watch film clip” to try again.</p>}
    </div>}
    <div className="supplied-photo-grid">{photos.map(photo => <figure key={photo.file}><button type="button" className="supplied-photo" aria-label={`View ${photo.caption.toLowerCase()}`} onClick={() => openPhoto(photo)}><img src={asset(photo.file)} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async"/></button><figcaption>{photo.caption}</figcaption></figure>)}</div>
    {compact && <a className="text-link" href={`${import.meta.env.BASE_URL}projects/#project-showcase`}>View all photographs &amp; film <span aria-hidden="true">→</span></a>}
    <dialog ref={dialog} className="photo-dialog" aria-label="Photograph viewer" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <button type="button" className="photo-dialog-close" onClick={() => dialog.current.close()} aria-label="Close photograph" autoFocus>×</button>
      {selected && <figure><img src={asset(selected.file)} alt={selected.alt}/><figcaption>{selected.caption}</figcaption></figure>}
    </dialog>
  </section>;
}
