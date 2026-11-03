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

Privileged MFA is now implemented; see the Phase 1 feature completion notes below. Production HTTPS, secure cookies, approved reverse-proxy configuration, staging/UAT separation, malware controls where agreed, legal review, automated retention/backup and launch approval remain deployment requirements. No production deployment was performed.

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

## Phase 1 feature completion — 31 October 2026

The CMS now supports production announcements (`upcoming`, `in_development`, `coming_soon`, `released`) and approved press resources with resource URLs and usage permissions. New records begin as drafts; publish only studio-approved material. The website displays these on Productions and Press & Media, and shows homepage production/news highlights only when published records exist. Newsroom is separate from Press & Media. Leadership and legal publishing use the existing CMS areas; no biographies, project claims or policies were invented.

Enquiries include the full follow-up stages, priority, tags, source, UTC follow-up time, status/assignment history, staff-only filtered CSV export and separate creative, brand, distribution, financing, international and partner-registration categories. Career applications accept an optional HTTPS portfolio URL. Copyright enquiries require an evidence URL.

All CMS staff now complete authenticator MFA before receiving an authenticated session. First sign-in enrolls an authenticator with a manual setup key and returns eight one-use recovery codes. TOTP secrets are authenticated/encrypted using a key derived from `SESSION_SECRET`; preserve that secret securely across releases. Used authenticator time steps are rejected. Existing password-only sessions must sign in again. Keep recovery codes privately: they are displayed only during enrollment. This change requires no external email or authenticator service.

Apply database migrations before starting the updated backend:

```sh
cd backend
node --env-file=.env src/migrate.js --use-migration-credentials
```

Use the configured migration account, separate from the restricted application account. This command applies pending migrations without creating sample content. Migrations 013–015 add the workflow/content fields, MFA storage and submission-terms records. Local development migrations were applied; production migrations/deployment are separate.

Script uploads default to disabled until an administrator publishes approved terms and a version in Site settings. The upload requires affirmative acceptance and records the terms version and time. Manual production planning remains available. Approved legal content must be supplied by Kemsor/legal counsel.

Validation: frontend production build and 60 backend tests, including isolated-database publishing privacy, MFA enrollment/replay/recovery, workflow history, export authorization and submission gating. The four deferred workstreams (SEO/analytics, launch-evidence review, operations/handover and weekly reporting) remain outside this change.

CMS images are automatically oriented, resized to fit 2400 × 2400 without upscaling and compressed to WebP using Sharp; metadata is stripped. Uploads show measured transfer progress followed by a processing state. CMS and public page navigation show delayed loading indicators.

Reports & downloads provides role-restricted enquiry, career application, publishing and admin activity reports with UTC date, status, category and search filters. CSV exports include all matching rows up to 50,000; larger results require narrower filters. Downloads are audited and spreadsheet formula cells are escaped. These are operational CMS reports, separate from the deferred weekly KPI reporting.

Professional onboarding: `/join/?type=professional` is separate from artist registration at `/join/`. The shared department/role catalogue in `shared/professional-roles.json` drives both the dependent dropdowns and server validation. Migration 016 adds department and specialty fields. Members land in their private profile and professionals can browse the reviewed artist directory; studio approval and contact checks still gate shortlisting/enquiries. Registration reviews and the admin dashboard include professional roles. Live directory filters come only from approved, visible artists.

Registration validation covers artist onboarding and each of the 42 professional roles, including profile persistence, sign-in, CMS reviews, consent, duplicate emails, invalid department/role pairs, CSRF, per-IP limits and publication privacy. Professional profiles cannot clear an existing department/role classification. These checks run against isolated temporary databases.

## Housekeeping, retention and encrypted backups

Apply migration `017_operations.sql` before running this release. The server's
operations worker checks every minute, removes expired sessions/rate limits hourly
and retries queued private-file deletions. MySQL advisory locking prevents two
application instances or CLI jobs running operations concurrently. Job outcomes
are recorded in `cms_operations_runs` without personal details or credentials.
**Admin → Operations & backups** shows recent results, configuration and retention
preview counts. Administrators can place/release holds from enquiry/application
records. Career applications now also support administrator-only deletion.

### Retention activation

