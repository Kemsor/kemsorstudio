# Kemsor Studios — React website

A React website built with Vite, with seven designed pages: Home, About, Services, Projects, News, Careers and Contact. Internal navigation keeps the shared music player mounted. Each page also has a real HTML entry for direct URLs and static hosting.

The canonical source repository is `Kemsor/kemsorstudio`, with production work maintained on the `main` branch.

## Run

```sh
npm install
npm run dev
```

Development preview: `http://localhost:3003`.

```sh
npm run build
npm run preview
```

The production build is generated in `dist/`. Production preview: `http://localhost:4173`. `npm run check` runs the production build. Vite builds all seven page entries. Upload the full dist directory to static hosting; the directories provide direct page URLs without a catch-all rewrite. Unknown paths return 404.

## Structure

- `src/main.jsx`: shared layout, homepage interactions and internal navigation.
- `src/Pages.jsx`: six supporting pages and page metadata.
- `src/pages.css`: responsive supporting-page layouts.
- `src/ScrollVision.jsx`: scroll-driven gold-panel reveal with split text and a filmmaking image collage.
- `src/content.js`: homepage text, service capabilities, production stages and clip mappings.
- `src/styles.css`: complete responsive visual system, using Bebas Neue and Manrope.
- `public/assets/`: supplied logo, footage, extracted poster stills, supporting imagery and font assets.

The homepage includes a cinematic opening, six interactive KEMSOR video panels, studio introduction, four content formats, ten service capabilities, six process stages and project-brief preparation. The content follows the supplied **Kemsor Studios Home Page Content.docx** and **Kemsor_Studios_Website_Structure_Services.docx**; the latest request restores the full navigation and supporting pages specified in the structure document.

## Interaction and content notes

- Videos always play muted and inline. Only the active clip loads; posters display before interaction. Pointer exit, keyboard focus exit, Escape, scrolling offscreen and hiding the page stop playback. System reduced-motion preferences suppress hover playback while allowing an explicit tap/click.
- Services appear as six full-image cards that stack on native scrolling, covering all ten capabilities. Keyboard focus brings covered card links into view. Reduced motion and short viewports use normal non-sticky cards. The six production stages use keyboard-accessible accordion buttons.
- The project brief dialog downloads a text file locally. It does not submit an enquiry or collect contact information. Contact details and live enquiry delivery are not yet configured.
- The supplied clips are visual inspiration, not claimed Kemsor productions. No project credits, announcements or job openings have been fabricated. News includes three original evergreen studio notes; these are editorial content, not dated company announcements.
- Bebas Neue is hosted locally with its license in `public/assets/fonts/Bebas-Neue-OFL.txt`. Manrope is hosted locally with a system fallback; its license is in public/assets/fonts/Manrope-OFL.txt.

## Footage mapping

K — Action Movie Teaser (LTX_io); E — AIR BORN (FILM CRUX); M — Cruise Ship Disaster; S — My Love (Arabian Nights); O — Parashurama Vs Ganesha (Short Sparks); R — videoplayback. JPEG stills were extracted from the corresponding supplied clips.

Supporting clapperboard imagery: https://images.unsplash.com/photo-1485846234645-a62644f84728.

## Generated service artwork

Six original cinematic service illustrations were generated using the built-in image generation tool. Full-resolution PNG originals are in `output/imagegen/`; optimized JPEGs consumed by React are in `public/assets/services/`. The complete prompts and asset mapping are recorded in `output/imagegen/service-prompts.json`. These are illustrative scenes, not photographs of actual Kemsor personnel or productions.

The six cards map to the supplied services as follows:

1. Financing: Film Financing & Investment.
2. Planning: Production Management; Location & Logistics Management.
3. Casting: Casting & Talent Coordination.
4. Filming: Line Production; Crew & Equipment Management; Shooting & On-Location Production.
5. Design: Set Design & Production Design.
6. Post: Post-Production Supervision; Distribution & Release Support.

## Creative vision scroll section

Between the formats and services sections, `#vision` presents Creative vision / Cinematic reality around a small gold frame. Native scroll progress separates the words, expands and straightens the gold frame to fill the viewport, then reveals the studio message and three filmmaking images. Scrolling backwards reverses the sequence. Scroll work is limited to the section’s visible area and batched with requestAnimationFrame. Reduced-motion preferences and short viewports present a static, readable layout without a prolonged pinned section.

