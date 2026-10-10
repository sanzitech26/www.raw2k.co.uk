export default function Flash({ saved, error }: { saved?: string; error?: string }) {
  return <>{saved && <div className="msg ok">Saved.</div>}{error && <div className="msg bad">{error}</div>}</>
}
