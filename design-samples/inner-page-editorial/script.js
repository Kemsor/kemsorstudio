const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-control');
let paused = reduced.matches;
function setMotion(value) {
  paused = value;
  root.classList.toggle('motion-paused', paused);
  root.classList.toggle('js-motion', !paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.innerHTML = `<span aria-hidden="true">${paused ? '▷' : 'Ⅱ'}</span> ${paused ? 'Play motion' : 'Pause motion'}`;
}
setMotion(paused);
motionButton.addEventListener('click', () => setMotion(!paused));
reduced.addEventListener('change', event => setMotion(event.matches));
const links = [...document.querySelectorAll('.chapter-index nav a')];
const sections = [...document.querySelectorAll('.chapters > section')];
const revealTargets = document.querySelectorAll('.chapter, .scope-image, .audiences article');
revealTargets.forEach((target) => target.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) {entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target);} });
}, {threshold:0, rootMargin:'0px 0px -35px 0px'});
revealTargets.forEach(target => revealObserver.observe(target));
let scheduled = false;
function updateReading() {
  scheduled = false;
  const distance = root.scrollHeight - innerHeight;
  root.style.setProperty('--read', distance > 0 ? Math.min(1, scrollY / distance) : 0);
  let active = sections[0];
  sections.forEach(section => {if (section.getBoundingClientRect().top < innerHeight * .4) active = section;});
  links.forEach(link => {if(link.hash === `#${active.id}`) link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
addEventListener('scroll', () => {if (!scheduled) {scheduled = true; requestAnimationFrame(updateReading);}}, {passive:true});
addEventListener('resize', updateReading);
updateReading();
const imageWindow = document.querySelector('.image-window');
imageWindow.addEventListener('pointermove', event => {
  if (paused || event.pointerType !== 'mouse') return;
  const rect = imageWindow.getBoundingClientRect();
  imageWindow.style.setProperty('--image-x', `${(event.clientX - rect.left - rect.width/2) * -.012}px`);
  imageWindow.style.setProperty('--image-y', `${(event.clientY - rect.top - rect.height/2) * -.012}px`);
});
imageWindow.addEventListener('pointerleave', () => {imageWindow.style.setProperty('--image-x','0px');imageWindow.style.setProperty('--image-y','0px');});
const previews = [
  ['valley.webp','Mountain-valley location artwork with a film unit preparing a scene','01 / SCOUTING'],
  ['snow-production.webp','Snowy mountain location artwork with a camera crew','02 / MANAGEMENT'],
  ['valley.webp','Mountain-valley location artwork with a film unit preparing a scene','03 / PERMISSIONS'],
  ['forest-production.webp','Forest location artwork with a camera crew','04 / UNIT LOGISTICS'],
  ['snow-production.webp','Snowy mountain location artwork with a camera crew','05 / COMPANY MOVES'],
  ['valley.webp','Mountain-valley location artwork with a film unit preparing a scene','06 / RESPECT FOR PLACE']
];
const services = [...document.querySelectorAll('.service-list details')];
const preview = document.querySelector('.scope-preview');
const previewImage = preview.querySelector('img');
services.forEach((detail,index) => detail.addEventListener('toggle', () => {
  if (!detail.open) return;
  services.forEach(other => {if(other !== detail) other.open = false;});
  const [file, alt, label] = previews[index];
  previewImage.src = `assets/${file}`;
  previewImage.alt = `Illustrative artwork: ${alt}`;
  preview.dataset.label = label;
  if (!paused) previewImage.animate([{opacity:.35,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],{duration:500,easing:'ease-out'});
}));
// The default open accordion and preview describe the same service.
previewImage.src = `assets/${previews[0][0]}`;
previewImage.alt = `Illustrative artwork: ${previews[0][1]}`;
preview.dataset.label = previews[0][2];
