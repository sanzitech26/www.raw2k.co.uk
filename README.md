# RAW2K rebuild (Next.js on Vercel + Postgres)

- `npm run dev` — local; uses embedded PGlite (`.pglite/`) when `DATABASE_URL` is unset. Dev admin login: admin@example.com / changeme123.
- Production env vars (see `.env.example`): `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`.
- Seed: `DATABASE_URL=... npm run seed` (creates schema, loads `data/seed.json`; auction end times are shifted to now+).
- Admin: `/admin` — vehicles, testimonials, blog posts, currency/WhatsApp/contact email, login email + password.
- Rescrape the original: crawl into `_crawl/html`, then `node scripts/scrape.mjs && npm run seed`.
- Supabase free projects pause after 7 days of inactivity; Neon free auto-resumes. Any Postgres works.
