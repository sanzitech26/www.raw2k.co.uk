// node scripts/make-sql.mjs  -> supabase/1-schema-and-vehicles.sql, supabase/2-pages-and-news.sql
// Paste each file into Supabase > SQL Editor > Run. Safe to re-run (idempotent; auction end times re-shift to "now").
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const seed = JSON.parse(readFileSync('data/seed.json', 'utf8'))
const schema = readFileSync('db/schema.sql', 'utf8')
const lit = (s) => { // dollar-quoted literal, tag guaranteed absent from the text
  let tag = 'q', t = String(s ?? '')
  while (t.includes(`$${tag}$`)) tag += 'x'
  return `$${tag}$${t}$${tag}$`
}
const arr = (a) => `array(select jsonb_array_elements_text(${lit(JSON.stringify(a))}::jsonb))`
const bool = (b) => (b ? 'true' : 'false')

const tables = ['images', 'users', 'vehicles', 'bids', 'pages', 'news', 'settings', 'testimonials', 'enquiries']
const rls = `
-- Lock every table: the public anon key can read/write NOTHING. The website's server connects with the
-- Postgres connection string (DATABASE_URL), which bypasses RLS, so the app is unaffected.
${tables.map((t) => `alter table ${t} enable row level security;`).join('\n')}
`

const cols = {
  lot: 'Lot number (unique, auto-assigned by the admin form)', slug: 'URL slug, e.g. 2017-audi-q2-tdi-341459 (auto-built from title + lot)',
  title: 'Full advert title, e.g. 2017 AUDI Q2 TDI QUATTRO S LINE 1,968cc', make: 'Make, e.g. AUDI', model: 'Model, e.g. Q2',
  location: 'Town shown on listing cards', area: 'Region used by area filters, e.g. North West', type: 'Body type: Hatchback, Estate, Saloon, Motorcycle, SPV...',
  category: 'ABI category: N, S or Not Recorded', colour: 'Colour', fuel: 'Petrol, Diesel, Electric, Hybrid...', transmission: 'Manual, Automatic, Semi Auto',
  odometer: 'Indicated mileage; 0 = unknown', starts: 'Vehicle starts', drives: 'Vehicle drives', has_keys: 'Keys present', has_v5: 'V5 log book present',
  opening: 'Opening price (whole currency units)', price: 'Current highest bid; starts equal to opening price', increment: 'Minimum bid increment',
  started_at: 'When the auction opened', ends_at: 'When the auction closes (timestamp with time zone)', image: 'Main photo URL', images: 'All photo URLs, main photo first',
  detail: 'JSON: area, town, stored, vat, fsh, extra, damage, viewing, delivery, premium, opening, increment', cats: 'Category pages: car-auctions, bikes-auctions, caravans-auctions, machinery-auctions',
  featured: 'Show in home page top picks',
}
const comments = Object.entries(cols).map(([c, t]) => `comment on column vehicles.${c} is ${lit(t)};`).join('\n')
const minTs = Math.min(...seed.vehicles.map((v) => v.ends_ts))
const topPrice = new Set([...seed.vehicles].sort((a, b) => b.price - a.price).slice(0, 12).map((v) => v.lot))

const vehicles = seed.vehicles.map((v) => {
  const d = v.detail || {}
  const off = Math.round(v.ends_ts - minTs + 3 * 3600)
  return `insert into vehicles (lot, slug, title, make, model, location, area, type, category, colour, fuel, transmission, odometer, starts, drives, has_keys, has_v5, opening, price, increment, started_at, ends_at, image, images, detail, cats, featured)
values (${v.lot}, ${lit(v.slug)}, ${lit(v.title)}, ${lit(v.make)}, ${lit(v.model)}, ${lit(v.location)}, ${lit(d.area || '')}, ${lit(v.type)}, ${lit(v.category)}, ${lit(v.colour)}, ${lit(v.fuel)}, ${lit(v.transmission)}, ${v.odometer | 0}, ${bool(v.starts)}, ${bool(v.drives)}, ${bool(v.has_keys)}, ${bool(v.has_v5)}, ${Math.round(d.opening || v.price)}, ${Math.round(v.price)}, ${d.increment || 10}, now() - interval '2 days', now() + ${off} * interval '1 second', ${lit(v.image)}, ${arr(v.images.length ? v.images : [v.image])}, ${lit(JSON.stringify(d))}::jsonb, ${arr(v.cats || [])}, ${bool(topPrice.has(v.lot))})
on conflict (lot) do update set price = excluded.price, ends_at = excluded.ends_at, detail = excluded.detail, images = excluded.images, cats = excluded.cats;`
})

const pages = seed.pages.map((p) => `insert into pages (path, title, description, html) values (${lit(p.path)}, ${lit(p.title)}, ${lit(p.description)}, ${lit(p.html)})
on conflict (path) do update set title = excluded.title, description = excluded.description, html = excluded.html;`)

const news = seed.news.map((n) => `insert into news (path, title, description, image, published, html) values (${lit(n.path)}, ${lit(n.title)}, ${lit(n.description)}, ${lit(n.image)}, ${n.date ? lit(n.date) + '::date' : 'null'}, ${lit(n.html)})
on conflict (path) do update set title = excluded.title, description = excluded.description, image = excluded.image, published = excluded.published, html = excluded.html;`)

mkdirSync('supabase', { recursive: true })
writeFileSync('supabase/1-schema-and-vehicles.sql', `-- RAW2K: database schema only (no vehicles - add cars through /admin/vehicles)\nbegin;\n${schema}\n${rls}\n${comments}\ncommit;\n`)
writeFileSync('supabase/2-pages-and-news.sql', `-- RAW2K: ${pages.length} content pages + ${news.length} news posts (run AFTER file 1)\nbegin;\n${pages.join('\n')}\n${news.join('\n')}\ncommit;\n`)
console.log({ vehicles: vehicles.length, pages: pages.length, news: news.length })
