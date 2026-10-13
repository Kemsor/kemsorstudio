import { introduction } from './content';
export const pageInfo = {
  home: ['Home', 'Kemsor Studios — From idea to audience.', introduction],
  about: ['About', 'About the studio — Kemsor Studios', 'One production partner for film, series and documentaries. Discover the Kemsor approach, from idea to audience.'],
  services: ['Services', 'Production services — Kemsor Studios', 'Explore ten connected production capabilities and six stages of support, from development and financing to distribution and release.'],
  projects: ['Projects', 'Projects & story formats — Kemsor Studios', 'Explore the kinds of stories Kemsor supports: series, documentaries, regional cinema and international co-productions.'],
  news: ['News', 'News & studio notes — Kemsor Studios', 'Production notes, practical starting points and updates from Kemsor Studios.'],
  careers: ['Careers', 'Careers — Kemsor Studios', 'For storytellers, makers and the people behind every frame. Discover the disciplines behind Kemsor productions.'],
  contact: ['Contact', 'Discuss your project — Kemsor Studios', 'Prepare your next conversation with Kemsor: share your creative vision, production stage and support needs.'],
};
export const pageHref = key => key === 'home' ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}${key}/`;
