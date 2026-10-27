# Kemsor Phase 1 CMS

Node.js + Express + MySQL. Local admin: http://127.0.0.1:8100/admin. Connected website: http://127.0.0.1:3007.

The existing `kemsor` database contains the CMS tables. The running application uses a separate `kemsor_cms_local` MySQL account with SELECT, INSERT, UPDATE and DELETE access to this database only. Migration credentials are separate. All credentials and the session secret are in ignored `.env` files; do not publish them.

## Run locally

From `backend/`:

```sh
npm ci
npm run setup
npm start
```

`npm start` loads the local `.env` when present. `npm run dev` watches backend changes; use `npm start` when the machine’s file-watcher limit is reached. In `rain-temp/`, run `npm run dev` for the website. The Vite proxy forwards `/api` and `/media` to port 8100. The original port 3006 design is unchanged.

Initial local admin credentials are in `storage/local-admin.txt` with private filesystem permissions. Change the password after signing in. Create separate editor and enquiry-manager accounts under Users & roles. There is no public registration.

On another machine, copy `.env.example` to `.env`, generate a strong session secret, configure an existing empty MySQL database, and use appropriate migration and runtime credentials. The local XAMPP socket path is machine-specific.

## Included modules

- Newsroom and blog publishing; draft, published and archived states.
- Career notices and leadership/team profiles.
- Selected homepage content: `home-hero` controls the action-film title and side caption; `home-intro` controls the studio heading and paragraphs. Additional Homepage entries appear as promotional sections.
- Approved page sections associated with a site page; optional title/description metadata overrides.
- Legal Centre publishing, without fabricated legal policies.
- An image library with required alternative text, PNG/JPEG/WebP MIME and signature checks, random storage filenames and a 5 MB limit.
- Facebook, Instagram and YouTube profile settings.
- Structured business, partnership, press, careers, production/service-partner, copyright/anti-piracy and general enquiries.
- Enquiry search/category/status filters; assignment; internal notes; optional private attachments; admin-only personal-data deletion.
- Admin, editor and enquiry-manager roles, activity records and password changes.

Content uses plain text; HTML is escaped. Existing supplied website content remains available when the API is offline. When connected, blog publishing follows database states. News updates are separate from the existing evergreen production notes. No fake vacancies, team profiles or production credits have been seeded.

## Enable enquiry submission

The original project-brief form still downloads a copy. A separate studio enquiry form at `/contact/#send-enquiry` submits to the CMS.

Enquiries initially remain disabled. In Site settings, enter the Kemsor-approved privacy notice and its version, then enable enquiries. Optional attachments remain disabled until enabled there. Submissions are stored in the workspace, not emailed. No email provider or paid service is activated.

Attachments, if enabled, accept PDF, PNG, JPEG or WebP up to 5 MB. They are outside the web root and accessible only through an authenticated enquiry-staff download route. Production malware scanning and client-approved retention/consent text need to be finalized before public launch.

## Scope source and boundary

Reviewed the user-supplied signed agreement dated 18 September 2026, Annexure A (pages 28–29), and the separately referenced signed Final Technical Scope Freeze dated 9 September 2026, sections 4.2–4.3 (page 4), 6 (page 5) and 8 (page 7).

This implements the basic T04 content/enquiry workspace and supporting access controls locally. It does not claim completion or contractual acceptance of all Phase 1 deliverables. The freeze names Laravel/MySQL; the user subsequently instructed that the backend use Node.js, which this implementation follows.

Full individual film records, cast/crew databases, casting and script submissions are Phase 2 and are not implemented. Paid KPI/maintenance services remain excluded under the definitive agreement.

Privileged MFA depends on the approved security design and is not implemented in this basic local build. Production HTTPS, secure cookies, approved reverse-proxy configuration, staging/UAT separation, malware controls where agreed, legal review, automated retention/backup and launch approval remain deployment requirements. No production deployment was performed.

## Routes