## Careers

The homepage careers section (`#careers`) pairs centered Bebas Neue typography with an original burgundy director’s chair on black. The View opportunities button opens an accessible inline status panel; no open roles or application destination have been supplied, so it currently explains that no roles are listed. It does not submit applications.

The chair was created with the built-in image generation tool. The original is `output/imagegen/careers-chair.png`, the web asset is `public/assets/careers/directors-chair.jpg`, and the full prompt and generation mode are recorded in `output/imagegen/careers-prompt.json`.

## Website music

The supplied Pahadi Flute track is served locally from `public/assets/audio/pahadi-flute.mp3`. Controls above the header play or pause the looping track at 35% volume. Playback is attempted on load; browsers that block audible autoplay show a Play prompt. Music defaults to on for every page load. If autoplay is blocked, playback is retried on the first click or keypress; an explicit pause is respected for the rest of that page visit. Showcase videos remain muted.

## Video hero

The supplied `20594056-uhd_3840_2160_25fps.mp4` is exported as a silent, network-optimized 1080p MP4 in `public/assets/hero/studio-film.mp4`, with a matching `poster.jpg`. The hero loops muted behind a staggered KEMSOR title reveal, studio copy, and links to the contact and services sections. A separate film control pauses or resumes the background; playback pauses offscreen or in a hidden tab. Reduced-motion visitors see the poster and static title instead.

## Opening loader and progressive loading

`src/LoadingScreen.jsx` waits for the logo, hero poster, fonts, and initial playable hero/audio data before revealing the page. It does not wait for entire media files or below-the-fold content. Entry has a 650ms minimum, an 8-second maximum, and an Enter studio bypass. Errors settle the corresponding asset check rather than blocking entry. Underlying content is inert during loading, and the hero title animation is held until entry. Browser autoplay restrictions still apply; manual entry provides a gesture for music playback.

The music bar now has one button that changes between Play and Pause based on actual playback. Native smooth anchor scrolling is enabled and respects reduced-motion preferences. Below-the-fold images use lazy loading and asynchronous decoding; KEMSOR panel posters are assigned within 400px of the viewport, and their video sources remain interaction-only.

## Brand identity

The website uses the Gold on Black identity derived from the supplied logo. `src/brand.css` owns the shared brand tokens and themed components. Client handoff files are in `output/brand/`: a six-page PDF guide, self-contained HTML source, and JSON design tokens. These are handoff artifacts, not additional website pages.

Audible autoplay cannot override browser permissions. The loader’s Enter studio with music action invokes playback directly during the click, and trusted click/touchend/keyboard interaction retries blocked playback. A visible Tap to start music prompt appears above the header, including on mobile. Explicitly pausing stops these automatic retries for the visit.

Music startup is independent of opening readiness: playback is attempted immediately when the audio component mounts, while the visual loader may still be preparing the hero. The loader never gates the initial play attempt.

## Careers chair turn

`src/Careers.jsx` pins the careers section while native scroll progress turns a real Three.js director’s chair halfway from its rear toward the viewer. `src/ChairRenderer.js` constructs separate volumetric wood rails, folding legs, brass joints, and burgundy canvas panels. The chair eases into its front orientation, then immediately reveals the existing seated portrait. It makes a single 180-degree introduction, not a full spin. Reverse scrolling reverses the sequence. This replaces the previous flat-image flip.

The 3D renderer is dynamically imported only near the section, renders on scroll/resize rather than continuously, and disposes GPU resources when unmounted. Reduced-motion, short viewports, and unavailable WebGL use the static seated portrait. The portrait remains photographic; only the empty chair is a 3D model.

Original generated assets are `output/imagegen/careers-turn-{empty,back,seated}.png`; optimized JPEGs are in `public/assets/careers/`. Built-in image generation prompts are recorded in `output/imagegen/careers-turn-prompts.json`. The depicted woman is generated illustrative artwork, not an identified Kemsor employee.

## Two-slide hero

