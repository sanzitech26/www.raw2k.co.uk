// Parses the crawled HTML in _crawl/html into data/seed.json (vehicles, pages, news).
import { load } from 'cheerio'
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'

const D = '_crawl/html'
const read = (f) => readFileSync(`${D}/${f}`, 'utf8')
const rel = (s) => s.replaceAll('https://www.raw2k.co.uk', '').replace(/ All you need to do is register or login to start bidding[^<]*/, '').replace(/(href|action)=""/g, '$1="/"')
const txt = ($el) => $el.text().replace(/\s+/g, ' ').trim()

// ---- vehicles from listing cards (15 per page) ----
const vehicles = new Map()
for (const f of readdirSync(D).filter((f) => /^listing_\d+\.html$/.test(f))) {
  const $ = load(read(f))
  $('.listingitem').each((_, el) => {
    const c = $(el), a = c.attr.bind(c)
    const href = c.find('a.coverlink').first().attr('href') || ''
    const slug = href.split('?')[0].split('/').pop()
    const lot = Number(slug.split('-').pop())
    const cells = c.find('.card-content .col.s3').map((_, e) => txt($(e))).get()
    vehicles.set(lot, {
      lot, slug,
      title: a('data-title').trim(), make: a('data-make'), model: a('data-model'),
      location: a('data-location'), type: a('data-type'), category: a('data-category'),
      price: Number(a('data-price')), colour: a('data-colour'), odometer: Number(a('data-odometer')),
      ends_ts: Number(a('data-enddate')), fuel: a('data-fuel'), transmission: a('data-transmission'),
      starts: a('data-starts') === 'Yes', drives: a('data-drives') === 'Yes',
      has_keys: cells.some((t) => t === 'Has Keys'), has_v5: cells.some((t) => /^Has V5|^V5/i.test(t) && !/^No/i.test(t)),
      image: c.find('img.vehicle-image').attr('src') || '', images: [], detail: {},
    })
  })
}

// ---- categories: the original's type pages are paginated/404, so derive membership from vehicle type ----
const CAT_TYPES = {
  'car-auctions': ['Coupe', 'Hatchback', 'Saloon', 'Convertible', 'Estate', 'Car', 'MPV', 'Panel Van', 'Car Derived Van'],
  'bikes-auctions': ['Motorcycle', 'Quad Bike', 'E Bike', 'Moped', 'Off Road Bike'],
  'caravans-auctions': ['Caravan', 'Heavy', 'Chassis Cab'],
  'machinery-auctions': ['SPV'],
}
for (const v of vehicles.values()) v.cats = Object.entries(CAT_TYPES).filter(([, t]) => t.includes(v.type)).map(([c]) => c)

// ---- vehicle detail pages ----
for (const f of existsSync(`${D}/vehicles`) ? readdirSync(`${D}/vehicles`) : []) {
  const $ = load(readFileSync(`${D}/vehicles/${f}`, 'utf8'))
  const lot = Number($('[itemprop=productID]').first().text())
  const v = vehicles.get(lot)
  if (!v) continue
  v.images = [...new Set($('a[data-lightbox]').map((_, e) => $(e).attr('href')).get())]
  const cell = (icon) => $('.cell').filter((_, e) => $(e).find('i.material-icons').first().text().trim() === icon).map((_, e) => txt($(e))).get()
  const place = cell('place')[0] || ''
  const [area, town] = place.split(' / ')
  const section = (h) => txt($('h5').filter((_, e) => $(e).text().trim().startsWith(h)).first().next('p'))
  const pull = txt($('.pullout-area').first())
  const m = (re) => (pull.match(re) || [])[1]
  v.detail = {
    area: area || '', town: town || '', stored: (cell('home')[0] || '').replace(/^home\s*/, ''),
    vat: cell('account_balance')[0] || '', fsh: cell('description').find((t) => /FSH/.test(t)) || '',
    extra: section('Extra information'), damage: txt($('[itemprop=knownVehicleDamages]')).length ? $('[itemprop=knownVehicleDamages]').text().trim() : '',
    viewing: section('Viewing'), delivery: section('Delivery'),
    opening: Number((m(/Opening Price: £([\d,]+)/) || '0').replace(/,/g, '')),
    increment: Number(m(/Price Increment: £([\d,]+)/) || $('#priceincrement').val() || 10),
    premium: txt($('.pullout-area p.lime-text').first()),
    began: m(/Auction Began: (\d\d\/\d\d\/\d{4} [\d:]+)/),
  }
}

// ---- generic content pages & news posts ----
const body = ($) => {
  $('script, style').remove()
  const nav = $('nav.breads').first()
  const start = nav.length ? nav.nextAll() : $('header').first().nextAll()
  const out = $('<div></div>')
  start.each((_, e) => { if (e.tagName === 'footer' || $(e).hasClass('page-footer')) return false; out.append($(e).clone()) })
  out.find('.modal, #signinmodal, #cookies-modal').remove()
  out.find('form').filter((_, f) => /\/login$|\/vehicle-auctions$/.test($(f).attr('action') || '')).remove() // customer login/search forms are gone
  out.find('form[action$="/help/contact"]').attr('action', '/api/enquiry').find('input[name=_token], input[name=url]').remove()
  out.find('a[href$="/login"], a[href$="/register"], a[href$="#signinmodal"]').attr('href', '/help/contact')
  return rel(out.html() || '').trim()
}
const docs = (dir) => readdirSync(`${D}/${dir}`).map((f) => {
  const $ = load(readFileSync(`${D}/${dir}/${f}`, 'utf8'))
  const path = f.slice(0, -5).replaceAll('__', '/')
  return {
    path, title: txt($('title')), description: ($('meta[name=description]').attr('content') || '').trim(),
    date: $('time').first().attr('datetime') || null, image: $('meta[property="og:image"]').attr('content') || '',
    html: body($),
  }
}).filter((d) => d.html.length > 50 && !/Server Error: 404|searchresults/.test(d.html))

const pages = docs('pages'), news = docs('news')
// homepage: hero block + everything after the carousel (the carousel itself is rebuilt from live data)
{
  const $h = load(readFileSync('_crawl/home.html', 'utf8'))
  const after = $h('div.carouselwrap').nextAll().filter((_, e) => !['script', 'footer'].includes(e.tagName) && !$h(e).hasClass('modal') && !$h(e).hasClass('page-footer'))
  const html = (x) => rel($h.html(x))
  pages.push({ path: '_home_hero', title: txt($h('title')), description: $h('meta[name=description]').attr('content').trim(), html: html($h('div.bottom-sale')) })
  pages.push({ path: '_home_content', title: '', description: '', html: after.map((_, e) => html(e)).get().join('') })
}
// news index gives the (newest) posts, including ones absent from the sitemap
const $n = load(read('news.html'))
const index = $n('article.post').map((_, e) => ({
  path: $n(e).find('a').first().attr('href').replace('https://www.raw2k.co.uk/', ''),
  title: txt($n(e).find('h4,h6').first()), date: $n(e).find('time').attr('datetime'),
  image: $n(e).find('img').attr('src'),
})).get()
for (const n of news) Object.assign(n, index.find((i) => i.path === n.path) || {})

writeFileSync('data/seed.json', JSON.stringify({ vehicles: [...vehicles.values()], pages, news, newsIndex: index }))
console.log({ vehicles: vehicles.size, withDetail: [...vehicles.values()].filter((v) => v.images.length).length, pages: pages.length, news: news.length, index: index.length })
