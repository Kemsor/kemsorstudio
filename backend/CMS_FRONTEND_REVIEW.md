# CMS and frontend review — implementation update

Updated locally on 3 November 2026. The development gaps identified in the earlier
review now have implementation and automated verification. Client approvals and
production acceptance remain separate from local engineering checks.

## Website controls

| Area | CMS location | Current behavior |
| --- | --- | --- |
| Existing page and shared copy | Existing page content | 50 searchable areas / 3,638 plain-text controls, preserving the existing React markup, styling and supplied defaults. Includes original page headings, narrative copy, FAQs, shared editorial content and homepage capability cards. |
| Careers introduction and hiring process | Existing page content → Careers introduction & hiring process | Structured copy controls; department identifiers used by application forms remain stable. |
| Existing artwork | Existing page content → Image placements | 162 placements mapped from the rendered public pages, including their image descriptions. Independent uploads complete before saving. |
| Website logo | Existing page content → Website logo | Optional replacement image and description; supplied logo remains the default. Administrator only. |
| Header and footer navigation | Existing page content → Header & footer navigation | Labels, destinations, visibility and ordering; administrator only. Application routes and form field identifiers remain fixed. |
| Homepage showreel | Existing page content → Showreel & page videos | Four clip slots with video, poster, label, visibility, order and optional subtitle track. |
| How We Work / What We Make videos | Existing page content → Showreel & page videos | Separate managed video, poster, label, visibility and optional subtitle controls for each section. |
| Homepage hero | Homepage hero slides | Existing five preserved slides; video/poster, timing, ordering, heading, description, CTA, drafts and revision history. |
| Homepage promotions | Homepage publishing | Explicit hero-copy or additional-section placement. Slide text takes priority over default hero copy. |
| Additional page sections | Manage pages / Page content | Shared registry of 36 page targets; additional rich-text sections, images and page metadata. These complement the existing-content controls. |
| Productions | Productions | Slate status, format, language, year, image, optional video, descriptive caption and WebVTT subtitles; published data feeds the slate, homepage and Newsroom. |
| Feature Films / Series & OTT / Documentaries | Their page publishing modules | Optional video, poster and subtitles in published content sections. |
| Newsroom | News posts | Categories, lead story, banners, summaries, rich text and press-release PDFs. |
| Press resources | Press resources | PDF upload or approved resource URL, descriptions, images, rich body and usage wording. |
| Blog | Blog posts | Category, banner, title, summary and rich body; category controls match public filtering. |
| Career opportunities | Career opportunities | Published vacancies and the connected general/internship/vacancy application inbox. |
| Team profiles | Team profiles | Published portraits, role/location and content appear under About → Leadership. |
| Legal documents | Managed legal editor | Policy content, dates, versions, footer links, drafts/publishing and history. Legacy editor URLs now redirect to the managed editor; disconnected legacy writes and bulk actions are rejected. |
| Contact, footer and social settings | Contact & site settings | Contact email/phone/address, map caption/location, footer copy/headings/CTA/copyright and official social links are connected. Missing settings use supplied defaults; explicitly cleared values remain cleared. |

The new existing-content controls store **overrides**, not replacement HTML.
Nothing in these modules replaces the supplied content until an editor publishes.
Each area supports draft saves, stale-edit protection, reset to supplied defaults
and restoring an earlier revision as a draft. Images referenced by saved content
or history are protected from deletion. Rich-text formatting remains available in
the listing/additional-section editors; fixed-layout copy controls preserve the
existing typography and structure.

## Operational connections

- Enquiry, partnership, career and talent forms retain their existing API,
  consent/version controls, staff inboxes, assignments and history.
- Member registration, reviewed talent visibility, shortlisting/enquiries and the
  manual production-planning workspace remain connected to their admin modules.
- Script uploads remain subject to published submission terms and activation.
- News alerts retain double confirmation and unsubscribe controls. The new
  **News campaigns** module creates a draft, previews the story/message and
  confirmed topic-matching recipient count, then requires explicit queuing.
  The worker sends queued messages and rechecks subscriber status, topic consent,
  campaign status and story publication before delivery. Campaigns are not sent
  merely because a news post is published. Pending deliveries can be cancelled.
- The media library lists images, MP4 videos, PDF resources and subtitle tracks, with format filters, reusable URLs and deletion/usage checks that include saved website revisions.
- PDF resources and WebVTT subtitle files use separate staged uploads. PDF uploads
  are limited to 10 MB, WebVTT to 1 MB, and MP4 to 50 MB. Media suffix routes verify
  MIME type; video playback supports byte ranges.
- The public content feed now uses snapshot/keyset pagination. The frontend loads
  all batches before applying a refresh; content beyond the former shared
  300-entry limit is no longer silently omitted.
- Reports, role-based administration, MFA, activity, email diagnostics and
  operations controls retain their backend connections.
- Backup/recovery and retention tools remain implemented, with activation
  dependent on approved policy and environment configuration.

## Verification and evidence

- **92 backend integration tests passed**, including drafts/publication/reset and
  restore, role checks, module validation, media uploads, PDF/subtitle routes,
  campaign consent checks and content pagination beyond 300 entries.
- **44 public pages loaded in Chrome without runtime errors.** An isolated browser
  database verifies admin/editor/enquiry-manager permissions, private drafts,
  publication reaching the frontend and upload completion before form saving.
- Browser checks also exercise published image replacement, navigation labels,
  page-video controls and website logo publication. Desktop/mobile Productions
  screenshots were visually reviewed; process-link contrast was corrected.
- Frontend build and SEO checks passed: 44 pages / 41 indexable sitemap URLs.
  All admin EJS templates compile. Compatible dependency fixes leave npm audit
  reporting no vulnerabilities for the backend dependency tree.
- The single explicitly approved email test to `info@kemsorstudio.com` was accepted
  by the configured SMTP service on 3 November 2026. This establishes acceptance
  by that service; **KEMSOR's inbox receipt is not yet confirmed**.
- Browser and integration test databases are isolated and removed afterward. No
  campaign was sent to real subscribers during QA.

## Deployment and remaining client decisions

Migration `022_site_modules_campaigns.sql` is applied locally. The restarted local CMS health/content endpoints and editor assets through frontend port 3007 were checked successfully. Deploy backend,
frontend and the `shared` catalogue/default files together. The latest changes
have not been deployed to the production website by this task.

Remaining external/acceptance items:

1. KEMSOR confirms receipt of the one approved test email; verify real production
   forms after the approved release is deployed to its actual environment.
2. KEMSOR supplies approved retention periods and deletion policy before automatic
   personal-data deletion is enabled.
3. KEMSOR supplies an off-site backup destination and confirms access, schedule,
   retention and recovery responsibilities before off-site copying is activated.
4. KEMSOR reviews approved content and provides formal UAT/launch acceptance.

These decisions were not guessed or treated as completed by the automated tests.
Application authentication, security/consent rules, form schemas and the site’s
visual layout system remain application controls rather than arbitrary CMS HTML.
