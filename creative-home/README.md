# Kemsor — Creative website

The creative homepage and six connected pages: Studio, Services, Productions, Newsroom, Careers and Contact. Each has a real HTML entry and works with direct URLs and ordinary static hosting.

Run `npm run dev` from this folder. Preview: http://127.0.0.1:3006.

Run `npm run build` to generate the deployable `dist` folder. `npm run preview` serves that build at http://127.0.0.1:4176. Dependencies resolve from the parent workspace; `npm install` can also make this folder self-contained when moving it.

The original menu labels and grouping are preserved. Every menu item points to its page and section. Shared header, footer, Kemsor branding and responsive gutters keep the pages aligned. The theme switch remembers its setting across pages, and all content backgrounds are white in light mode.

Page code loads separately. The hero starts with a poster before loading the muted film; motion pauses offscreen and respects reduced-motion and data-saving preferences. The footer provides a background motion switch, also remembered across pages.

The homepage’s In motion section is a horizontal filmstrip. On desktop, vertical scrolling advances through large adjacent frames; phones, short windows and reduced-motion/data-saving use a native swipe rail. Arrow keys and focus bring each film into view. Small ten-second silent previews load only on hover or keyboard focus when motion is allowed; the full clip, with its original sound, loads only when its corner Enlarge icon opens the viewer. There are no visible transport controls. Clicking the enlarged film or pressing Space toggles playback; sound and fullscreen have overlay icons, and Escape or Close releases the player. Offscreen and hidden-tab previews stop, and explicit enlargement remains available when background motion is off.

The director’s chair is on Careers. Its Three renderer loads separately near the section on desktop; mobile and reduced-motion use the still image. The burning KEMSOR wordmark is on Contact and mounts near its section. It renders at 12fps only in view. Neither component loads on the homepage.

The Contact brief creates a local text download and does not submit an enquiry. Leadership profiles, confirmed production credits, vacancies and direct contact details have not been supplied, so these pages do not invent them. The Newsroom contains practical production notes, clearly separated from studio announcements.

The other theme folders remain independent.
