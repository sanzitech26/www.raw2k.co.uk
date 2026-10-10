'use client'
import Link from 'next/link'
import { useState } from 'react'
import { makes, areas, days, types, slugify, cap } from '@/lib/nav'

const L = ({ href, children, ...p }: any) => <Link href={href} {...p}>{children}</Link>

export default function Header() {
  const [mega, setMega] = useState(false)
  const [side, setSide] = useState(false)
  const [search, setSearch] = useState(false)
  const close = () => { setMega(false); setSide(false) }
  return (
    <header>
      <div className="navbar-fixed">
        <nav className="black-text"><div className="nav-wrapper">
          <L href="/" className="brand-logo"><img src="/images/logo.png" alt="RAW2K Vehicle Auctions logo." /></L>
          <a href="#" className="button-collapse" style={{ display: 'block' }} onClick={(e) => { e.preventDefault(); setSide(true) }}><i className="material-icons grey-text text-darken-2">menu</i></a>
          <a className="search-nav right" onClick={() => setSearch(!search)}><i className="material-icons grey-text text-darken-3">search</i></a>
          {search ? (
            <ul className="searchhidden right"><li>
              <form className="row" action="/vehicle-auctions" method="get">
                <div className="input-field col s10"><i className="material-icons prefix">search</i><input type="search" placeholder="Search Vehicles" name="search" required autoFocus /></div>
                <div className="col s2"><i className="closesearch material-icons right" onClick={() => setSearch(false)}>close</i></div>
              </form></li></ul>
          ) : (
            <ul className="right hide-on-med-and-down mainmenu">
              <li onMouseLeave={() => setMega(false)}>
                <span className="dropdown-button" onClick={() => setMega(!mega)} onMouseEnter={() => setMega(true)}>Buy a Vehicle</span>
                {mega && (
                  <ul className="dropdown-content mega" style={{ display: 'block', opacity: 1, position: 'fixed', left: 0, right: 0, top: 64, width: '100%' }}>
                    <div className="row">
                      <div className="col m3"><h4>Vehicles for Sale</h4><hr />
                        <li><L href="/vehicle-auctions" className="bold" onClick={close}>View All Vehicles for Sale</L></li><li className="divider" />
                      </div>
                      <div className="col m3"><h4>Vehicle Types</h4><hr />
                        <li><L href="/vehicle-auctions/featured" className="bold" onClick={close}>View Featured Vehicles</L></li><li className="divider" />
                        {types.map(([n, h]) => <li key={h}><L href={h} onClick={close}>{n}</L></li>)}
                      </div>
                      <div className="col m3"><h4>Shop by Brand</h4><hr />
                        {makes.map((m) => <li key={m}><L href={`/vehicle-auctions/make/${slugify(m)}`} onClick={close}>{m} Vehicles</L></li>)}
                      </div>
                      <div className="col m3"><h4>Shop by Location</h4><hr />
                        {areas.map((a) => <li key={a}><L href={`/vehicle-auctions/area/${slugify(a)}`} onClick={close}>{a} Vehicles</L></li>)}
                      </div>
                    </div>
                  </ul>
                )}
              </li>
              <li><L href="/scrap-my-car">Scrap a Vehicle</L></li>
              <li><L href="/help">Help Centre</L></li>
              <li><L href="/news">News</L></li>
              <li><L href="/vehicle-auctions" className="btn less-bold z-depth-0 waves-effect waves-light">Vehicle List</L></li>
            </ul>
          )}
        </div></nav>
      </div>

      {side && <div id="sidenav-overlay" style={{ opacity: 1 }} onClick={close} />}
      <ul className="side-nav" id="sidemenu" style={{ transform: side ? 'translateX(0)' : 'translateX(-105%)' }}>
        <li><L href="/" onClick={close}>Home</L></li>
        <li><details><summary style={{ padding: '0 32px', lineHeight: '48px', cursor: 'pointer' }}>Buy a Vehicle</summary>
          <ul style={{ paddingLeft: 16 }}>
            <li><L href="/vehicle-auctions" onClick={close}>View All Vehicles for Sale</L></li>
            <li><L href="/vehicle-auctions/featured" onClick={close}>View Featured Vehicles</L></li>
            {types.map(([n, h]) => <li key={h}><L href={h} onClick={close}>{n}</L></li>)}
            <li><details><summary style={{ padding: '0 32px', lineHeight: '48px' }}>Shop by Brand</summary>
              <ul>{makes.map((m) => <li key={m}><L href={`/vehicle-auctions/make/${slugify(m)}`} onClick={close}>{m} Vehicles</L></li>)}</ul></details></li>
            <li><details><summary style={{ padding: '0 32px', lineHeight: '48px' }}>Shop by Location</summary>
              <ul>{areas.map((a) => <li key={a}><L href={`/vehicle-auctions/area/${slugify(a)}`} onClick={close}>{a} Vehicles</L></li>)}</ul></details></li>
          </ul></details></li>
        <li><L href="/help/locations" onClick={close}>Our Locations</L></li>
        <li><L href="/scrap-my-car" onClick={close}>Scrap a Vehicle</L></li>
        <li><L href="/help" onClick={close}>Help Centre</L></li>
        <li><L href="/news" onClick={close}>News</L></li>
      </ul>

    </header>
  )
}