The hero cycles between the two supplied videos every five seconds after opening readiness, with a one-second dissolve, subtle zoom and animated supporting copy. Slide two uses “Rooted in culture. Made for the world.” Music remains independent. Only the active video plays; the second video begins preloading after initial entry. Numbered controls choose a slide, and the film pause button pauses both playback and automatic slide changes. Automatic changes also pause offscreen, in hidden tabs, and while keyboard focus is within the hero. Reduced motion uses stills with manual slide selection. The second optimized video and poster are in `public/assets/hero/second/`.

## Hero text panel and camera imagery

Both hero chapters use a translucent black panel aligned to the left edge, with rounded right corners and a subtle gold border. The panel fades with the copy during the existing desktop hover effect. The studio section now includes a wide filmmaking image; How we work uses a new camera detail image. Both load lazily. The new original is `output/imagegen/camera-detail.png`, with its built-in generation prompt in `output/imagegen/camera-detail-prompt.json` and web JPEG in `public/assets/services/camera-detail.jpg`.

## Contact flame wordmark

`src/FlameWordmark.jsx` renders a procedural amber/orange fire texture inside KEMSOR letterforms on Contact. The lettering uses the local Bebas Neue font with a sharp canvas mask. Animation runs at up to 24 fps only near the viewport and while the tab is visible. A pause/play control preserves animation time; reduced motion renders a still. No video download or extra audio is introduced. Browser checks cover frame changes, pause/resume, mobile fit and reduced motion.


## Loading and mobile optimization

The runtime uses WebP versions of imagery and a 20 KB display derivative of the supplied logo; source assets remain available. Hero playback uses silent 720p fast-start files (3.82 MB and 3.88 MB, versus 44.02 MB and 34.61 MB originals). The first video starts after page entry; the second prepares later. The loader waits only for small opening images, never for audio/video or fonts, with a 1.5-second maximum. Audible music still attempts to play immediately under browser autoplay rules.

Supporting pages are a separate JavaScript chunk. The 3D chair renderer is skipped on screens up to 800px wide; its portrait remains. Other animations pause offscreen or when the tab is hidden. Original files retained in public are not automatically downloaded by the browser.

Mobile navigation stays visible while scrolling, has 48px targets, active-page state, Escape/tap-outside dismissal, keyboard focus containment and background interaction blocking. Studio/process/contact layouts stack at tablet widths. All seven routes checked at 320, 390, 768 and 1440px without horizontal overflow; local media-blocked page entry measured around 0.93 seconds (not a production/mobile-network benchmark).

Before public launch, configure compressed responses and cache headers on the chosen host, then measure the deployed site on a throttled mobile connection. Hosting is not configured by local changes.

## Services image tilt

The six Services page cards keep their copy steady while the image panel rotates clockwise with native scroll progress, up to 10 degrees on desktop, 6 on tablet, and 3 on phones. Scrolling back reverses the tilt. `src/useServiceTilt.js` uses one animation-frame update per scroll, with visibility gating and no extra animation library. Reduced-motion preferences leave the images level. Spacing reserves room around the rotated artwork; the homepage service-card stack is unchanged.

## Shared scrolling

`src/useSmoothScroll.js` adds lightweight desktop wheel easing at the app shell, so it remains active across all seven routes. It uses a short animation-frame loop only during wheel movement; no animation dependency is added. Native touch/keyboard scrolling, editable fields, nested scrollers and reduced-motion settings are preserved. Pointer/keyboard navigation cancels pending wheel motion, and background scrolling remains locked when the mobile menu is open. Section links continue to use native smooth anchor scrolling, with clearance for the mobile header.

## Hostinger upload — 2026-09-30

Production files uploaded to `/home/u310490635/domains/espertotech.in/public_html/kemsor` on the supplied SSH server. Build command: `npm run build -- --base=/kemsor/ --outDir=output/deploy/kemsor`. Runtime media URLs and navigation use Vite's base URL. The upload archive excludes unused source JPG/PNG/SVG and original large hero files; optimized runtime media is included. Scoped Apache/LiteSpeed configuration enables compression and cache policies.

Direct-origin checks returned HTTP 200 for all seven pages and tested media. The public `www.espertotech.in/kemsor` URL currently serves an older site through Vercel, so uploading to Hostinger alone does not update that public route. The Hostinger origin certificate also needs correction for verified HTTPS use. No domain/DNS/Vercel configuration was changed. No credentials are stored in project files.
