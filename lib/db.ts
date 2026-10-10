// One tiny query API over two backends: Postgres (DATABASE_URL: Neon/Supabase/any) or embedded PGlite for local dev.
import postgres from 'postgres'
import { readFileSync } from 'node:fs'

type Q = (text: string, params?: unknown[]) => Promise<any[]>
const g = globalThis as any

async function connect() {
  if (process.env.DATABASE_URL) {
    const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, ssl: 'require', connect_timeout: 15, idle_timeout: 20 })
    return {
      q: ((t, p = []) => sql.unsafe(t, p as any[])) as Q,
      migrate: () => sql.unsafe(readFileSync('db/schema.sql', 'utf8')),
      tx: <T>(fn: (q: Q) => Promise<T>) => sql.begin((s) => fn((t, p = []) => s.unsafe(t, p as any[]))) as Promise<T>,
    }
  }
  const { PGlite } = await import('@electric-sql/pglite')
  const pg = new PGlite('.pglite')
  await pg.exec(readFileSync('db/schema.sql', 'utf8'))
  return {
    q: (async (t, p = []) => (await pg.query(t, p)).rows) as Q,
    migrate: async () => {},
    tx: <T>(fn: (q: Q) => Promise<T>) => pg.transaction((t) => fn(async (s, p = []) => (await t.query(s, p)).rows)) as Promise<T>,
  }
}

const db = () => (g.__db ??= connect()) as ReturnType<typeof connect>
export const q: Q = async (t, p) => (await db()).q(t, p)
export const tx = async <T,>(fn: (q: Q) => Promise<T>) => (await db()).tx(fn)
export const migrate = async () => (await db()).migrate()
