import React, { useEffect, useRef } from 'react';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);

export default function ScrollVision() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shortScreen = window.matchMedia('(max-height: 620px)');
    let frame = 0;
    let observing = false;

    function paint() {
      frame = 0;
      const staticView = motion.matches || shortScreen.matches;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const seed = width < 560 ? 72 : 160;
      const distance = Math.max(1, section.offsetHeight - height);
      const progress = staticView ? 1 : clamp(-section.getBoundingClientRect().top / distance);
      const growth = ease(clamp((progress - .04) / .49));
      const reveal = ease(clamp((progress - .53) / .18));
      stage.style.setProperty('--panel-x', String(seed / width + (1.04 - seed / width) * growth));
      stage.style.setProperty('--panel-y', String(seed * .56 / height + (1.04 - seed * .56 / height) * growth));
      stage.style.setProperty('--panel-turn', `${-5 * (1 - growth)}deg`);
      stage.style.setProperty('--seed-half', `${seed / 2}px`);
      stage.style.setProperty('--word-travel', `${growth * (width / 2 + 260)}px`);
      stage.style.setProperty('--word-opacity', String(1 - ease(clamp((progress - .25) / .2))));
      stage.style.setProperty('--copy-opacity', String(reveal));
      stage.style.setProperty('--copy-y', `${(1 - reveal) * 45}px`);
      for (let index = 0; index < 3; index++) {
        const appearance = ease(clamp((progress - .59 - index * .075) / .16));
        stage.style.setProperty(`--photo-${index}-opacity`, String(staticView ? 1 : appearance));
        stage.style.setProperty(`--photo-${index}-y`, `${staticView ? 0 : (1 - appearance) * (100 + index * 22)}px`);
      }
      stage.dataset.phase = progress < .5 ? 'opening' : progress < .72 ? 'revealing' : 'revealed';
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting;
      if (visible && !observing) { window.addEventListener('scroll', schedule, { passive: true }); observing = true; }
      if (!visible && observing) { window.removeEventListener('scroll', schedule); observing = false; }
      schedule();
    }, { rootMargin: '200px 0px' });
    observer.observe(section);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(stage);
    motion.addEventListener('change', schedule);
    shortScreen.addEventListener('change', schedule);
    paint();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      motion.removeEventListener('change', schedule);
      shortScreen.removeEventListener('change', schedule);
    };
  }, []);

  return <section className="vision-scroll" id="vision" ref={sectionRef} aria-labelledby="vision-title">
    <div className="vision-stage" ref={stageRef}>
      <div className="vision-panel" aria-hidden="true" />
      <div className="vision-opening" aria-hidden="true">
        <span className="vision-word vision-word-left">Creative vision</span>
        <span className="vision-word vision-word-right">Cinematic reality</span>
        <span className="vision-scroll-note">A SPARK IS ONLY THE BEGINNING <span>SCROLL TO EXPLORE ↓</span></span>
      </div>
      <div className="vision-reveal">
        <div className="vision-copy">
          <p className="eyebrow">THE KEMSOR SPIRIT</p>
          <h2 id="vision-title">IMAGINATION.<br /><span>MADE REAL.</span></h2>
          <p className="vision-description">A powerful story starts with a spark. We bring the people, places and craft together to carry it from the first idea to the final frame.</p>
          <p className="vision-signoff">CREATIVE VISION. PRACTICAL PRODUCTION.</p>
        </div>
        <div className="vision-photos" aria-label="The people and craft of filmmaking">
          <figure className="vision-photo vision-photo-camera"><img src={`${import.meta.env.BASE_URL}assets/services/filming.webp`} alt="A cinematographer bringing a scene to life behind the camera." loading="lazy" decoding="async" width="1672" height="941" /><figcaption>01 / THE CRAFT</figcaption></figure>
          <figure className="vision-photo vision-photo-talent"><img src={`${import.meta.env.BASE_URL}assets/services/casting.webp`} alt="An actress finding the emotion in a scene." loading="lazy" decoding="async" width="1672" height="941" /><figcaption>02 / THE FEELING</figcaption></figure>
          <figure className="vision-photo vision-photo-world"><img src={`${import.meta.env.BASE_URL}assets/services/design.webp`} alt="A production designer shaping the world of a film." loading="lazy" decoding="async" width="1672" height="941" /><figcaption>03 / THE WORLD</figcaption></figure>
        </div>
      </div>
      <div className="vision-endline" aria-hidden="true"><span>FROM THE FIRST SPARK</span><span>TO SOMETHING UNFORGETTABLE.</span></div>
    </div>
  </section>;
}