No personal-data retention period is assumed. Default `RETENTION_ENABLED=false`
and zero periods disable automated deletion. Ask KEMSOR's legal/privacy owner for
approved periods, the starting event, exceptions and a policy version. The current
rule uses **time since the record's last update**, not its original submission
date. Only closed/rejected/spam enquiries and rejected career applications qualify.
If another starting event is approved, change the rule before enabling it.
Member accounts, production projects and active enquiries/applications are excluded.

Set `RETENTION_ENQUIRY_DAYS`, `RETENTION_APPLICATION_DAYS` and
`RETENTION_POLICY_VERSION` in protected environment settings. Preview first:

```sh
cd /path/to/kemsor/backend
npm run operations -- retention
# Only after policy approval and reviewing the preview:
npm run operations -- retention --apply
```

`--apply` also requires `RETENTION_ENABLED=true`. The scheduled worker deletes up
to 100 eligible records per resource each hour when enabled; previews alone never
delete personal data. A hold blocks both automatic and manual deletion. Enquiry
notes/history and application notes/history cascade with deletion; related receipt
payloads and enquiry notifications are removed. Actively sending confirmation
receipts defer deletion until delivery finishes. File removals enter a durable
queue in the deletion transaction and are retried after commit, so a disk error
does not silently discard the deletion request. Exports already downloaded by
staff and third-party systems require separate handling.

`cms_data_deletions` retains resource IDs, original timestamps and policy references
without names/contact details. Preserve the latest ledger during recovery and
reconcile it before reactivating a restored application, so older backups do not
resurrect completed erasures. Backups expire on their own retention schedule;
deleting a live record cannot immediately remove it from an encrypted snapshot.

### Backup setup

Backups are **disabled by default**. Before enabling them, configure:

- `BACKUP_ENCRYPTION_KEY`: a new base64-encoded 32-byte key, generated using
  `openssl rand -base64 32`. Store it separately in KEMSOR's secure password/key
  store, with restricted recovery access. Losing this key prevents recovery.
- `BACKUP_DIR`: durable private storage outside all public directories. Default:
  `backend/storage/backups`. Ephemeral hosting disks are not a durable backup.
- `MYSQLDUMP_BIN`, `MYSQL_BIN`, `TAR_BIN`: installed executable paths. The app
  fails the job visibly if these tools are unavailable. Use an external scheduled
  runner with database/network access if the hosting platform lacks these tools
  or does not keep the Node process running.
- Optionally `DB_BACKUP_USER` / `DB_BACKUP_PASSWORD`: a dedicated account with
  the privileges needed to dump all application tables; otherwise runtime DB
  credentials are used. Recovery drills need the migration account to create/drop
  a **new disposable database**, not write access to the running database.
- `BACKUP_RETENTION_DAYS`: at least 30 (default 30). Daily database snapshots and
  weekly application/content snapshots are independently retained.
- `BACKUP_REMOTE_HOST`, `BACKUP_REMOTE_PORT`, `BACKUP_REMOTE_DIR` and
  `BACKUP_SSH_KEY`: KEMSOR-controlled storage on a **separate** host/account.
  Use a restricted SSH key, pre-verify/pin the host in `known_hosts` and give the
  destination directory private permissions. No destination is configured yet.

Archives use authenticated AES-256-GCM encryption; the internal database dump has
an additional SHA-256 checksum. Temporary dump credentials are kept in a private
0600 options file, not command arguments. `.env` files, local admin credentials,
exports, logs and dependency directories are excluded. The weekly archive
contains the database, runtime frontend build, backend source/views/schema,
frontend source/assets and private uploads/résumés. Keep the Git repository as the
complete source/configuration handover. Preserve `SESSION_SECRET`, database
credentials and other hosting secrets separately; they are not in these archives.

Run initial checks manually:

```sh
npm run operations -- backup database
npm run operations -- backup application
npm run operations -- status
npm run operations -- drill /private/backups/kemsor-database-EXAMPLE.ksb
```

Only then set `BACKUP_ENABLED=true`. The worker takes a database snapshot every
24 hours and an application/content snapshot every seven days. A configured
remote copy is checksum-verified before success and pruning; upload failure
records a failed job, keeps the local archive and preserves older backups. Without
a remote destination, results explicitly show `offsite:false`: a local snapshot
alone does not satisfy the separate-copy requirement. Retention pruning occurs
only after a successful new backup of the same kind, never below 30 days.

For a platform that sleeps, use its external scheduler instead of relying on
in-process timers. Example cron commands (replace paths; restrict log access):

