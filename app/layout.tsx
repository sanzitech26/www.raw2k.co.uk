import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Online vehicle auctions - Buy & Bid Now | RAW2K', template: '%s | RAW2K' },
  description: 'RAW2K is a top UK online car auction with 1000s of used, salvage & seized vehicles. Browse cars, vans & bikes.',
  icons: { icon: [{ url: '/favicon-32x32.png', sizes: '32x32' }, { url: '/favicon-16x16.png', sizes: '16x16' }], apple: '/apple-touch-icon.png' },
}
export const viewport = { themeColor: '#ffffff' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500,700,800" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="stylesheet" href="/css/app.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
