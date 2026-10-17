# Kemsor rain experiment

Independent copy of creative-home. Run `npm run dev` here, then open http://127.0.0.1:3007/.

Rain starts enabled. Use the Rain switch beside Dark mode to turn it off. Preferences persist across pages on this separate origin. Rain pauses with background motion, when the tab is hidden, and for reduced-motion preferences. Mobile uses fewer drops. No changes are made to creative-home on port 3006.


### Homepage image optimization

Homepage service/project imagery and hero posters use WebP derivatives at 640, 960 and 1600 pixels, selected through `srcset`. Below-the-fold images load lazily with asynchronous decoding. Original assets are retained. Regenerate derivatives with `python3 scripts/optimize-home-images.py` (requires `cwebp`). The eleven PNG photographs total 77.3 MiB; their 1600px derivatives total 2.2 MiB, and 640px derivatives total 0.67 MiB. These are file-size measurements, not measured page-speed scores.

The first hero poster loads eagerly at high priority; later posters load on slide selection and remain available for dissolves. Studio-rail media sources are assigned only near the viewport, only the selected clip is loaded, and playback/rotation pause offscreen or in a hidden tab. Reduced-motion and data-saving visitors receive still posters.
