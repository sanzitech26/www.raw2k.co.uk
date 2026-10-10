import { NextResponse } from 'next/server'
import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: Promise<{ lot: string }> }) {
  const [v] = await q('select price, ends_at, increment, (select count(*)::int from bids where lot = $1) bids from vehicles where lot = $1', [Number((await params).lot)])
  return v ? NextResponse.json({ ...v, ends_at: new Date(v.ends_at).toISOString() }) : NextResponse.json({}, { status: 404 })
}
