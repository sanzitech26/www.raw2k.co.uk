import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'

// TEMPORARY diagnostics: timings only, no secrets.
export async function GET() {
  const out: Record<string, unknown> = { node: process.version, region: process.env.VERCEL_REGION, host: (process.env.DATABASE_URL || '').split('@')[1]?.split('/')[0], urlLen: (process.env.DATABASE_URL || '').length }
  for (const [k, sql] of [['one', 'select 1 as x'], ['timeout', 'show statement_timeout'], ['pages', 'select count(*)::int c from pages'], ['hero', "select length(html) l from pages where path = '_home_hero'"]] as const) {
    const t = Date.now()
    try { out[k] = { ms: Date.now() - t, r: (await Promise.race([q(sql), new Promise((_, rej) => setTimeout(() => rej(new Error('app-timeout 8s')), 8000))])) } } catch (e: any) { out[k] = { ms: Date.now() - t, err: `${e.code ?? ''} ${e.message}`.slice(0, 160) } }
    if ((out[k] as any).err) { (out[k] as any).ms = Date.now() - t }
  }
  return Response.json(out)
}
