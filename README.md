# AI Vision Studio

Video portfolio with three public profiles and one admin dashboard:

| Route | Profile |
| --- | --- |
| `/` | Caleb Peters |
| `/daniel` | Daniel Studio |
| `/faith` | Faith K |
| `/<profile>/category-<slug>[/<niche>]` | One category or niche of a profile's work |
| `/admin` | Admin dashboard (sign in at `/admin/login`) |

Content (videos, testimonials, layouts, categories, contact details) lives in Supabase and is edited from the admin dashboard, so most changes need no code or redeploy.

## Local development

```sh
npm install
cp .env.example .env   # then fill in your Supabase URL and publishable key
npm run dev
```

`npm test` runs the unit tests and `npm run build` builds to `dist/`.

## Database

Migrations are in `supabase/migrations`. Run any new file in the Supabase SQL editor (or `supabase db push`) before deploying code that uses it. The admin dashboard tells you when a setting needs a migration that hasn't been applied yet.

Admin accounts are Supabase Auth users with the `admin` role in `user_roles`. Never put a password in this repository: it is public.

## Deploying (Vercel)

- Production URL: <https://caleb-ai-vision.vercel.app> (or your custom domain once it is attached).
- **Share the production URL, never a deployment URL** like `caleb-ai-vision-<hash>-<team>.vercel.app`. Those addresses are frozen to one build and never show later fixes.
- Links built in the dashboard always use the production domain: the build reads it from Vercel's `VERCEL_PROJECT_PRODUCTION_URL`. Set `VITE_PUBLIC_SITE_URL` in Vercel to override it, for example after attaching a custom domain.
- After `vite build`, `scripts/profile-meta.mjs` writes `daniel.html` and `faith.html` so each profile shows its own title, description and image when the link is pasted into WhatsApp, LinkedIn, email or Upwork. Preview images live in `public/og/`.

## Sharing links for outreach

Sign in at `/admin/login`, then open any profile page in the same browser. The share-link tools (category link builder, campaign tag, copy button) only appear for you, never for visitors.

Add a campaign tag such as `us-dtc-week40` and the copied link carries `utm_source=outreach&utm_campaign=us-dtc-week40`. Visits from it are counted under that campaign in Admin > Analytics, so you can see which outreach batch brought people to the page.