- `GET /health`: database connectivity.
- `GET /api/site`: published entries and public site settings only.
- `GET /api/csrf`: anonymous session/CSRF token for the public enquiry form.
- `POST /api/enquiries`: consent-validated enquiry, with optional attachment.
- `GET /media/:id`: approved CMS image.
- `/admin/*`: authenticated publishing, users, settings, inbox and activity pages.

Public write requests require the CSRF token and allowed origin. Sessions are stored in MySQL under hashed identifiers, with HttpOnly/SameSite cookies and one-hour expiration. Passwords use salted scrypt hashes. Login/enquiry limits are persisted in MySQL; the public form also has a honeypot. Private records never appear in `/api/site`.

For production, deploy Node separately from the current static Vercel site and route same-origin `/api` and `/media` requests to it. Use `NODE_ENV=production`, HTTPS, a production WEBSITE_URL and an explicitly configured proxy trust setting. Do not upload this directory into the existing static bundle as a way to run Node.

## Schema and export

`migrations/001_phase_one.sql` is the portable schema. `npm run setup` applies unrun migrations and seeds only missing initial entries; it does not reset content. Initial blog entries come from the website's existing production notes. No private enquiries are seeded.

`npm run export` creates a private JSON export under ignored `storage/exports/`, including user password hashes and enquiry data. Store exports securely; copy `storage/uploads/` separately for files. This is a data handover export, not an automated backup/restore service. Expired sessions and rate-limit records are cleared during setup; production needs scheduled housekeeping.

## Verification

`npm test` creates and drops a dedicated `kemsor_cms_test_<process id>` database using migration credentials. It never resets `kemsor`. Tests cover authentication/CSRF, role permissions, admin rendering, draft/publish/archive visibility, escaped content, slug validation, social/notice validation, enquiries/consent/follow-up/deletion, unsafe uploads, throttling and disabled accounts.

The React production build passes. Visual browser/device review was unavailable in this session and remains necessary before UAT. The website retains its existing large 3D-renderer bundle warning.

## Creative dashboard and notifications

The overview includes role-aware publishing/enquiry cards, recent content and conversations, quick-create actions, an image-library count, and a seven-day chart of real operational audit events (UTC days). These are CMS workflow summaries, not website analytics or paid KPI reporting. No synthetic business metrics or enquiry records are shown.

Notifications are generated from current new enquiries, drafts and outstanding admin setup. The bell refreshes its count every 30 seconds while the tab is visible. The notification centre supports single-item and mark-all read actions; read receipts are stored per user in `cms_notification_reads`. Editors cannot see private enquiry notifications; enquiry managers cannot see publishing drafts or admin settings reminders. The feed includes the latest 20 new enquiries, 10 drafts and relevant setup reminders. Full lists remain accessible from their own workspaces.

Run `npm run setup` to apply migration 002 on another environment. No email, browser push or external notification provider is activated.

## Talent Network and production workspace (12 October 2026)

The latest `rain-temp` template adds `/find-talent/`, `/join/`, `/login/`, `/profile/` and `/script-to-production/`. Run `npm run setup` in backend to apply migration 003, then start backend on 8100 and Vite on 3007. The original `creative-home` template is unchanged.

Member accounts live in `talent_accounts`, separate from CMS staff. Registration has artist/crew and casting director/producer/director roles; successful login and registration lead to My Profile. Registration currently supports adults only and records processing consent. Email/SMS delivery and self-service password recovery are not configured: KEMSOR checks contact details manually before approval at `/admin/talent`. This is a reviewed profile, not identity verification. Editing a profile or portrait returns it to pending review. Artists separately opt in to public directory listing. Hirer shortlists and messaging require approved, contact-checked accounts; contact emails are excluded from public profiles and enquiries. Photos for unapproved/private profiles are available only to the owner or CMS admin and never publicly cached.