```cron
0 * * * * cd /path/to/kemsor/backend && npm run operations -- housekeeping
15 * * * * cd /path/to/kemsor/backend && npm run operations -- retention --apply
0 2 * * * cd /path/to/kemsor/backend && npm run operations -- backup database
0 3 * * 0 cd /path/to/kemsor/backend && npm run operations -- backup application
```

Install the retention apply schedule only after approval/activation. Retention
preview and backups are CLI owner operations; no public restore/download endpoint
or browser button can trigger a production database overwrite.

### Recovery procedure and drills

`operations recover ARCHIVE NEW_DIRECTORY` authenticates/decrypts an archive,
rejects traversal paths and links, extracts to a **new** directory and validates the
SQL checksum. It never imports into or overwrites the running application.

`operations drill ARCHIVE` automates decryption, imports SQL into a newly created
`kemsor_restore_<timestamp>` database, checks table inventory, reapplies the current
source deletion ledger and removes the disposable database and temporary files.
For application archives, queued erasures are also applied to the isolated
recovered files. An archive with an incorrect key or integrity failure is rejected.
Only drill trusted KEMSOR-generated archives. Record the successful drill outcome;
repeat at the agreed maintenance interval (at least six-monthly where applicable).

Actual incident recovery requires an approved maintenance window:

1. Pause application writes, mail delivery, retention and other workers. Preserve
   the latest data and erasure ledger before replacing anything.
2. Retrieve a verified encrypted archive from separate storage and recover into a
   new private directory. Use a new database and a restricted migration account.
3. Import the recovered SQL into that new database; restore the matching runtime
   files and private uploads. Apply any required later migrations.
4. Reconcile **the latest** deletion ledger against the staged database and its
   private files using `reconcileDeletions` and `processFileDeletions` from
   `src/retention.js`. If the source database is unavailable, obtain that ledger
   from the latest safe snapshot and reconcile known later erasure requests with
   KEMSOR before reopening. Do not enable sending while reviewing the restored
   email queue: a snapshot may contain messages already sent after it was taken.
5. Restore hosting secrets separately, especially `SESSION_SECRET` for encrypted
   MFA data. Verify health, public pages, sign-in, CMS records, uploads and forms
   before switching the application to the recovered database/build.
6. Record acceptance, resume workers and verify the next backup/off-site copy.

These tools provide recovery capability; production backup schedules, storage
access, failure-alert routing and the first hosted recovery drill still require
hosting configuration. Do not claim the backup SLA or RPO is operating until
successful scheduled and off-site results have been verified.

## Admin-managed legal documents and homepage hero slides

Migration `018_managed_content.sql` adds dedicated draft/published records and
revision snapshots. Setup/migrate imports the exact supplied Privacy Policy, the
five existing hero videos and existing CMS legal notices without overwriting
previously imported records or subsequent edits. Original frontend content remains
a fallback when the CMS is unavailable. A successful feed containing an empty
slide/document list is respected: unpublished content is not revived by fallbacks.

Administrator-only controls:

- `/admin/manage/legal`: document title, content, numbered sections, dates,
  version, closing/contact details, footer label/visibility/order.
- `/admin/manage/hero`: direct MP4 URL, poster/image-library selection, order,
  duration/start time and optional heading/description/eyebrow/primary-action
  overrides. Blank overrides preserve the existing shared hero copy.

Save draft keeps the live version unchanged. Publish copies the draft into the
public snapshot. Unpublish hides it without deleting content/history. Saved-draft
previews are authenticated. Restoring a prior revision creates a new draft and
never automatically republishes. Revision checks reject stale editor submissions.
The existing image library handles posters; direct video URLs reference existing
local MP4s or approved HTTPS hosts. This release does not add video uploads.

Published documents appear at `/privacy-policy/` or `/legal/<slug>/`, in the Legal
Centre and sitemap, and optionally in the footer. The Node server renders each
custom legal document's SEO head and includes its URL in the XML sitemap. The
Vite development server resolves custom legal paths to the legal page shell.
New documents may be added only when approved text is available; no additional
legal policies are fabricated. Existing enquiry-consent and script-submission
settings remain available under Site settings.

Hero playback uses the ordered published API records, retains the current five
videos on import and preserves the reduced-motion/data-saver fallbacks. If every
slide is unpublished, a static original poster remains with no active video.
Externally hosted video/poster requests require external-media consent; same-origin
studio media continues to load normally. The preference version was incremented
because the category now covers external videos as well as Google Maps.

