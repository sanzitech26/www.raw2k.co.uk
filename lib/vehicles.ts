import { q } from './db'

export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleString('en-GB', { timeZone: 'Europe/London', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(',', '')

export const PER_PAGE = 15
const live = 'ends_at > now()'

// Filters mirror the original query params: search make model colour fuel transmission location category drives price=a-b miles=a-b
// plus path filters: area day agent cat featured
export async function listVehicles(f: Record<string, string | undefined>, page = 1) {
  const w: string[] = [live], p: unknown[] = []
  const add = (sql: string, v: unknown) => { p.push(v); w.push(sql.replaceAll('?', `$${p.length}`)) }
  if (f.search) add('(title ilike ? or location ilike ?)', `%${f.search}%`)
  for (const k of ['make', 'model', 'colour', 'fuel', 'transmission', 'location', 'category'] as const) if (f[k]) add(`lower(${k}) = lower(?)`, f[k])
  if (f.drives) add('drives = ?', f.drives === 'Yes' || f.drives === '1')
  const range = (col: string, s?: string) => {
    const [a, b] = (s || '').split('-').map(Number)
    if (s && !isNaN(a)) { add(`${col} >= ?`, a); if (b) add(`${col} <= ?`, b) }
  }
  range('price', f.price); range('odometer', f.miles)
  if (f.area) add("lower(replace(detail->>'area', ' ', '-')) = ?", f.area)
  if (f.agent) add("lower(replace(detail->>'stored', ' ', '-')) like ?", `%${f.agent.replace(/-\d+$/, '')}%`)
  if (f.day) add("lower(trim(to_char(ends_at at time zone 'Europe/London', 'Day'))) = ?", f.day)
  if (f.cat) add('? = any(cats)', f.cat)
  if (f.featured) w.push('featured')
  const where = w.join(' and ')
  const [{ n }] = await q(`select count(*)::int n from vehicles where ${where}`, p)
  const rows = await q(`select * from vehicles where ${where} order by ends_at, lot limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}`, p)
  return { rows, total: n as number, pages: Math.max(1, Math.ceil(n / PER_PAGE)) }
}

export const topPicks = () => q(`select * from vehicles where ${live} order by featured desc, ends_at limit 12`)
