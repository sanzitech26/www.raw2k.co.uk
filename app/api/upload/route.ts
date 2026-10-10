import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { isAdmin } from '@/lib/admin'

const MAX = 4 * 1024 * 1024 // Vercel request bodies cap at ~4.5 MB; the browser downsizes photos first

// Detect the type from the bytes, never from the filename or declared type. SVG is deliberately not allowed (script risk).
function sniff(b: Uint8Array) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp'
  return ''
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 })
  const file = (await req.formData().catch(() => null))?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received.' }, { status: 400 })
  if (file.size > MAX) return NextResponse.json({ error: 'Image is larger than 4 MB.' }, { status: 413 })
  const buf = Buffer.from(await file.arrayBuffer())
  const mime = sniff(buf)
  if (!mime) return NextResponse.json({ error: 'Only JPG, PNG or WebP images are allowed.' }, { status: 415 })
  const [{ id }] = await q('insert into images (mime, data) values ($1, $2) returning id', [mime, buf])
  return NextResponse.json({ url: `/img/${id}` })
}
