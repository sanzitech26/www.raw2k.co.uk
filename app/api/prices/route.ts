import { NextResponse } from 'next/server'
import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const lots = (new URL(req.url).searchParams.get('lots') || '').split(',').map(Number).filter(Number.isInteger).slice(0, 60)
  const rows = lots.length ? await q('select lot, price from vehicles where lot = any($1::int[])', [lots]) : []
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.lot, r.price])))
}