These controls are ready locally. Apply migrations, deploy frontend and backend
together and verify the public API before using them on production hosting.

## Report centre and dedicated report pages

`/admin/reports` is the report directory. Each permitted type has its own page,
date/search filters, applicable status/category filters, pagination (25/50/100 rows)
and `/download.csv` endpoint. Exports include all matching records up to 50,000,
remain role-restricted and audited, and escape spreadsheet formulas.

| Route under `/admin/reports/` | Access |
| --- | --- |
| `enquiries` | Administrator / enquiry manager |
| `applications` | Administrator / enquiry manager |
| `content` | Administrator / editor |
| `registrations` | Administrator |
| `talent` | Administrator |
| `projects` | Administrator |
| `activity` | Administrator |

Registration exports exclude password hashes. Production reports expose project
summary fields only, excluding private scripts and planning notes. Currency
summaries count projects; they do not combine budgets across currencies. Existing
`/admin/reports?type=...` and `/admin/reports/download.csv?type=...` bookmarks remain
supported. These operational reports do not activate analytics or paid KPI services.

## Content formatting editor

Blog, news, career and general CMS body fields, plus managed legal document
content, now have a visual formatting toolbar: paragraph/headings, bold, italic,
underline, ordered/unordered lists, quotes, links, clear formatting and undo/redo.
The editor also provides a preview toggle. Existing plain text and banner-image
workflows remain available; records are changed only when the form is saved.

The browser serialises the editor into a small structured document. The server
validates node types, link protocols, nesting and size; arbitrary HTML, scripts,
iframes and inline event handlers are not accepted. CMS entries keep their plain
body for compatibility and store formatting in `metadata.rich_text`. Managed legal
documents store `richText` alongside numbered sections and the existing draft/live
snapshots. Public React pages and authenticated previews render the same supported
formatting. Legal heading numbers retain their table-of-contents anchors.

Pasted content is inserted as plain text; apply desired formatting using the
controls. Images continue through the existing banner/image-library workflow.
There is no new third-party editor service or subscription. No migration is
required, but deploy the frontend and backend together to display formatting on
the public website. The ordinary textarea remains usable if JavaScript is disabled.

## Careers page content and open CV intake

The Careers page uses the supplied `KEMSOR Careers Page Content.docx.pdf` for the
introduction, reasons to join, seven teams, crew network, internships, hiring
process and recruitment notice. The document's Development Executive and Production
Coordinator listings are imported as **drafts** by migration 020. Review their
complete requirements in Admin → Career opportunities before publishing.
Sample/demo vacancies are excluded from the public list and cannot receive
applications. The fake-offer reporting email follows the supplied document exactly.

Published vacancies retain their existing application modal. The inline Apply Now
form supports general CV submissions and internship interest without requiring a
published vacancy, through `/api/careers/general/applications` and
`/api/careers/internship/applications`. These records have no vacancy foreign key;
they retain the requested role, team, application type, consent version and private
PDF CV. The existing recruitment inbox, history, exports, access controls and
retention rules cover them. Invalid teams, missing consent, invalid PDFs and
unavailable/sample roles are rejected; CSRF and per-IP limits remain in force.

## Newsroom and news alerts

The `/press-media/` Newsroom uses published news, productions and press assets.
The supplied document's placeholder stories, dates and company facts are not
published. Editors can choose a news category, mark a lead story and attach an
HTTPS PDF link. Published Press Releases require a PDF. Production stages include
pre-production; full media kits use the press-asset category `Media Kit`.

Migration 021 adds news-alert subscriptions. The form requires explicit consent
and selected topics, then queues a confirmation email through the existing mail
outbox. Confirmation expires after 48 hours. Confirmation and unsubscribe links
display a form; only a CSRF-protected POST changes preferences, protecting against
email link scanners. Existing confirmed topics remain until new ones are confirmed.
Verify production SMTP delivery and WEBSITE_URL before enabling public promotion.
Admins can review subscribers and export up to 1,000 confirmed addresses at
`/admin/newsletter`. This feature does not automatically send news campaigns.

## Upload media before saving content

Content image selectors and blog/news banners provide an independent Upload button,
progress bar and completed preview. Add an image description, select the file and
upload it; only then save/publish the content. Selected or in-progress files block
form submission. Failed uploads keep the rest of the form for retry. Successfully
uploaded images remain in the library even if the content form is abandoned.

