# RAW2K rebuild (Next.js on Vercel + Postgres)

- `npm run dev` — local; uses embedded PGlite (`.pglite/`) when `DATABASE_URL` is unset.
- Env vars: see `.env.example`. Admin sign-in uses **Supabase Auth**: every user under Supabase > Authentication > Users is an admin. Public sign-ups MUST be disabled there (login refuses to work otherwise); add admins with "Add user" in the dashboard.
- Seed: `DATABASE_URL=... npm run seed` (creates schema, loads `data/seed.json`; auction end times are shifted to now+).
- Admin: `/admin` — vehicles, testimonials, blog posts, currency/WhatsApp/contact email, change Supabase login email/password.
- Rescrape the original: crawl into `_crawl/html`, then `node scripts/scrape.mjs && npm run seed`.
- Supabase free projects pause after 7 days of inactivity; Neon free auto-resumes. Any Postgres works.
