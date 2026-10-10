'use client'
import { useRef, useState } from 'react'

// Photo list for the vehicle form: add by upload or by link, remove, and promote any photo to "main" (first).
// Submits as one hidden field ("images", one URL per line), so add and edit share the same server action.
const MAX_SIDE = 1600

async function shrink(file: File): Promise<Blob> {
  if (file.size < 350 * 1024 && /jpe?g|webp/.test(file.type)) return file // already small
  try {
    const bmp = await createImageBitmap(file)
    const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.82))
  } catch { return file } // unreadable here (e.g. HEIC): let the server accept or reject the original
}

export default function ImageField({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial)
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(0)
  const [err, setErr] = useState('')
  const pick = useRef<HTMLInputElement>(null)

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setErr('')
    for (const f of Array.from(files)) {
      setBusy((n) => n + 1)
      try {
        const body = new FormData(); body.append('file', await shrink(f), f.name)
        const r = await fetch('/api/upload', { method: 'POST', body })
        const j = await r.json().catch(() => ({}))
        if (r.ok) setUrls((u) => [...u, j.url]); else setErr(`${f.name}: ${j.error || 'upload failed'}`)
      } catch { setErr(`${f.name}: upload failed`) }
      setBusy((n) => n - 1)
    }
    if (pick.current) pick.current.value = ''
  }

  function addLink() {
    const u = link.trim()
    if (!/^https?:\/\/\S+$/.test(u)) { setErr('Paste a full link starting with http:// or https://'); return }
    setErr(''); setUrls((x) => (x.includes(u) ? x : [...x, u])); setLink('')
  }

  return (
    <div>
      <input type="hidden" name="images" value={urls.join('\n')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, marginBottom: 14 }}>
        {urls.map((u, i) => (
          <div key={u} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f3f4f6' }}>
            <img src={u} alt="" style={{ width: '100%', height: 92, objectFit: 'cover', display: 'block' }} />
            {i === 0 && <span className="badge" style={{ position: 'absolute', left: 6, top: 6, background: '#10b981', color: '#fff' }}>Main</span>}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 4 }}>
              {i > 0 ? <button type="button" className="ab ic" title="Make main photo" onClick={() => setUrls((x) => [u, ...x.filter((y) => y !== u)])}><i className="material-icons">star_outline</i></button> : <span />}
              <button type="button" className="ab ic d" title="Remove" onClick={() => setUrls((x) => x.filter((y) => y !== u))}><i className="material-icons">close</i></button>
            </div>
          </div>
        ))}
        {busy > 0 && <div style={{ display: 'grid', placeItems: 'center', height: 92, borderRadius: 12, border: '1px dashed #10b981', color: '#059669', fontWeight: 600 }}>Uploading…</div>}
      </div>
      {!urls.length && !busy && <p className="hint" style={{ marginBottom: 12 }}>No photos yet. Upload some or paste a link.</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
        <button type="button" className="ab p" onClick={() => pick.current?.click()}><i className="material-icons">upload</i>Upload photos</button>
        <span style={{ color: '#6b7280' }}>or</span>
        <input className="in" style={{ flex: 1, minWidth: 220 }} value={link} placeholder="Paste an image link (https://…)" onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }} />
        <button type="button" className="ab" onClick={addLink}>Add link</button>
      </div>
      {err && <p style={{ color: '#b91c1c', marginTop: 10 }}>{err}</p>}
      <p className="hint">JPG, PNG or WebP. Large photos are resized automatically. The first photo is the main one.</p>
    </div>
  )
}
