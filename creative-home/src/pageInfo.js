export const pageInfo = {
  home: { label: 'Home', title: 'Kemsor Studios — Let’s make a scene.', description: 'Production support for films, series and documentaries, from the first idea to the finished frame.' },
  about: { label: 'Studio', title: 'The studio — Kemsor Studios', description: 'Meet the Kemsor approach to development, production and collaboration across films, series and documentaries.' },
  services: { label: 'Services', title: 'Production services — Kemsor Studios', description: 'Production support from development and financing to locations, casting, crew, post-production and release.' },
  projects: { label: 'Productions', title: 'Productions & story formats — Kemsor Studios', description: 'Explore film, series, documentary and short film formats, and the supplied visual collection.' },
  news: { label: 'Newsroom', title: 'Newsroom & studio notes — Kemsor Studios', description: 'Practical studio notes on project briefs, production planning and the journey from idea to audience.' },
  careers: { label: 'Careers', title: 'Careers — Kemsor Studios', description: 'The creative, production and post-production disciplines behind the frame. Find the current opportunities at Kemsor.' },
  contact: { label: 'Contact', title: 'Start a project — Kemsor Studios', description: 'Prepare your project brief and find a starting point for working with Kemsor Studios.' },
};
export const pageHref = page => page === 'home' ? '/#home' : `/${page}/`;
