'use client'
import { useState } from 'react'

const SUBJECTS = ['Buying a vehicle', 'Selling / scrapping a vehicle', 'Collection & delivery', 'Viewing a vehicle', 'Complaint', 'Other']
const field = { display: 'block', width: '100%', boxSizing: 'border-box', margin: '0 0 14px', padding: '11px 12px', border: '1px solid #ccc', borderRadius: 4, font: 'inherit', background: '#fff' } as const

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    try {
      const r = await fetch('/api/enquiry', { method: 'POST', body: new FormData(e.currentTarget), headers: { Accept: 'application/json' } })
      setState(r.ok ? 'sent' : 'error')
    } catch { setState('error') }
  }
  if (state === 'sent') return <div className="center-align" style={{ padding: '40px 0' }}><h5>Thank you!</h5><p>Your message has been sent. We&apos;ll be in touch soon.</p></div>
  return (
    <form onSubmit={submit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
      <input className="browser-default" style={field} name="name" required placeholder="Your name" />
      <input className="browser-default" style={field} name="email" type="email" required placeholder="Email address" />
      <input className="browser-default" style={field} name="tel" placeholder="Phone (optional)" />
      <select className="browser-default" style={field} name="subject" required defaultValue="">
        <option value="" disabled>Select a subject</option>
        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
      </select>
      <textarea className="browser-default" style={field} name="message" required rows={6} placeholder="How can we help?" />
      {state === 'error' && <p className="red-text">Something went wrong - please check your details and try again.</p>}
      <button type="submit" className="btn lime darken-1 white-text" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button>
    </form>
  )
}
