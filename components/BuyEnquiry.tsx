'use client'
import { useRef, useState } from 'react'

// Native <dialog> modal: gives backdrop, Esc-to-close and focus trapping for free.
export default function BuyEnquiry({ lot, title }: { lot: number; title?: string }) {
  const dlg = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const open = () => { setState((s) => (s === 'sent' ? 'idle' : s)); dlg.current?.showModal() }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    try {
      const r = await fetch('/api/enquiry', { method: 'POST', body: new FormData(e.currentTarget), headers: { Accept: 'application/json' } })
      setState(r.ok ? 'sent' : 'error')
    } catch { setState('error') }
  }
  const field = { className: 'browser-default', style: { display: 'block', width: '100%', boxSizing: 'border-box', margin: '0 0 12px', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, font: 'inherit' } } as const
  return (
    <>
      <button className="btn btn-small lime darken-1 white-text" onClick={open}>Interested in buying? Find out more</button>
      <dialog ref={dlg} onClick={(e) => e.target === dlg.current && dlg.current?.close()} style={{ border: 0, borderRadius: 12, padding: 28, width: 'min(460px, 92vw)', textAlign: 'left' }}>
        {state === 'sent' ? (
          <div className="center-align">
            <h5>Thank you!</h5>
            <p>We&apos;ve received your details and will be in touch shortly about this vehicle.</p>
            <button className="btn lime darken-1 white-text" onClick={() => dlg.current?.close()}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h5 style={{ marginTop: 0 }}>Interested in buying?</h5>
            {title && <p className="grey-text">{title} · Lot {lot}</p>}
            <p>Leave your details and we&apos;ll get back to you with everything you need to know about this vehicle.</p>
            <input type="hidden" name="lot" value={lot} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
            <input {...field} name="name" required placeholder="Your name" />
            <input {...field} name="email" type="email" required placeholder="Email" />
            <input {...field} name="tel" placeholder="Phone (optional)" />
            <textarea {...field} name="message" rows={3} placeholder="Any questions? (optional)" />
            {state === 'error' && <p className="red-text">Something went wrong - please check your email address and try again.</p>}
            <button type="submit" className="btn lime darken-1 white-text" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send my details'}</button>{' '}
            <button type="button" className="btn-flat" onClick={() => dlg.current?.close()}>Cancel</button>
          </form>
        )}
      </dialog>
    </>
  )
}
