// node scripts/seed.mjs  — loads data/seed.json into the DB (DATABASE_URL, or local PGlite when unset).
// Auction end times are shifted forward so the demo inventory is always live.
import { readFileSync } from 'node:fs'
import { q, tx, migrate } from '../lib/db.ts'

const seed = JSON.parse(readFileSync('data/seed.json', 'utf8'))
await migrate() // idempotent (create if not exists)

const minTs = Math.min(...seed.vehicles.map((v) => v.ends_ts))
const shift = Math.max(0, Date.now() / 1000 + 3 * 3600 - minTs)
const topPrice = [...seed.vehicles].sort((a, b) => b.price - a.price).slice(0, 12).map((v) => v.lot)

await tx(async (t) => {
  await t('delete from pages'); await t('delete from news where body is null') // content tables are fully re-derived from the scrape
  for (const v of seed.vehicles) {
    const d = v.detail || {}
    await t(
      `insert into vehicles (lot, slug, title, make, model, location, area, type, category, colour, fuel, transmission, odometer,
         starts, drives, has_keys, has_v5, opening, price, increment, started_at, ends_at, image, images, detail, cats, featured)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, now() - interval '2 days', to_timestamp($21), $22,array(select jsonb_array_elements_text($23::jsonb)),$24,array(select jsonb_array_elements_text($25::jsonb)),$26)
       on conflict (lot) do update set price = excluded.price, ends_at = excluded.ends_at, detail = excluded.detail, images = excluded.images`,
      [v.lot, v.slug, v.title, v.make, v.model, v.location, d.area || '', v.type, v.category, v.colour, v.fuel, v.transmission, v.odometer,
        v.starts, v.drives, v.has_keys, v.has_v5, d.opening || v.price, v.price, d.increment || 10, v.ends_ts + shift, v.image,
        JSON.stringify(v.images.length ? v.images : [v.image]), JSON.stringify(d), JSON.stringify(v.cats || []), topPrice.includes(v.lot)],
    )
  }
  for (const p of seed.pages)
    await t('insert into pages (path,title,description,html) values ($1,$2,$3,$4) on conflict (path) do update set title=$2, description=$3, html=$4', [p.path, p.title, p.description, p.html])
  for (const n of seed.news)
    await t('insert into news (path,title,description,image,published,html) values ($1,$2,$3,$4,$5,$6) on conflict (path) do update set title=$2, description=$3, image=$4, published=$5, html=$6',
      [n.path, n.title, n.description, n.image, n.date, n.html])
})
const [{ v }] = await q('select count(*)::int v from vehicles')
const [{ p }] = await q('select count(*)::int p from pages')
const [{ n }] = await q('select count(*)::int n from news')
console.log({ vehicles: v, pages: p, news: n })
process.exit(0)
