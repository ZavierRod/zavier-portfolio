# Zavier Rodrigues — Personal Portfolio and Poetry Website

## Instructions for Codex

Build a polished personal website for **Zavier Sean Rodrigues** that can be linked from his resume and LinkedIn. The website should present him as a software engineer while also providing a thoughtful home for his poetry.

Treat this document as the initial product and implementation brief. Before writing code, inspect the repository, preserve any useful existing work, and summarize the implementation plan. If an important product decision cannot be inferred from this brief, ask before making a difficult-to-reverse choice.

Do not deploy the site or purchase/configure a domain until explicitly asked. Do not put secrets in the repository.

## Product goals

The site should:

1. Present Zavier professionally to recruiters, hiring managers, collaborators, and tutoring clients.
2. Showcase a small number of substantial software projects through strong case studies.
3. Give his poetry a beautiful, calm, highly readable public home.
4. Give Zavier a secure private admin area where he can write, save, preview, publish, edit, unpublish, and delete poems without editing source code.
5. Support placeholder and draft content during development without exposing unfinished material publicly.
6. Feel personal and memorable without sacrificing clarity, speed, accessibility, or professionalism.

## Brand and visual direction

The desired style is **clean, minimalist, bright, warm, and happy**. It should feel optimistic and human—not like a generic dark developer portfolio.

- Use generous whitespace and an uncluttered layout.
- Prefer a warm off-white background over stark white.
- Use deep navy or charcoal for body text.
- Use optimistic sky blue as the main brand color.
- Use soft yellow and restrained coral as secondary accents.
- Use subtle shadows, gentle borders, rounded surfaces, and tasteful motion.
- Use a clean sans-serif typeface for portfolio/interface content and an elegant, highly readable serif for poetry.
- Avoid neon colors, terminal aesthetics, excessive gradients, walls of skill icons, busy animations, and generic stock imagery.
- Animations should be subtle, optional, and respect `prefers-reduced-motion`.

Starting palette (adjust if needed for accessibility and visual cohesion):

| Purpose | Color |
| --- | --- |
| Warm background | `#FFFDF7` |
| Main text | `#172033` |
| Sky blue | `#5B9EF4` |
| Soft yellow | `#FFD76A` |
| Coral | `#FF8D7B` |
| Pale blue surface | `#F2F7FF` |

The portfolio portion should feel energetic, capable, and forward-looking. The poetry portion should become quieter, more intimate, and spacious while remaining part of the same design system.

## Suggested homepage message

Use temporary copy until Zavier approves final wording. A possible direction is:

> Hi, I’m Zavier. I build thoughtful software and write about what it means to be human.

Primary actions:

- View my work
- Read my poetry

Do not treat this copy as final.

## Public site structure

### Home

- Short hero introduction
- Clear links to projects and poetry
- Selected/featured projects
- One featured or recent poem, if a poem is published and marked featured
- Compact professional summary
- Contact/social links

### Projects

- Responsive project collection
- Only published projects appear publicly
- Individual case-study pages should support:
  - Project name and concise summary
  - Problem or motivation
  - Zavier’s role and contributions
  - Technical approach and important engineering decisions
  - Technology used
  - Images/screenshots
  - Outcome or current status
  - GitHub and live-demo links when available

Likely initial projects include:

- **inSync** — an iOS music and fitness concept that adapts music to heart rate/cadence using SwiftUI, MusicKit, and Apple Health.
- **Blink Pay** — a remittance-focused monorepo using Next.js, NestJS, Expo, TypeScript, pnpm, and Turborepo.
- **Agora** — a political education/discovery application using Next.js, NestJS, and Expo.
- A Berkeley-focused landlord information platform may be added later.

All project descriptions, metrics, screenshots, links, and status claims are placeholders until Zavier verifies them. Never invent results, user counts, performance numbers, employers, or accomplishments.

### Poetry

- Public collection of published poems
- Individual poem pages optimized for focused reading
- Support title, slug, content, optional excerpt, written date, publication date, themes/tags, and featured status
- Preserve intentional stanza spacing and line breaks
- Provide tasteful previous/next navigation or a return-to-collection link
- Do not add social engagement features such as likes or comments in the MVP

### About

- Professional background
- Personal introduction and values
- Education: UC Berkeley, Computer Science and Economics
- Optional portrait
- Links to resume, GitHub, LinkedIn, and email
- Keep the tone personal and grounded, not corporate or overly long

### Resume

- A prominent link to view/download a resume once the real file is supplied
- Hide or clearly disable this public action until a genuine resume asset exists

### Contact

- Email and selected professional/social links
- Prefer a simple, reliable contact experience
- Avoid building a complex messaging system for the MVP

## Private admin experience

Create a protected `/admin` area intended for a single site owner. It should not appear in the public navigation.

### Poetry management

The admin must be able to:

- Create a poem
- Write in a pleasant Markdown editor or focused text editor
- Preview the rendered poem
- Save a draft
- Publish a poem
- Edit a published or draft poem
- Unpublish a poem without deleting it
- Delete a poem with an explicit confirmation step
- Edit title, slug, excerpt, written date, tags/themes, featured status, and publication date
- See draft/published status and last-updated time in a simple dashboard