Hero slides also support independent MP4 and poster uploads while retaining manual
URL entry. Images are optimized on the server; videos are stored without transcoding
and must be MP4 with browser-compatible codecs, up to 50 MB. Video uploads require
publishing access; hero editing remains restricted to administrators. The authenticated,
CSRF-protected `/admin/media/upload` endpoint returns the persisted asset reference;
video URLs support byte-range requests. Existing form-upload endpoints remain
available for non-JavaScript clients. No database migration is required.

## Format-page and production videos

Admin → Website pages → Feature Films, Series & OTT or Documentaries → Add/Edit
content includes an Optional video section. Page sections targeting Productions
also support video, as do individual Production entries. Upload the MP4 before
saving, select a poster in the existing Image field and add a video caption.
Published sections display a player with controls; draft videos remain excluded
from the public content feed. Asset URLs retain the existing public-media access
model, so uploaded footage must be approved for public use even before publishing.

Videos are optional and do not replace the existing page hero automatically.
Removing the video URL restores image-only content. Direct HTTPS MP4 links are
also supported; public playback of external media requires cookie consent.
The publisher role may upload videos (50 MB limit); hero slides remain admin-only.
No migration is required. Deploy the backend and frontend together.

## CMS / frontend coverage

See [CMS_FRONTEND_REVIEW.md](CMS_FRONTEND_REVIEW.md) for the module mapping,
verified connections, corrected controls and remaining fixed frontend content.
`shared/content-pages.json` is the common page-section target registry. Deploy it
with the backend and frontend. No database migration is needed for these fixes.

## Existing content, remaining video sections and campaigns

Migration 022 adds `cms_site_modules`, revision history and news campaign records.
Run migrations before starting the updated backend. Deploy `shared/` with both
applications; it holds the original copy catalogue, rendered image-slot registry,
navigation and video defaults.

Admin → **Existing page content** edits the supplied page copy and artwork, header
and footer navigation, website logo, homepage showreel and two page-video sections.
These modules support private drafts, explicit publication, stale-edit protection,
restoring previous drafts and reset to supplied defaults. The original page markup
and design are preserved. All published overrides arrive through `/api/site`.

Image/video/PDF/WebVTT uploads complete separately before saving the editor. PDF
resources support 10 MB and subtitles 1 MB. Use `en`, `hi` or another valid language
code for subtitle tracks. Video files are not transcoded; use browser-compatible
MP4 codecs. Media used by current content or revisions cannot be deleted.

Admin → **News campaigns** creates a draft linked to a published news post. Review
its preview and topic/recipient count, then explicitly queue delivery. Draft saves
and ordinary news publication do not send campaigns. The existing mail worker
checks consent/topics/campaign/story status before each delivery. Campaign
cancellation stops pending deliveries, not messages already accepted by a service.

The public content endpoint returns `nextCursor` when another batch exists. Fetch
`/api/site?cursor=…` until it becomes null; each batch has at most 300 records and
shares a stable snapshot boundary. The website handles this automatically.

Validation: `npm test`, frontend `npm run check:seo`, and `npm run check:browser`
(after building `rain-temp`). Browser checks require local Chrome and MySQL
migration credentials, create an isolated database and send no emails. See
[CMS_FRONTEND_REVIEW.md](CMS_FRONTEND_REVIEW.md) for evidence and client decisions.

The media library now lists all supported asset types and accounts for website revision references. Legacy generic legal-editor URLs delegate to the managed legal module; disconnected legacy writes are rejected.

## Flat admin themes

`admin-flat.css` is the active final theme layer. It replaces the earlier creative,
dark and sidebar gradient layers with neutral surfaces, fine borders and solid
purple actions. The sidebar retains its contrasting palette in each theme. Theme
preference, sidebar scroll restoration and publishing/upload behavior are unchanged.
Both themes, mobile layout and CMS workflows were checked in isolated Chrome.

## Leadership page

`/leadership/` uses the supplied Leadership PDF and Dev Raturi portrait. The
responsive WebP portrait assets retain the original photograph. Studio navigation,
the page registry and HTML/XML sitemap link to the dedicated page. In Admin →
Manage pages → Leadership (or Existing page content → Leadership · Dev Raturi),
edit the portrait, biography, quote, screen credits and honour. Drafts, publishing,
reset and revision restoration use the existing site-module workflow. No database
migration is required. Deploy the shared content JSON with the frontend/backend.
