# Kemsor Studios — Light theme

Independent seven-page version of the original Kemsor website. Warm ivory, ink and bronze surround the original cinematic media and interactive sequences.

## Run

```sh
cd light-theme
npm install
npm run dev
```

Development: http://127.0.0.1:3004

`npm run build` creates the standalone static site in `dist/`. `npm run preview` serves it on port 4174.

The theme is defined in `src/light.css`, imported after the original styles. Assets are copied into this folder so the production build does not depend on the original site. The homepage uses white section backgrounds and a full-screen film opening with bright KEMSOR lettering. Supporting pages retain serif headlines, compact service entries and rectangular image frames. Photographic overlays retain light text for readability. The chair and fire sequences remain cinematic dark inserts.

## Lightweight production version

The first screen renders immediately with a prioritized WebP poster. The homepage hero starts one muted background film after the poster appears, with static fallbacks for reduced motion and data-saving mode; letter-panel previews download only on click or tap. Below-the-fold images remain lazy loaded. Six-second preview clips replace the original full films. Native scrolling replaces wheel interception, the gold panel and photo collage animate on scroll, service entries stack on desktop, and service-page images tilt. The chair engine loads only near the careers section, with a still-image fallback for mobile and reduced motion. The flame wordmark is a separate lazy-loaded module, runs at 15 fps only near the viewport, and pauses in hidden tabs.

Deploy the contents of `light-theme/dist/` after running `npm run build` from this folder. The build filters out original films, duplicate JPEG/PNG artwork, and unused audio. The WebGL engine ships as a separate on-demand chunk. Keep source assets locally for future editing. This optimization has not been deployed to the live server.

For the host, enable Brotli or gzip for HTML, JS, CSS and fonts. Give hashed JS/CSS a long cache lifetime and HTML a short cache lifetime so new deployments appear promptly.
