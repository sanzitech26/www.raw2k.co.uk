'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// Same behaviour as the original sidebar: picking an option reloads the listing with that query param.
export default function FilterSelect({ name, label, options }: { name: string; label: string; options: [string, string][] }) {
  const router = useRouter(), path = usePathname(), sp = useSearchParams()
  return (
    <select className="browser-default filter-field" value={sp.get(name) ?? ''} aria-label={label}
      onChange={(e) => {
        const n = new URLSearchParams(sp.toString()); n.delete('page')
        e.target.value ? n.set(name, e.target.value) : n.delete(name)
        router.push(`${path}?${n}`)
      }}>
      <option value="">{label}</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}