Projects are owned by the signed-in member. PDF/DOCX/TXT script uploads are private, max 5 MB, served as authenticated downloads. Signature validation is basic, not a full parser or malware scan. The current workspace is explicitly manual: it does not call GPT/IMDb, extract PDF/DOCX text, or produce AI recommendations. The UI shows this limitation. Users can save planning notes, print a production report to PDF, and download Excel-compatible CSV; this is not a native XLSX report. Premium billing, casting calls, auditions, automatic script analysis and production assistant are not implemented. Never represent these as live capabilities.

The existing exporter includes talent accounts, shortlists, member enquiries and production projects. Exports contain private information/password hashes and must remain protected along with `storage/uploads`. Public live hosting still needs the Node API and database configured on the same origin; static Vercel assets alone cannot provide member functionality.

Integration coverage includes member roles, review gating, public field filtering, portrait access, private enquiries, private project reads/updates and member login/logout. Full browser/device visual QA remains outstanding because the browser execution tool is unavailable in this session.


## Registration operations (13 October 2026)

The admin overview now includes live member registration counts, pending reviews and recent sign-ups. Pending profiles create admin-only notifications. **Registrations** lists every member role with name/email/city search, status and role filters, and 25-record pagination. **Talent enquiries** and **Production projects** expose the latest 200 records to admins; private script contents and files remain member-only. Studio contact-form submissions continue into **Enquiry workspace**, and CMS staff remain under **Users & roles**.

Member registration, successful login/logout and profile edits now appear in the activity log by account ID. Suspending an account invalidates existing member sessions. Approving a missing registration returns 404. Registration and login remain separate from privileged CMS staff access.

Local website: http://127.0.0.1:3007/ (real studio directory by default). Admin: http://127.0.0.1:8100/admin or http://127.0.0.1:3007/admin through Vite's proxy. Static preview builds still explicitly disable membership when `VITE_PUBLIC_PREVIEW=true`. No migration is required for these changes.

Verification: 16 isolated MySQL integration tests pass, including every publishing module, member review notifications, role isolation, suspension, and access to registrations beyond the previous 200-record limit. Both frontend builds pass with the existing large 3D chunk warning. Browser automation is unavailable in this environment; visual/device QA remains outstanding.

## Hosted admin password recovery

If the generated credentials file is unavailable, add three temporary secrets to the
hosting environment you want to recover (Preview and Published are separate):

- `ADMIN_RESET_EMAIL`: the existing active administrator email, initially `admin@kemsor.local`.
- `ADMIN_RESET_PASSWORD`: a new password of 16–128 characters.
- `ADMIN_RESET_ID`: a fresh random identifier of 16–100 letters, digits, underscores or hyphens.

Restart that app or deploy the latest version. Recovery runs once per identifier,
invalidates the administrator's existing sessions and records an audit event.
Remove all three recovery secrets after successful login. A future recovery needs
a new identifier. Passwords and recovery secret values are never written to logs.
This is a hosting-owner operation; no public password reset endpoint is exposed.

### Form confirmation emails

Enquiry and career application submissions save a plain-text confirmation to
`cms_email_outbox` in the same database transaction as the submission. The server
checks the queue every five seconds and retries failed delivery up to five times,
five minutes apart. Private script workspace drafts do not send confirmations.
Tests use fake transports and send no real mail.

