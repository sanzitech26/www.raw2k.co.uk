'use client'
import { useState } from 'react'

export default function BuyEnquiry({ lot }: { lot: number }) {
  const [state, setState] = useState<'idle' | 'open' | 'sending' | 'sent' | 'error'>('idle')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    try {
      const r = await fetch('/api/enquiry', { method: 'POST', body: new FormData(e.currentTarget), headers: { Accept: 'application/json' } })
      setState(r.ok ? 'sent' : 'error')
    } catch { setState('error') }
  }
  if (state === 'sent') return <p className="lime-text">Thank you! We&apos;ve received your details and will be in touch shortly about this vehicle.</p>
  if (state === 'idle') return <button className="btn btn-small lime darken-1 white-text" onClick={() => setState('open')}>Interested in buying? Find out more</button>
  return (
    <form onSubmit={submit} style={{ textAlign: 'left' }} className="white-text">
      <input type="hidden" name="lot" value={lot} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
      <input name="name" required placeholder="Your name" className="white-text" />
      <input name="email" type="email" required placeholder="Email" className="white-text" />
      <input name="tel" placeholder="Phone (optional)" className="white-text" />
      <textarea name="message" placeholder="Any questions? (optional)" className="materialize-textarea white-text" />
      {state === 'error' && <p className="red-text">Something went wrong - please check your email address and try again.</p>}
      <button className="btn btn-small lime darken-1 white-text" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send my details'}</button>
    </form>
  )
}
