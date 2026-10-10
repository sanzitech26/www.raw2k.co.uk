import type { MetadataRoute } from 'next'
import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const rows = [
    ...(await q("select path p from pages where path not like '\\_%'")),
    ...(await q('select path p from news')),
    ...(await q("select 'vehicle-auctions/' || slug p from vehicles where ends_at > now()")),
  ]
  return [{ url: base }, ...rows.map((r) => ({ url: `${base}/${r.p}` }))]
}
