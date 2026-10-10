import { cache } from 'react'
import { q } from './db'

export const CURRENCIES = { GBP: '£', USD: '$', EUR: '€' } as const
export type Currency = keyof typeof CURRENCIES
export type Settings = { currency: Currency; sym: string; whatsapp: string; contact_email: string }

export const getSettings = cache(async (): Promise<Settings> => {
  const s = Object.fromEntries((await q('select key, value from settings')).map((r) => [r.key, r.value]))
  const currency = (s.currency in CURRENCIES ? s.currency : 'GBP') as Currency
  return { currency, sym: CURRENCIES[currency], whatsapp: s.whatsapp ?? '', contact_email: s.contact_email ?? '' }
})

export const setSetting = (key: string, value: string) =>
  q('insert into settings (key, value) values ($1,$2) on conflict (key) do update set value = $2', [key, value])

// Display only: stored prices are not converted between currencies.
export const money = (n: number, sym: string) => `${sym}${Number(n).toLocaleString('en-GB')}`
export const waLink = (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`
