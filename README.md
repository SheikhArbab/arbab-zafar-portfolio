# Arbab Zafar · Developer Portfolio

A 3D, hacker-inspired portfolio with a full CMS. Everything you see on the site (profile, experience, projects, skills, education, CVs, section copy, SEO, theme) is edited from **`/admin`**, never in code.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · React Three Fiber / Drei · Framer Motion · React Router · Supabase (Postgres, Auth, Storage, RLS) · Netlify (hosting + functions)

---

## Contents

1. [How it works](#1-how-it-works)
2. [Folder structure](#2-folder-structure)
3. [Local setup](#3-local-setup)
4. [Supabase setup (production)](#4-supabase-setup-production)
5. [Create your admin account](#5-create-your-admin-account)
6. [Environment variables](#6-environment-variables)
7. [Deploy to Netlify](#7-deploy-to-netlify)
8. [Using the admin](#8-using-the-admin)
9. [SEO](#9-seo)
10. [Security model](#10-security-model)
11. [Performance notes](#11-performance-notes)
12. [What still needs your input](#12-what-still-needs-your-input)

---

## 1. How it works

```
             build time (Netlify)                           runtime (browser)
 ┌──────────────────────────────────────┐     ┌─────────────────────────────────────┐
 │ vite build → client bundle           │     │ Prerendered HTML paints instantly    │
 │ vite build --ssr → render function   │     │ React hydrates it                    │
 │ prerender.ts → fetch published data  │     │ Background refetch from Supabase     │
 │   writes / , /projects/<slug>,       │     │ (admin edits show up immediately)    │
 │   sitemap.xml, robots.txt, spa.html  │     │ 3D scene lazy-loads when idle        │
 └──────────────────────────────────────┘     └─────────────────────────────────────┘
                                                   │                 │
                     /admin (lazy chunk) ──── Supabase Auth ── RLS ──┘
                     /api/contact  ─── Netlify Function (service key, rate limit) ──→ contact_messages
                     /api/rebuild  ─── Netlify Function (admin-verified) ──→ Netlify build hook
```

- **Public pages are prerendered**, so search engines and social previews get real HTML, unique titles, meta descriptions, Open Graph tags, canonical URLs and JSON-LD per page.
- **Content is live.** Visitors' browsers also refetch from Supabase, so edits appear without a rebuild. Click **Publish SEO build** in the admin to refresh the prerendered HTML and sitemap.
- **The admin is a separate code-split chunk** that ordinary visitors never download.

## 2. Folder structure

```
├── netlify/functions/
│   ├── contact.ts          # contact form API: validation, honeypot, timing, rate limit, optional Turnstile + email
│   ├── rebuild.ts          # admin-only “Publish SEO build” → Netlify build hook
│   ├── notify-test.ts      # admin-only “Send test email”
│   ├── _mail.ts            # Gmail / SMTP / Resend delivery
│   └── _shared.ts
├── public/                 # favicon.svg, og-default.png
├── scripts/
│   ├── prerender.ts        # build-time SSR → static HTML, sitemap.xml, robots.txt
│   └── generate-seed.ts    # regenerates supabase/seed.sql from src/content/defaults.ts
├── supabase/
│   ├── config.toml         # local Supabase CLI config (signups disabled)
│   ├── migrations/         # 0001 schema · 0002 security/RLS · 0003 storage · 0004 case studies/notifications
│   └── seed.sql            # initial content (generated)
├── src/
│   ├── admin/              # dashboard (lazy-loaded)
│   │   ├── components/     # CollectionManager (generic CRUD), SingletonEditor, FormFields, SortableList…
│   │   ├── lib/            # auth, storage uploads, unsaved-changes guard
│   │   └── pages/          # Overview, Profile, Content, Experience, Projects, Skills, Education, Documents, Messages, SEO, Settings
│   ├── components/
│   │   ├── site/           # Navbar, Footer, Terminal, ProjectCard, Reveal, SectionHeading…
│   │   ├── three/          # HeroScene (R3F), HeroVisual (lazy + device detection), HeroFallback (SVG)
│   │   └── ui/             # Button, Field, Dialog, Tag, BrandIcons…
│   ├── content/defaults.ts # fallback content & seed source (NOT where you edit content)
│   ├── data/               # public data fetching + context
│   ├── pages/              # Home, ProjectPage (case study), Playground, NotFound, Maintenance
│   ├── playground/         # KeystrokeSprint, BugHunt, StackMatch (lazy chunks)
│   ├── sections/           # Hero, About, Experience, Skills, Projects, Education, German, Contact
│   ├── seo/                # head tags + JSON-LD (shared by prerender & client)
│   ├── entry-server.tsx    # SSR entry used by prerender
│   └── main.tsx            # client entry (hydrates prerendered pages)
├── netlify.toml            # build, headers (CSP, HSTS…), SPA fallback
└── .env.example
```

## 3. Local setup

Requirements: **Node ≥ 22.18**, and optionally **Docker** if you want a local Supabase.

```bash
npm install
cp .env.example .env        # fill in values (see §6)
npm run dev                 # http://localhost:5173  (admin at /admin)
```

Without Supabase variables, the site still runs on the bundled default content; the admin shows a "not configured" screen.

**Local Supabase (optional):**

```bash
npx supabase start          # starts Postgres/Auth/Storage, applies migrations + seed
npx supabase status         # prints API URL, anon key and service_role key for .env
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | typecheck → client build → SSR build → prerender (this is what Netlify runs) |
| `npm run preview` | serve `dist/` locally |
| `npm run typecheck` | app + functions typecheck |
| `npm run seed:generate` | rebuild `supabase/seed.sql` from `src/content/defaults.ts` |

To try the contact form locally, use `npx netlify dev`, which runs the functions alongside Vite.

## 4. Supabase setup (production)

1. Create a project at [supabase.com](https://supabase.com) (the free tier is fine).
2. Open **SQL Editor** and run these files **in order** (paste each one, then Run):
   1. `supabase/migrations/20261125000001_schema.sql`
   2. `supabase/migrations/20261125000002_security.sql`
   3. `supabase/migrations/20261125000003_storage.sql`
   4. `supabase/migrations/20261125000004_case_studies_playground_notifications.sql`
   5. `supabase/seed.sql`: your initial content (safe to re-run; it never overwrites edits)

   *Alternatively, with the CLI:* `npx supabase link --project-ref <ref>` then `npx supabase db push` and run `seed.sql` in the SQL editor.
3. **Storage:** the storage migration creates two buckets, `media` (images, 5 MB max) and `documents` (PDFs, 10 MB max). Both are public-read by URL, not listable, and admin-write only. Nothing to click.
4. **Auth → Providers → Email:** keep Email enabled, and **turn OFF "Allow new users to sign up"**. Your admin account is the only account.
5. **Auth → URL Configuration:** set **Site URL** to your domain (e.g. `https://arbab-zafar.netlify.app`) and add `https://arbab-zafar.netlify.app/admin/login` to **Redirect URLs** (needed for password-reset emails).
6. **Project Settings → API:** copy the **Project URL**, the **anon public** key, and the **service_role** key (secret) for §6.

## 5. Create your admin account

Logging in requires **both** a Supabase Auth user **and** a row in `admin_users`. Knowing the `/admin` URL is not enough.

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**. Enter your email and a strong password, and tick **Auto Confirm User**.
2. **SQL Editor** → run (with your email):

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

3. Visit `/admin` and sign in. If you sign in without step 2, you'll see "Access denied". That's the authorization layer working.

To revoke access: `delete from public.admin_users where user_id = '…';`

## 6. Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | build + browser | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | build + browser | public anon key (safe; protected by RLS) |
| `SUPABASE_URL` | functions | same URL, for server code |
| `SUPABASE_SERVICE_ROLE_KEY` | functions **only** | inserts contact messages, verifies admins. **Never prefix with `VITE_`.** |
| `IP_HASH_SALT` | functions | random string; IPs are stored only as salted hashes |
| `NETLIFY_BUILD_HOOK_URL` | functions | enables the **Publish SEO build** button |
| `SITE_URL` | build | canonical URL for sitemap/canonical tags |
| `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | optional | Cloudflare Turnstile anti-spam on the contact form |
| `GMAIL_USER` + `GMAIL_APP_PASSWORD` | functions | **emails every contact message to you** via Gmail (see §8a) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | optional | use any other SMTP server instead of Gmail |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | optional | or send notifications through Resend |
| `CONTACT_NOTIFY_EMAIL` | optional | fallback recipient (normally set in Admin → Messages) |

Only `VITE_*` variables reach the browser bundle. All secrets stay server-side in Netlify Functions.

## 7. Deploy to Netlify

1. Push this folder to a GitHub repository.
2. Netlify → **Add new site → Import from Git** → pick the repo. Settings are read from `netlify.toml` (build command `npm run build`, publish `dist`, functions `netlify/functions`).
   *To keep an existing URL*, connect the repository to that **existing** site instead: Site configuration → Build & deploy → Link repository.
3. **Site configuration → Environment variables:** add everything from §6.
4. **Build & deploy → Build hooks → Add build hook** (e.g. "Admin publish"), copy the URL into `NETLIFY_BUILD_HOOK_URL`, and redeploy.
5. **Custom domain (optional):** Domain management → Add a domain → follow the DNS instructions (Netlify DNS, or a CNAME to `<site>.netlify.app`). HTTPS is automatic. Then update `SITE_URL`, **Admin → SEO → Site URL**, and the Supabase Auth Site URL / Redirect URLs.
6. Submit `https://<your-domain>/sitemap.xml` in Google Search Console.

## 8. Using the admin

Sign in at **`/admin`** (there's also a discreet `~/admin` link in the footer). Every page has validation, toasts, loading/empty states, and confirmation before deleting. Unsaved changes trigger a warning before you navigate away.

| Task | Where |
| --- | --- |
| **Add/edit projects** | **Projects → New project**. Fill in title (slug auto-generates), descriptions, thumbnail, tech tags, live/repo links, dates, key features, challenges/solutions and SEO fields. After the first save the **Gallery** panel appears: add multiple images, set alt text, and drag to reorder. ⭐ = featured on the homepage (first 5 by order), 👁 = published, drag handle = order. Each project gets an SEO page at `/projects/<slug>`. |
| **Update experience** | **Experience**: create/edit roles with dates (or "currently work here"), employment type, description, responsibilities, technologies, optional achievements and logo. Drag to reorder; the top entry shows first. |
| **Update skills** | **Skills**: manage **Categories** (order = panel order), then **Skills**: category, optional proficiency (*Hidden* by default, or Beginner/Intermediate/Advanced/custom label, never percentages), icon (upload, or a [simpleicons.org](https://simpleicons.org) slug like `react`), featured ⭐, visibility. |
| **Upload English & German CV** | **CV & documents**: *Upload PDF* on the **English CV** or **German CV** card (drag & drop works). *Replace* swaps the file and deletes the old one; *Remove* deletes it. With both uploaded, visitors get a **Download CV ▾** menu with EN/DE. |
| Hero, about, socials, availability, German badge | **Profile** |
| Section headings, button labels, footer | **Website content** |
| Education & certifications | **Education** (the section stays hidden until an entry exists) |
| Contact messages | **Messages**: search, filter (inbox/unread/archived), read/unread, archive, delete, one-click reply. **Email notifications** (top of the page) sets where every new message is emailed, with a *Send test email* button |
| Case studies | Each project is a case study page (`/projects/<slug>`) with *Overview, My role, The challenge, The solution, Key features, Outcome & learnings* and a gallery. Only filled-in sections are shown |
| Where live/code links appear | **Site settings → Projects**: only inside case studies (default; cards show *Read case study*), also on cards, or hidden |
| Playground (mini games) | **Site settings → Sections → Playground** shows or hides `/playground` and the homepage teaser |
| Title, description, keywords, OG image, favicon, robots | **SEO**, then **Overview → Publish SEO build** |
| Accent colours, animation level, 3D on/off, section visibility, maintenance mode | **Site settings** |

**When do changes appear?** Immediately for visitors, because the browser refetches. Search engines see them after **Publish SEO build** (about 1–2 minutes). If you skip it, the next deploy picks the changes up anyway.

### 8a. Get contact messages in your Gmail

Every message is always saved in **Admin → Messages**. To *also* get an email for each one (with **Reply-To** set to the sender, so you can answer straight from Gmail):

1. Turn on 2-Step Verification for your Google account, then create an **App password**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). You get a 16-character code.
2. In Netlify → Environment variables, add `GMAIL_USER` = your Gmail address and `GMAIL_APP_PASSWORD` = that code, then redeploy.
3. In **Admin → Messages → Email notifications**, check the recipient (pre-set to `arbabzafar4444@gmail.com`) and click **Send test email**.

### 8b. Playground

`/playground` has three small original games, each a separate code-split chunk loaded only when opened. Best scores are kept in each visitor's own browser.

- **Keystroke Sprint:** a 30-second typing race on real developer one-liners. Measures WPM and accuracy, and blocks paste.
- **Bug Hunt:** squash bugs as they surface, without hitting the working features. Combos multiply your score.
- **Stack Match:** a memory card game built from the skills in your admin.

The hero terminal also understands `play typing`, `play bugs` and `play memory`.

## 9. SEO

- Prerendered HTML for `/`, `/playground` and every `/projects/<slug>`, each with a unique `<title>`, meta description, canonical URL, Open Graph and Twitter cards.
- JSON-LD: `WebSite`, `ProfilePage`, `Person` (job title, employer, skills, `sameAs` social links), an `ItemList` of projects, plus `CreativeWork` and `BreadcrumbList` on project pages.
- `sitemap.xml` and `robots.txt` are generated from published content at build time (`/admin` and `/api/` are disallowed).
- Semantic sections with a correct heading hierarchy (one `h1` per page), descriptive alt text, skip link, `lang` attributes.
- **Why prerendering?** A plain Vite SPA ships an empty `<div id="root">`. Google can render JavaScript, but slower, and social crawlers (LinkedIn, X, WhatsApp) can't render it at all. Build-time prerendering solves both while keeping hosting static. One limitation: a project added after the last build still works (it's served by the SPA shell), but it only gets its own prerendered HTML and sitemap entry after the next **Publish SEO build**.

## 10. Security model

- **Authentication:** Supabase Auth (email + password, password reset). Signups are disabled.
- **Authorization lives in the database.** `public.is_admin()` checks `admin_users`, and every write policy uses it. Hiding buttons is not the security boundary; RLS is. The anon role has `INSERT/UPDATE/DELETE` revoked outright.
- **Public reads are limited to published content:** visible experiences/skills/education, published projects and their images, visible documents.
- **Contact messages** have no public policy at all. The Netlify function inserts them with the service-role key after it has:
  - checked the origin, content type and body size;
  - validated the input server-side;
  - applied the honeypot field and a minimum fill time;
  - run a link-spam check;
  - rate-limited per salted IP hash (3 per 10 min, 10 per 24 h);
  - verified the optional Turnstile challenge.
- **Storage:** admin-only uploads; size and MIME limits are enforced by the buckets.
- **XSS:** user content is always rendered as text (no `dangerouslySetInnerHTML`), and links pass through a scheme allow-list (`https`, `mailto`, `tel`).
- **Headers:** CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy and a Permissions-Policy (`netlify.toml`). `/admin` is `noindex`.
- The admin "Publish" endpoint verifies the Supabase session **and** the `admin_users` row before calling the build hook.

## 11. Performance notes

- The 3D scene is code-split and loads only after the page is idle, and only on capable devices. Mobile devices get a lighter scene or a static SVG fallback. It also falls back when *reduce motion* is on, when **Settings → Animation** isn't *Full*, or when *Data Saver* is on. Rendering pauses when the hero is off-screen or the tab is hidden.
- The public bundle uses a ~1 KB REST reader instead of supabase-js, and animation features load asynchronously (`LazyMotion`).
- Images are lazy-loaded with `decoding="async"`. Hashed assets are cached for a year.
- Prerendered content paints before any JavaScript runs.

## 12. What still needs your input

- [ ] **Public email**: set to `arbabzafar4444@gmail.com` (shown as the Email contact link). Change or clear it in Admin → Profile.
- [ ] **Profile photo** (optional): Admin → Profile.
- [ ] **CV PDFs (EN + DE)**: Admin → CV & documents.
- [ ] **Experience dates, responsibilities and achievements**: dates are empty on purpose rather than guessed.
- [ ] **Education / certifications**: none were published before, so the section stays hidden until you add one.
- [ ] **Sukna Capital Fintech App**: added as a featured project with only its name and category. Add your role, the stack, key features, screenshots (the generated "SC_" cover shows until you upload a thumbnail), and a link if it's public. If it's under NDA, describe it without confidential details.
- [ ] **Projects from LinkedIn**: LinkedIn blocks automated access, so these couldn't be imported. Either add them in Admin → Projects, or export your data (LinkedIn → Settings → Data privacy → *Get a copy of your data* → Posts) and share the `Shares.csv` so the entries can be drafted from your own post text.
- [ ] **Projects:** the case studies were written only from evidence in your public repos and live sites. Review the wording and add *My role*, *Challenge/Solution* and *Outcome* where you can. Key findings from that research:
  - **Security, urgent:** `mern-blog-server` has a committed `.env` with your MongoDB URI and JWT secret. Rotate both credentials, delete the file and purge it from the git history (or make the repo private).
  - **TechFlow:** the public `tech-flow` repo contains West Monroe's website text and hotlinked images. It isn't linked from the portfolio; consider making it private. The live site (a separate Next.js build) is what's showcased.
  - **MERN Blog:** the live API (Vercel) returns HTTP 500, so the live link was left out. Fix the API, then re-add the link in Admin.
  - **S.A.J Holding:** the live site still shows a drafting note ("Make sure to tailor the content further…") and placeholder team names/photos.
  - **Tutorial-based work** (3D Portfolio, Hoo Bank, MERN Blog) is listed as *Learning Project* with honest credit and is not featured. Featured work is your client and professional work.
  - **MERN Estate** is unfinished, so it's unpublished. Publish it from Admin when it's ready.
  - Your old 3D portfolio lists a role, *MERN Developer, Super Tech Institution, Mar 2023–Jan 2024*. It isn't added because your brief says all roles were at CyberSoft Vantage. Add it in Admin → Experience if it's accurate.
- [ ] **German level**: currently A2 → goal B2; adjust in Profile.
- [ ] **WhatsApp link**: present but hidden; add your number and toggle it on if you want it.
- [ ] **Gmail notifications**: add `GMAIL_USER` + `GMAIL_APP_PASSWORD` in Netlify (§8a), then use *Send test email*.
- [ ] Optional: Turnstile keys for stronger spam protection.
