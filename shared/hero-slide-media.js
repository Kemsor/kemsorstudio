import defaultSlides from './hero-slides.json' with {type:'json'};

// Earlier installations can still contain the original seeded video and poster paths.
export function resolveBundledHeroSlide(slide, resolve = value => value) {
  if (!slide) return slide;
  const replacement = defaultSlides.find(item => item.previousSrc && resolve(item.previousSrc) === resolve(slide.src));
  const previousPoster = replacement?.previousSrc.replace('.mp4', '-960.webp');
  if (!replacement || resolve(previousPoster) !== resolve(slide.poster)) return slide;
  return {...slide, src: replacement.src, poster: replacement.poster, posterSrcSet: replacement.posterSrcSet};
}
