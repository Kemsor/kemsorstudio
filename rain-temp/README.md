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


### Finance overview

`/finance/` follows `Kemsor_02_Finance_Main_Page_Content.docx.pdf`: hero and illustrative five-item finance-ready pack, finance sub-menu, comparison table, three service summaries, creator/investor sections, four-step workflow, principles, related-work link, five FAQs and the supplied closing disclaimer. Hero and closing actions jump to the relevant audience card, whose action opens the existing contact flow. Sub-menu entries jump to service summaries; their Explore links use existing financing/co-production content until dedicated service-page copy is provided. No placeholder finance credits are published. The page reuses existing responsive WebP imagery and is linked from Capabilities, the footer, the homepage financing card and the Produce Hub.


### Crew & Equipment

`/produce/crew-equipment/` follows `Kemsor_Produce_04_Crew_and_Equipment.docx.pdf` and the existing Produce service design. It contains nine sections, six responsibilities, four workflow steps, three audience groups and three FAQs. It reuses the shared service styles and existing imagery, with responsive 640/960/1600px filming-illustration derivatives. The Produce Hub, menu, footer, Line Production and Casting pages link to it. Related-work cards are omitted pending confirmed project details. The source document flags equipment ownership/sourcing arrangements for confirmation before publishing; this local draft retains neutral planning/sourcing wording without asserting owned equipment or a particular rental relationship.


### Locations & Logistics

`/produce/locations-logistics/` follows `Kemsor_Produce_03_Locations_and_Logistics.docx (1).pdf`, using the shared Produce service layout. All nine sections, six included services, four steps, three audiences and three FAQs are included. Related-work cards are omitted until confirmed project details and cleared imagery are supplied. Responsive WebP derivatives of the existing planning artwork are generated by the image script. The Produce Hub, menu, footer and Line Production page link to this route.

Before publishing, confirm the source document’s flagged scope: whether permissions coordination covers owners only or authorities as well, and whether Kemsor arranges transport, accommodation and catering. The local draft retains the supplied permissions/unit-logistics wording and does not add accommodation or catering claims.


### Set & Production Design

`/produce/set-production-design/` follows `Kemsor_Produce_05_Set_and_Production_Design.docx.pdf` in the shared Produce service layout: nine sections, six included responsibilities, four workflow steps, three audience groups and three FAQs. It uses existing illustrations, including 640/960/1600px WebP design derivatives. Links are available from the Produce Hub, menu, footer and Locations & Logistics page. Related-work cards are omitted until confirmed project details and cleared stills are supplied.

Before publishing, confirm the document’s flagged construction scope: whether Kemsor builds sets directly or coordinates construction partners. The local draft retains the supplied construction and FAQ wording pending that confirmation.


### Shooting & On-Location Production

`/produce/shooting-on-location/` follows `Kemsor_Produce_06_Shooting_and_On-Location_Production.docx.pdf` in the shared Produce layout. It includes nine sections, six responsibilities, four workflow steps, three audience groups and three FAQs. It uses existing responsive WebP artwork. Links are updated in the Produce Hub, menu, footer and related service pages. All six Produce cards now have dedicated destinations. Related-work cards remain omitted pending confirmed credits and cleared imagery.

The local draft retains the supplied copy. Before publishing, confirm the document’s flagged safety responsibilities/policies and whether Kemsor performs on-set data handling or coordinates footage handover.


### Two-font typography

The frontend uses Inter (`--body`) for reading text and Manrope (`--display`) for headings. Former Space Grotesk rules use the shared display token; its `@font-face` declaration was removed so browsers no longer request it. News copy and screenplay styling use the body token, and print styles use it as well. The unused original font asset is retained but is not referenced by the frontend.


### Produce closing CTA update

The closing “Your next production” section was removed from Produce Hub, Line Production, Casting, Crew & Equipment, Locations & Logistics, and Shooting & On-Location Production. Set & Production Design retains its “Building a world?” section. Hero actions and shared site footer remain available.


### Supplied daylight illustrations

Eight supplied Gemini illustrations are integrated as responsive WebP assets. Generate them with `python3 scripts/optimize-daylight-images.py /path/to/source-images`; the source-name mapping is in `scripts/daylight-images.json`. Original PNGs remain outside the public build. The eight originals total 68.08 MiB; their combined 1600px derivatives total 1.57 MiB, 960px derivatives 0.72 MiB and 640px derivatives 0.39 MiB. Existing imagery remains in the project and is mixed with the new artwork.

Produce and What We Make heroes now place text on a warm, separate panel beside unobscured imagery, stacking the image below the copy on mobile. Finance retains its finance-specific presentation. New snow/interior/valley/park illustrations appear in relevant service heroes, cards and supporting imagery; the lake scene appears on What We Make. Train, forest-action and helicopter illustrations join the Projects visual archive, explicitly labelled as supplied AI illustrations rather than credited Kemsor productions.

## October 25 website update

Client content pages now cover Develop, Finance, Produce, Post and Release, with shared section navigation and dedicated layouts. Inner pages use white backgrounds and 13px body text. The homepage includes the two-card split production gallery, fullscreen studio clips and a script-to-production line illustration. Heading reveals run once per section; body copy fades without displacement. Desktop wheel easing and pinned visuals share scroll updates; native touch and reduced-motion behavior are preserved.

Build the frontend with `npm --prefix rain-temp run build` from the repository root. Static output is `rain-temp/dist/`. The existing root package serves the Node backend; its build command does not build the frontend. Do not publish local storage, credentials, audit exports or design-sample screenshots as part of the static website.


## Partner with us

`/partner-with-us/` implements the supplied Partner With Us content document, including four selectable routes and their enquiry forms. Filmmakers & Creators opens by default; `?route=filmmakers`, `studios`, `co-producers` or `international-productions` opens a specific route. Studio navigation and the homepage partnership links point to this page.

Forms use the existing CSRF-protected `/api/enquiries` endpoint and respect the CMS enquiry availability and privacy settings. Route-specific details, checkbox selections and acknowledgements are saved as labelled text in the enquiry message, using the existing Production, Business or Partnerships category. No uploads or full scripts are accepted here. Privacy consent remains required by the existing enquiry service. No database migration is needed.