### Project management

Projects should use the same draft/published/featured model. If full project editing would substantially delay the poetry MVP, implement a clean project data layer first and document project administration as the next phase.

### Site settings

Design the data model so biography text, social links, resume reference, and other basic settings can become editable later. A settings UI is optional for the first version.

## Content visibility rules

Content should support these states:

- `draft`: visible only to the authenticated admin
- `published`: visible publicly
- `featured`: a separate flag used to highlight selected published content

Requirements:

- Public queries and public routes must never return drafts.
- Empty sections should disappear gracefully instead of showing blank cards.
- Placeholder content may be used locally during development, but it must be clearly identifiable and easy to replace.
- Do not publish placeholder case studies, fake links, fake testimonials, fake statistics, or lorem ipsum.
- The site should still look intentional with only two completed projects and a small number of poems.

## Preferred technical direction

Use a modern, maintainable TypeScript stack unless the existing repository provides a strong reason not to:

- Next.js with the App Router
- TypeScript with strict type checking
- Tailwind CSS
- Supabase for Postgres, authentication, storage, and row-level security
- Vercel-compatible deployment
- A small, focused component system rather than a large UI framework

Keep dependencies restrained. Favor server-rendered content and server components where appropriate. Use client-side JavaScript only when it materially improves the interaction.

## Suggested data model

### Poem

```text
id
title
slug
content
excerpt (optional)
status: draft | published
is_featured
written_at (optional)
published_at (optional)
created_at
updated_at
```

Tags/themes may use a simple array initially or a normalized relationship if there is a concrete need.

### Project

```text
id
title
slug
summary
content
status: draft | published
is_featured
tech_stack
cover_image (optional)
repository_url (optional)
demo_url (optional)
display_order
created_at
updated_at
```

Use migrations and generated or shared database types where practical.

## Authentication and security

- The public site does not need user accounts.
- Only Zavier needs an admin account.
- Protect admin routes on the server, not only in the browser.
- Enforce content ownership and visibility with database row-level security or an equivalently strong server-side policy.
- Anonymous visitors must never be able to create, modify, delete, or retrieve draft content.
- Validate and sanitize all admin inputs.
- Avoid unsafe HTML rendering; if Markdown supports HTML, disable or sanitize it.
- Keep credentials in environment variables and provide a safe `.env.example` containing names only.
- Do not commit local environment files or secrets.

## Quality requirements

- Responsive across mobile, tablet, and desktop
- Accessible semantic HTML and keyboard navigation
- Visible focus states
- Sufficient color contrast
- Reduced-motion support
- Useful metadata, Open Graph tags, sitemap, robots configuration, and canonical URLs
- Clean URL slugs for projects and poems
- Fast page loads and optimized images/fonts
- Thoughtful empty, loading, error, and not-found states
- No console errors or obvious layout shift
- Basic automated coverage for critical visibility and authorization logic
- Formatting, linting, type checking, and tests should pass before handoff

## Development phases

### Phase 1 — Foundation and visual prototype

- Initialize the application and design tokens
- Build the responsive navigation, footer, homepage, projects collection, poetry collection, poem page, about page, and reusable components
- Use clearly labeled local placeholder data
- Establish the bright, warm minimalist visual system

### Phase 2 — Content and admin backend

- Add Supabase configuration and migrations
- Add owner authentication
- Add secure admin route protection
- Implement poetry CRUD, drafts, preview, publishing, editing, and deletion
- Connect public poetry pages to published database content

### Phase 3 — Projects and refinement

- Connect projects to the content system
- Add project administration if it was deferred
- Replace placeholders with verified content and real assets
- Add metadata, accessibility checks, testing, and performance refinement

### Phase 4 — Launch

- Perform a production-readiness review
- Configure production environment variables
- Deploy only after explicit approval
- Connect a custom domain later

## Initial deliverables

For the first implementation pass, produce:

1. A working local application with a polished responsive visual prototype.
2. Clear placeholder data isolated from production content.
3. A documented folder structure and architecture.
4. A `README.md` containing exact local setup commands.
5. An `.env.example` with no secret values.
6. A database schema/migration plan for poems, projects, and the single-owner admin flow.
7. A short list of content and assets Zavier must provide before launch.

## Working style

- Build in small, reviewable milestones.
- After each milestone, explain what changed and what Zavier can verify.
- Use Git commits as checkpoints when authorized.
- Do not silently expand the MVP into unrelated features.
- Prefer a cohesive, finished core experience over many incomplete features.
- When using placeholders, keep the site visually credible while making it impossible to mistake sample claims for real accomplishments.

## Definition of done for the MVP

The MVP is complete when:

- The public site looks polished on mobile and desktop.
- Only published projects and poems are visible publicly.
- Zavier can securely sign in to `/admin`.
- Zavier can create, preview, save, publish, edit, unpublish, and delete poetry.
- Poem formatting is preserved and pleasant to read.
- Placeholder content is isolated and removable.
- The repository contains setup documentation and no secrets.
- Type checking, linting, critical tests, and a production build pass.
- Nothing has been deployed without Zavier’s explicit approval.
