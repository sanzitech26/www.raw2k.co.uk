import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Listing from '@/components/Listing'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<Record<string, string | undefined>> }

// category listing pages scraped from the original site
const CATS: Record<string, string> = {
  'car-auctions': 'Car & Van Auctions', 'all-cars': 'Car & Van Auctions', 'bikes-auctions': 'Bikes & Quads Auctions',
  'caravans-auctions': 'HGV & Caravan Auctions', 'machinery-auctions': 'Plant & Machinery Auctions',
}
const page = async (path: string) => (await q('select * from pages where path = $1', [path]))[0]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = (await params).slug.join('/')
  if (CATS[path]) return { title: CATS[path] }
  const p = await page(path)
  return p ? { title: p.title.replace(/\s*\|\s*RAW2K\s*$/i, '').trim(), description: p.description } : {}
}

export default async function Page({ params, searchParams }: Props) {
  const path = (await params).slug.join('/')
  const sp = await searchParams
  if (CATS[path]) return <Listing title={CATS[path]} fixed={{ cat: path === 'all-cars' ? 'car-auctions' : path }} crumbs={[[CATS[path], `/${path}`]]} sp={sp} />
  const p = await page(path)
  if (!p || path.startsWith('_')) notFound()
  return (
    <>
      <Breadcrumbs items={[[p.title.replace(/\s*\|\s*RAW2K\s*$/i, '').trim(), `/${path}`]]} />
      {sp.sent && <p className="center-align green-text">Thanks - your message has been sent. We&apos;ll be in touch.</p>}
      {sp.error && <p className="center-align red-text">Please enter a valid email and a message.</p>}
      <div dangerouslySetInnerHTML={{ __html: p.html }} />
    </>
  )
}
