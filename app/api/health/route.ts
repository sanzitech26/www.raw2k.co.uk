import postgres from 'postgres'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// TEMPORARY diagnostics: timings only, no secrets.
export async function GET() {
  const url = process.env.DATABASE_URL || ''
  const out: Record<string, unknown> = { node: process.version }
  const variants: [string, string, any][] = [
    ['6543 params unsafe', url, { prepare: false }],
    ['6543 params prepared', url, { prepare: true }],
    ['5432 params unsafe', url.replace(':6543/', ':5432/'), { prepare: false }],
    ['5432 params prepared', url.replace(':6543/', ':5432/'), { prepare: true }],
  ]
  for (const [name, u, opt] of variants) {
    const sql = postgres(u, { max: 1, ssl: 'require', connect_timeout: 10, ...opt })
    const t = Date.now()
    try {
      const r = await Promise.race([sql.unsafe('select $1::text as x', ['hi']), new Promise((_, rej) => setTimeout(() => rej(new Error('app-timeout 6s')), 6000))])
      out[name] = { ms: Date.now() - t, ok: JSON.stringify(r) }
    } catch (e: any) { out[name] = { ms: Date.now() - t, err: `${e.code ?? ''} ${e.message}`.slice(0, 120) } }
    sql.end({ timeout: 1 }).catch(() => {})
  }
  return Response.json(out)
}
