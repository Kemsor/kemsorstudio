import React, { useEffect, useRef } from 'react';
import './scroll-story.css';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);
const HEADER_HEIGHT = 98;

/** The original expanding vision panel, adapted for this homepage and its stills. */
export default function ScrollStory({ paused = false } = {}) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 760px)');
    const shortScreen = window.matchMedia('(max-height: 620px)');
    let frame = 0;
    let inView = false;
    let listening = false;
    const staticLayout = () => paused || reduced.matches || mobile.matches || shortScreen.matches;

    function paint() {
      frame = 0;
      const still = staticLayout() || document.hidden;
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      const seed = width < 1000 ? 120 : 160;
      const distance = Math.max(1, section.offsetHeight - height);
      const progress = still ? 1 : clamp((HEADER_HEIGHT - section.getBoundingClientRect().top) / distance);
      const growth = ease(clamp((progress - .04) / .49));
      const reveal = ease(clamp((progress - .53) / .18));

      stage.style.setProperty('--story-panel-x', String(seed / width + (1.04 - seed / width) * growth));
      stage.style.setProperty('--story-panel-y', String(seed * .56 / height + (1.04 - seed * .56 / height) * growth));
      stage.style.setProperty('--story-panel-turn', `${-5 * (1 - growth)}deg`);
      stage.style.setProperty('--story-seed-half', `${seed / 2}px`);
      stage.style.setProperty('--story-word-travel', `${growth * (width / 2 + 260)}px`);
      stage.style.setProperty('--story-word-opacity', String(1 - ease(clamp((progress - .25) / .2))));
      stage.style.setProperty('--story-copy-opacity', String(reveal));
      stage.style.setProperty('--story-copy-y', `${(1 - reveal) * 45}px`);

      for (let index = 0; index < 3; index++) {
        const appearance = ease(clamp((progress - .59 - index * .075) / .16));
        stage.style.setProperty(`--story-photo-${index}-opacity`, String(appearance));
        stage.style.setProperty(`--story-photo-${index}-y`, `${(1 - appearance) * (100 + index * 22)}px`);
      }
      stage.dataset.phase = progress < .5 ? 'opening' : progress < .72 ? 'revealing' : 'revealed';
    }

    function schedule() {
      if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
    }

    function syncListening() {
      const shouldListen = inView && !staticLayout() && !document.hidden;
      if (shouldListen && !listening) {
        window.addEventListener('scroll', schedule, { passive: true });
        listening = true;
      } else if (!shouldListen && listening) {
        window.removeEventListener('scroll', schedule);
        listening = false;
      }
    }

    function refreshMode() {
      section.dataset.storyStatic = String(staticLayout());
      syncListening();
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        paint();
      } else {
        schedule();
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncListening();
      schedule();
    }, { rootMargin: '160px 0px' });
    const resizeObserver = new ResizeObserver(schedule);
    observer.observe(section);
    resizeObserver.observe(stage);
    reduced.addEventListener('change', refreshMode);
    mobile.addEventListener('change', refreshMode);
    shortScreen.addEventListener('change', refreshMode);
    document.addEventListener('visibilitychange', refreshMode);
    section.dataset.storyStatic = String(staticLayout());
    paint();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      reduced.removeEventListener('change', refreshMode);
      mobile.removeEventListener('change', refreshMode);
      shortScreen.removeEventListener('change', refreshMode);
      document.removeEventListener('visibilitychange', refreshMode);
    };
  }, [paused]);

  return (
    <section className="story-scroll" id="story-in-motion" ref={sectionRef} data-story-static={String(paused)} aria-labelledby="story-title">
      <div className="story-stage" ref={stageRef}>
        <div className="story-panel" aria-hidden="true" />
        <div className="story-opening" aria-hidden="true">
          <span className="story-word story-word-left">Creative vision</span>
          <span className="story-word story-word-right">Cinematic reality</span>
          <p className="story-scroll-note"><span>A spark is only the beginning.</span><span>Scroll to explore <span>↓</span></span></p>
        </div>

        <div className="story-reveal">
          <div className="story-copy">
            <p className="story-eyebrow">The Kemsor spirit</p>
            <h2 id="story-title">A film is made<br /><span>in the details.</span></h2>
            <p className="story-description">A location that fits the story. The right person in a role. A crew that knows the plan. Production brings those decisions together.</p>
            <p className="story-signoff">Creative vision. Practical production.</p>
          </div>

          <div className="story-photos" aria-label="Performance, action and the world of a film">
            <figure className="story-photo story-photo-performance">
              <img src="/assets/stills/detective-scene.webp" alt="An actor wearing a red beret in a period detective scene" loading="lazy" decoding="async" width="1280" height="719" />
              <figcaption>01 / THE PERFORMANCE</figcaption>
            </figure>
            <figure className="story-photo story-photo-world">
              <img src="/assets/stills/period-costume.webp" alt="An actor in a gold period costume among red courtyard columns" loading="lazy" decoding="async" width="1079" height="1541" />
              <figcaption>02 / THE WORLD</figcaption>
            </figure>
            <figure className="story-photo story-photo-action">
              <img src="/assets/stills/action-scene.webp" alt="An actor holding a prop rifle during an action scene" loading="lazy" decoding="async" width="1511" height="815" />
              <figcaption>03 / THE MOMENT</figcaption>
            </figure>
          </div>
        </div>

        <div className="story-endline" aria-hidden="true"><span>From the first spark</span><span>To the final frame.</span></div>
      </div>
    </section>
  );
}
