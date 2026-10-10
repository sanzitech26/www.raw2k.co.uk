export default function Flash({ saved, error }: { saved?: string; error?: string }) {
  return <>{saved && <div className="msg ok">Saved.</div>}{error && <div className="msg bad">{error}</div>}</>
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return <div className="ph"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div><div className="acts">{children}</div></div>
}