**GoDaddy Node.js Hosting:** set `EMAIL_TRANSPORT=godaddy` in both Preview and
Publish secrets. External SMTP ports are not routable from this platform. The
app uses GoDaddy's built-in loopback email gateway, without SMTP credentials or
third-party API keys. Production defaults to this transport. See the official
[GoDaddy email contract](https://github.com/godaddy/nodejs-hosting-agent-skill/blob/main/skills/godaddy-nodejs-hosting/email.md).

The gateway uses this app's original platform sender,
`sxqc7mdcy1@airoapp.ai`, as a hardcoded From address. This address delivered a
confirmation before custom-domain attachment. Pinning it tests the possibility
that GoDaddy's automatic sender change affected delivery; this is not a proven
delivery fix until a new confirmation reaches the inbox. Replies go to
`info@kemsorstudio.com`. The website domain remains independent. GoDaddy's email
contract permits the app's local-part on its platform default domain. User form
fields never set or override the sender. A future branded From address requires
verified sender-domain authentication.

**Local SMTP or other hosts that permit it:** set `EMAIL_TRANSPORT=smtp`,
`SMTP_ENABLED=true`, `SMTP_HOST`, `SMTP_PORT` (465 or 587), `SMTP_USER` and
`SMTP_PASSWORD`. Port 465 uses TLS and 587 requires STARTTLS. These settings are
ignored by the GoDaddy gateway transport. `EMAIL_ENABLED=false` pauses delivery
and preserves queued receipts for either transport. Credentials stay private.

Run migrations before restarting an existing backend. For the local restricted
runtime account use `USE_MIGRATION_CREDENTIALS=true npm run setup`.

Delivery status is in `cms_email_outbox`: pending, sending, sent or failed. Sent
means accepted by the email service, not guaranteed inbox delivery. An interrupted
request after acceptance can be retried, so rare duplicate receipts are possible.

The admin and public website share MySQL data. Publishing exposes approved
entries through `/api/site`; the frontend refreshes every 30 seconds while
visible. Forms appear in the admin inbox. Deploying static files alone does not
connect the CMS. Serve website and API on the Node app as described below.

### Serve the website and CMS from the Node app

The repository root `npm run build` installs frontend build dependencies and
builds `rain-temp/dist`. When that build exists, the Node server serves the
website at `/` and the CMS/API at their existing paths on the same origin.
Backend-only installations without a frontend build retain the CMS status page.
GoDaddy should use the root build command `npm run build` and start command
`npm start`. Check the preview homepage, `/api/site`, `/health` and `/admin/login`
before publishing. To replace the separate Apache site, assign
`app.kemsorstudio.com` to this Node app through its Domains settings; preserve the
existing Apache deployment as a rollback until the domain and HTTPS are verified.


### Diagnose hosted email delivery

Open **Admin → Email delivery** (`/admin/email`) in the same Preview or Publish
environment as the submitted form. The page shows the email transport configuration,
recent receipt references, attempt counts and safe failure reasons. **Check
connection without sending** tests SMTP authentication or GoDaddy gateway reachability without sending a message;
it requires admin access and CSRF. Failed confirmations can be explicitly retried
after correcting secrets. Successful SMTP acceptance does not prove inbox delivery.

Migration 010 adds `last_error`; runtime logs include safe SMTP or gateway error codes. Raw provider responses,
message content and passwords are never included. Old failed attempts may lack a
reason until another attempt or connection check. Startup performs the same
non-sending connection check. Configure both Preview and Publish secrets separately.


Migration 011 preserves the email service message ID for accepted confirmations.
Admin → Email delivery shows that ID, the stored recipient and UTC acceptance
time. The worker logs only the receipt reference and service ID (no recipient or
message body). GoDaddy can use its gateway ID to correlate delivery logs. Older
accepted confirmations have no saved ID; their missing IDs cannot be recovered
from the app database. An accepted confirmation is not automatically resent.

### Test the relay settings supplied by GoDaddy support

GoDaddy support article 953 describes a cPanel relay at `localhost:25` with SMTP
authentication and SSL/TLS disabled. The separate opt-in `EMAIL_TRANSPORT=relay`
mode applies exactly these settings and sends from `info@kemsorstudio.com`. It
does not use mailbox credentials and permits unencrypted SMTP only on loopback.
See https://www.godaddy.com/en-in/help/send-form-mail-using-an-smtp-relay-server-953.

Test this in Preview first, using Admin → Email delivery → Test support relay
without sending. This separate check keeps the active delivery service unchanged.
If it succeeds, set EMAIL_TRANSPORT=relay in Preview to test a real confirmation. A successful connection does not establish sender acceptance or
inbox delivery; submit one confirmation to verify both. The Node app's localhost
may not expose the cPanel relay; if it refuses or times out, report that exact
result to support. `EMAIL_TRANSPORT=godaddy` restores the working platform sender.
Only select relay in Publish after the hosted Preview delivery test succeeds.
