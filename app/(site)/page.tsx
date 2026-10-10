import VehicleCard from '@/components/VehicleCard'
import LivePrices from '@/components/LivePrices'
import { topPicks } from '@/lib/vehicles'
import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [rows, [hero], [content], tests] = await Promise.all([
    topPicks(),
    q("select html from pages where path = '_home_hero'"),
    q("select html from pages where path = '_home_content'"),
    q('select name, location, body, rating from testimonials where published order by id desc limit 6'),
  ])
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: hero?.html ?? '' }} />
      <br />
      <h5 className="grey-text text-darken-2 center-align" style={{ marginTop: 0 }}>This week&apos;s top picks</h5>
      <br />
      {/* ponytail: wrapped grid instead of the original slick carousel */}
      <div className="container"><div className="row">
        {rows.map((v) => <div key={v.lot} className="col s12 m6 l4"><VehicleCard v={v} /></div>)}
      </div></div>
      {tests.length > 0 && (
        <div className="container"><h5 className="grey-text text-darken-2 center-align">What our customers say</h5><div className="row">
          {tests.map((t, i) => (
            <div key={i} className="col s12 m6 l4"><div className="card" style={{ borderRadius: 20, padding: 16 }}>
              <div className="lime-text">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
              <p>“{t.body}”</p><strong>{t.name}</strong>{t.location && <span className="grey-text"> — {t.location}</span>}
            </div></div>
          ))}
        </div></div>
      )}
      <div dangerouslySetInnerHTML={{ __html: content?.html ?? '' }} />
      <LivePrices />
    </>
  )
}
