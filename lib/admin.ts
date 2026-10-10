// Admin sign-in is delegated to Supabase Auth (email + password). After a successful Supabase sign-in we set our own
// signed, httpOnly cookie. Only ONE Supabase user may be admin: the first user whose email is in ADMIN_EMAILS is
// pinned by user id (settings.admin_uid), so later email changes keep working and other sign-ups can never get in.
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { q } from './db'
import { setSetting } from './settings'

const secret = process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-secret-change-me')
const key = new TextEncoder().encode(secret)
const SB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const get = async (k: string) => (await q('select value from settings where key = $1', [k]))[0]?.value as string | undefined

const gotrue = (path: string, init: RequestInit & { token?: string } = {}) =>
  fetch(`${SB_URL}/auth/v1/${path}`, {
    ...init, cache: 'no-store',
    headers: { apikey: SB_KEY, 'content-type': 'application/json', ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
  })

async function signIn(email: string, password: string) {
  const r = await gotrue('token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) }).catch(() => null)
  if (!r?.ok) return null
  const j = await r.json()
  return { token: j.access_token as string, uid: j.user.id as string, email: j.user.email as string }
}

export async function login(email: string, password: string) {
  if (!secret || !SB_URL || !SB_KEY) return false
  const u = await signIn(email.trim(), password)
  if (!u) return false
  const owner = await get('admin_uid')
  if (owner) {
    if (owner !== u.uid) return false
  } else {
    const allow = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
    if (!allow.includes(u.email.toLowerCase())) return false
    await setSetting('admin_uid', u.uid)
  }
  const jwt = await new SignJWT({ admin: true, email: u.email }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key)
  ;(await cookies()).set('admin', jwt, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 604800 })
  return true
}

export const logout = async () => (await cookies()).delete('admin')

async function session() {
  const c = (await cookies()).get('admin')?.value
  if (!c || !secret) return null
  try { const p = (await jwtVerify(c, key)).payload; return p.admin === true ? { email: String(p.email ?? '') } : null } catch { return null }
}

export const isAdmin = async () => !!(await session())
export async function requireAdmin() { if (!(await isAdmin())) redirect('/admin/login') }
export const currentEmail = async () => (await session())?.email ?? ''

// Re-verifies the current password with Supabase, then updates the Supabase user. A changed email may need confirming
// from the inbox, depending on your Supabase "Confirm email" setting.
export async function changeCredentials(current: string, email: string, password: string) {
  const me = await currentEmail()
  const u = await signIn(me, current)
  if (!u) return 'Current password is incorrect.'
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.'
  if (password && password.length < 8) return 'New password must be at least 8 characters.'
  const body: Record<string, string> = {}
  if (email.toLowerCase() !== me.toLowerCase()) body.email = email
  if (password) body.password = password
  if (!Object.keys(body).length) return ''
  const r = await gotrue('user', { method: 'PUT', token: u.token, body: JSON.stringify(body) })
  if (!r.ok) return (await r.json().catch(() => ({}))).msg || 'Supabase rejected the change.'
  return ''
}
