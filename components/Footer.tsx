import Link from 'next/link'
import { getSettings, waLink } from '@/lib/settings'

const links = [['About RAW2K', '/about-us'], ['News', '/news'], ['Terms & Conditions', '/help/terms'], ['Privacy Policy', '/help/privacy-policy'], ['Cookies Policy', '/help/terms/cookies-policy'], ['Help', '/help'], ['Contact Us', '/contact']]

export default async function Footer() {
  const st = await getSettings()
  return (
    <footer className="page-footer grey darken-3">
      <div className="container"><div className="row">
        <div className="col l6 s12">
          <h5 className="white-text">RAW2K Salvage Vehicle Auctions</h5>
          <p className="grey-text text-lighten-4">If you&apos;re looking for online salvage vehicle auctions, then look no further. RAW2K have been a leading figure in the world of online salvage vehicle auctions for over 20 years now, and pride ourselves on providing only the best service when it comes to salvage vehicles, their auctions, and your experience.</p>
        </div>
        <div className="col l4 offset-l2 s12">
          <h5 className="white-text">Get in touch</h5>
          <p className="grey-text text-lighten-4">Using our <Link href="/contact" style={{ color: 'white', fontWeight: 'bold' }}>Contact Us</Link> form<br /><br /><strong>Company Number:</strong> 04304063
            {st.contact_email && <><br /><br /><strong>Email:</strong> <a className="white-text" href={`mailto:${st.contact_email}`}>{st.contact_email}</a></>}
            {st.whatsapp && <><br /><br /><a className="btn green" href={waLink(st.whatsapp)} target="_blank" rel="noopener">WhatsApp us: {st.whatsapp}</a></>}</p>
        </div>
      </div></div>
      <div className="footer-copyright"><div className="container">
        <p className="left">© {new Date().getFullYear()} RAW2K Salvage Vehicle Auction</p>
        <p className="right">{links.map(([n, h], i) => <span key={h}>{i > 0 && <>&nbsp;&nbsp;|&nbsp;&nbsp;</>}<Link className="grey-text text-lighten-4" href={h}>{n}</Link></span>)}</p>
      </div></div>
      <div className="row grey darken-3 white-text center-align" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><br />
        <a href="https://www.globalardour.co.uk/" target="_blank" rel="nofollow"><img src="/images/gar-logo-w.png" alt="GA Recycling Limited logo." style={{ width: 100, margin: 10 }} /></a>
        <a href="https://www.scrapcarformoney.co.uk/" target="_blank" rel="nofollow"><img src="/images/scfm-logo.png" alt="scrapcarformoney.co.uk logo." style={{ width: 100, margin: 10 }} /></a><br /><br />
      </div>
    </footer>
  )
}
