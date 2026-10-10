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

// three makes with the most live lots, up to 10 lots each (homepage sliders)
export async function brandRows() {
  const rows = await q(`select * from (
    select v.*, row_number() over (partition by v.make order by v.featured desc, v.ends_at) rn, dense_rank() over (order by mk.n desc, v.make) rk
    from vehicles v join (select make, count(*) n from vehicles where ${live} and make <> '' group by make) mk on mk.make = v.make
    where v.${live}) t where rk <= 3 and rn <= 10 order by rk, rn`)
  const by = new Map<string, any[]>()
  for (const r of rows) by.set(r.make, [...(by.get(r.make) ?? []), r])
  return [...by.entries()]
}
