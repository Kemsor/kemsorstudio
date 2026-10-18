# Kemsor rain experiment

Independent copy of creative-home. Run `npm run dev` here, then open http://127.0.0.1:3007/.

Rain starts enabled. Use the Rain switch beside Dark mode to turn it off. Preferences persist across pages on this separate origin. Rain pauses with background motion, when the tab is hidden, and for reduced-motion preferences. Mobile uses fewer drops. No changes are made to creative-home on port 3006.


### Homepage image optimization

Homepage service/project imagery and hero posters use WebP derivatives at 640, 960 and 1600 pixels, selected through `srcset`. Below-the-fold images load lazily with asynchronous decoding. Original assets are retained. Regenerate derivatives with `python3 scripts/optimize-home-images.py` (requires `cwebp`). The eleven PNG photographs total 77.3 MiB; their 1600px derivatives total 2.2 MiB, and 640px derivatives total 0.67 MiB. These are file-size measurements, not measured page-speed scores.

The first hero poster loads eagerly at high priority; later posters load on slide selection and remain available for dissolves. Studio-rail media sources are assigned only near the viewport, only the selected clip is loaded, and playback/rotation pause offscreen or in a hidden tab. Reduced-motion and data-saving visitors receive still posters.


### Produce Hub

`/produce/` is the first page updated from the October 18 content supplied in `Kemsor_Produce_00_Produce_Hub.docx.pdf`. It contains the nine supplied sections and is linked from Capabilities → Produce and the footer. Six service cards currently link to the corresponding existing `/services/` sections; individual service pages and What We Make remain separate follow-up work. Related-work project cards are omitted because no cleared project title, format, year or production credit was supplied. The archive link remains available. Images reuse optimized WebP assets; FAQs use native keyboard-accessible details/summary controls.


### Line Production & Production Management

`/produce/line-production/` follows `Kemsor_Produce_01_Line_Production_and_Production_Management.docx.pdf`, with all nine sections, six included responsibilities, four workflow steps, four audiences and three FAQs. It is linked from the Produce Hub, Capabilities menu and footer. Related service links use existing capabilities; credited project cards remain omitted until confirmed project details are available. The page reuses optimized WebP imagery and native keyboard-accessible FAQs.


### Casting & Talent Coordination

`/produce/casting/` follows `Kemsor_Produce_02_Casting_and_Talent_Coordination.docx.pdf` and the Produce service design. It has nine sections, five included responsibilities, four workflow steps, three audiences and two FAQs. The document flags agreement coordination and applicant privacy wording for confirmation; those claims and the workflow’s paperwork reference are omitted pending confirmation. The actor FAQ links conceptually to the Talent Network without claiming an online casting-call feature is live. Existing Find Talent and Join KEMSOR pages are linked; their backend connection remains separate work. Credited project cards remain omitted until confirmed details are supplied.

The Produce Hub, Capabilities menu and footer link to this page. Its hero uses 640/960/1600px WebP derivatives of the existing casting illustration; regenerate them with `scripts/optimize-home-images.py`.


### What We Make

`/what-we-make/` follows `Kemsor_What_We_Make_Page_Content.docx.pdf`, with four format jump links, the promise strip, dedicated Feature Films / Series & OTT / Documentaries / Short Films sections, six support items and an enquiry action per format, co-production links, four ways to start and the closing CTA. The supplied SEO title and description are included in both the HTML and runtime metadata. Navigation format links target this page; the footer includes What We Make under The Studio. Related-work cards are hidden as requested until cleared images, project titles, years, platform details and Kemsor credits are supplied. All format artwork uses existing responsive WebP assets and is illustrative rather than a credited production.
