import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { q } from './db'
import { setSetting } from './settings'

const secret = process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-secret-change-me')
const key = new TextEncoder().encode(secret)
const get = async (k: string) => (await q('select value from settings where key = $1', [k]))[0]?.value as string | undefined

// Bootstrap: until the owner changes it in /admin/account, credentials come from ADMIN_EMAIL / ADMIN_PASSWORD (dev defaults outside production).
async function credentials() {
  const [email, hash] = [await get('admin_email'), await get('admin_hash')]
  if (email && hash) return { email, hash }
  const e = process.env.ADMIN_EMAIL || (process.env.NODE_ENV === 'production' ? '' : 'admin@example.com')
  const p = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'changeme123')
  return e && p ? { email: e.toLowerCase(), hash: await bcrypt.hash(p, 10) } : null
}

export async function login(email: string, password: string) {
  if (!secret) return false
  const c = await credentials()
  if (!c || email.trim().toLowerCase() !== c.email.toLowerCase() || !(await bcrypt.compare(password, c.hash))) return false
  const jwt = await new SignJWT({ admin: true, email: c.email }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key)
  ;(await cookies()).set('admin', jwt, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 604800 })
  return true
}

export const logout = async () => (await cookies()).delete('admin')

export async function isAdmin() {
  const c = (await cookies()).get('admin')?.value
  if (!c || !secret) return false
  try { return (await jwtVerify(c, key)).payload.admin === true } catch { return false }
}

export async function requireAdmin() { if (!(await isAdmin())) redirect('/admin/login') }

export async function currentEmail() { return (await credentials())?.email ?? '' }

export async function changeCredentials(current: string, email: string, password: string) {
  const c = await credentials()
  if (!c || !(await bcrypt.compare(current, c.hash))) return 'Current password is incorrect.'
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.'
  if (password && password.length < 8) return 'New password must be at least 8 characters.'
  await setSetting('admin_email', email.toLowerCase())
  await setSetting('admin_hash', password ? await bcrypt.hash(password, 10) : c.hash)
  return ''
}
