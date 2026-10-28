# Kemsor designer theme

An isolated React + Vite implementation of the 14 designer screenshots supplied on 28 October 2026. The existing website in `rain-temp` and the backend are unchanged.

```sh
npm install
npm run dev
```

Preview: http://127.0.0.1:3008

```sh
npm run build
npm run preview
```

## Implemented

- Dark, orange and lavender design, original Kemsor logo, locally hosted fonts.
- Fixed rounded navigation, the main website’s complete dropdown menus, a Capabilities mega menu, keyboard access and mobile accordions.
- Hero showreel carousel with playable video dialog and native player fullscreen.
- Moving format strip and interactive About panel.
- All six services in a switchable, swipeable module with photographic backgrounds.
- Five expanding production reference cards.
- Process cards, staggered image wall, partnership links and the main website’s compact footer links, CMS social profiles and Studio Guide.
- A fixed back-to-top arrow with mobile safe-area positioning and content collision checks.
- Responsive layouts and reduced-motion support.

The hero uses the supplied crowd portrait (`6e48c6490273b8fdf2d8a8ea33802cdde2514523.png`), optimized as WebP. Other assets are optimized files reused from the existing Kemsor project. The screenshots do not include separate designer photo/video exports; these local assets preserve a complete preview until the source artwork is supplied. Portfolio imagery is labelled as visual reference, not verified Kemsor credits. The image wall uses production stills rather than claiming associations with third-party film posters.

Inner-page links use the existing website. Set `VITE_MAIN_SITE_URL` to override the target (development default: http://127.0.0.1:3007; production default: https://app.kemsorstudio.com).

The footer email form continues to the existing Join KEMSOR flow with the email passed as a query parameter. It does not claim to store a newsletter subscription. No backend data or live site is modified by this preview.

The development server proxies `/api` to the existing local backend on port 8100 to read public social/contact settings. Set `VITE_CMS_API_URL` for a different API. Unconfigured social profiles show their official icons without invented links.

## Hosted demo

The repository root build also builds this design with Vite base `/demo2/` and copies only its compiled files into `rain-temp/dist/demo2/`. The existing Node static-file handler serves it at `/demo2/` alongside the main website. Images, video, fonts and generated bundles use the demo asset prefix; the public CMS request remains `/api/site`.

Run `npm run build` from the repository root for the complete hosting artifact. Running the designer's own dev command keeps the local preview at port 3008. Header/footer destinations are deliberately plain text for this design review; dropdowns and interactive preview controls still work.
