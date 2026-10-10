import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Serves images uploaded through the admin (stored in the database). Immutable: an id never changes its bytes.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  const [img] = Number.isInteger(id) ? await q('select mime, data from images where id = $1', [id]) : []
  if (!img) return new Response('Not found', { status: 404 })
  return new Response(img.data, { headers: { 'content-type': img.mime, 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } })
}
