import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import ContactForm from '@/components/ContactForm'
import { getSettings, waLink } from '@/lib/settings'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contact Us', description: 'Get in touch with RAW2K about buying, selling or collecting a vehicle.' }

export default async function Contact() {
  const s = await getSettings()
  return (
    <>
      <Breadcrumbs items={[['Help', '/help'], ['Contact Us', '/help/contact']]} />
      <div className="container" style={{ paddingBottom: 48 }}>
        <h1 style={{ fontSize: '2.2rem' }}>Contact us</h1>
        <p className="grey-text">Questions about a vehicle, buying or selling? Send us a message and we&apos;ll get back to you.</p>
        <div className="row">
          <div className="col s12 l7"><div className="card" style={{ padding: 28, borderRadius: 16 }}>
            <h5 style={{ marginTop: 0 }}>Leave a message</h5>
            <ContactForm />
          </div></div>
          <div className="col s12 l5">
            <div className="card" style={{ padding: 28, borderRadius: 16 }}>
              <h5 style={{ marginTop: 0 }}>Get in touch</h5>
              {s.contact_email && <p><i className="material-icons lime-text" style={{ verticalAlign: 'middle' }}>email</i> <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a></p>}
              {s.whatsapp && <p><a className="btn lime darken-1 white-text" href={waLink(s.whatsapp)}><i className="material-icons left">chat</i>WhatsApp {s.whatsapp}</a></p>}
              {!s.contact_email && !s.whatsapp && <p className="grey-text">Please use the form to reach us.</p>}
            </div>
            <div className="card" style={{ padding: 28, borderRadius: 16 }}>
              <h5 style={{ marginTop: 0 }}>Looking for these?</h5>
              <p><Link href="/help/faqs">FAQs</Link> · <Link href="/help/locations">Locations</Link> · <Link href="/help/terms">Terms</Link> · <Link href="/scrap-my-car">Scrap a Vehicle</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
