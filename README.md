# Zavier Rodrigues — Portfolio & Poetry

A warm, editorial personal website for Zavier Rodrigues: software-engineering case studies, a focused poetry reading room, and a private owner studio for publishing both.

The product requirements live in [`PORTFOLIO_BUILD_BRIEF.md`](./PORTFOLIO_BUILD_BRIEF.md). Nothing in this repository deploys or configures a domain automatically.

## What is included

- Responsive home, projects, project case study, poetry collection, poem reader, and about pages
- Clearly marked sample project content isolated in `lib/content.ts`
- An intentional empty state when no poems have been published
- Private `/admin` writing studio with Markdown preview
- Draft, publish, update, unpublish, feature, and delete workflows
- Owner-scoped D1 persistence with server-side authorization
- Generated Drizzle migrations for poems, projects, and future site settings
- Metadata, social preview image, sitemap, robots rules, reduced-motion support, and accessible focus states

## Local setup

Requirements: Node.js 22.13 or newer and npm.

```bash
git clone git@github.com:ZavierRod/zavier-portfolio.git
cd zavier-portfolio
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). During local development, `/admin` remains directly available when production password secrets are absent. This fallback is disabled in production.

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm test
```

Generate a migration after changing `db/schema.ts`:

```bash
npm run db:generate
```

## Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical production origin, such as `https://example.com` |
| `ADMIN_OWNER_ID` | Stable owner key used by existing poems and projects |
| `ADMIN_PASSWORD_HASH` | Keyed HMAC password verifier stored as a hosted secret |
| `ADMIN_PASSWORD_PEPPER` | Independent secret key required to verify the admin password |
| `ADMIN_SESSION_SECRET` | Random HMAC secret used to sign secure admin sessions |

The production admin uses a keyed HMAC password verifier and a signed, HttpOnly, Secure, SameSite session cookie. The plaintext password is never stored in source or hosted configuration, and the verifier cannot be tested offline without its separate secret key. Failed attempts are rate-limited, and anonymous requests are rejected before content is read or changed.

## Architecture

```text
app/
  page.tsx                    Home
  projects/                   Published project collection and case studies
  poetry/                     Published poem collection and focused reader
  about/                      Personal and professional introduction
  admin/                      Auth-gated owner studio
  api/admin/content/          Owner-only content API
components/                   Shared public and admin interface components
db/
  schema.ts                   Drizzle schema
  repository.ts               Public visibility and owner-scoped persistence
drizzle/                      Generated SQL migrations
lib/
  content.ts                  Content types and isolated sample projects
  markdown.tsx                Safe Markdown subset; never renders raw HTML
  admin-auth.ts               Authentication + owner authorization
public/og.png                 Bespoke social sharing card
```

Public pages are server-rendered. They query only rows whose status is `published`. Admin endpoints first authenticate the request, then check the exact owner email, and every database write or delete is scoped to the authenticated owner ID.

The initialized Sites runtime supplies Cloudflare D1 and platform-managed authentication, which is the strong existing-repository reason for using D1/SIWC in place of the brief’s default Supabase/Vercel direction. The content model remains portable if the hosting choice changes before launch.

## Content workflow

1. Open `/admin`.
2. Create a poem or project.
3. Use **Write** and **Preview** to refine it.
4. Choose **Save draft** to keep it private or **Publish** to make it public.
5. To unpublish an item, open it and choose **Save draft**.
6. Deletion always asks for explicit confirmation.

Markdown intentionally supports a small safe subset: headings, lists, emphasis, strong text, inline code, paragraphs, and poetry line/stanza breaks. Raw HTML is displayed as text rather than executed.

## Before launch

See [`CONTENT_CHECKLIST.md`](./CONTENT_CHECKLIST.md). At minimum, replace the email placeholder, provide verified project stories and links, add a real portrait and resume, configure the production owner email, and remove or replace all sample project records.
