'use client'
export default function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  return <button className={className} type="submit" onClick={(e) => { if (!confirm(message)) e.preventDefault() }}>{children}</button>
}
