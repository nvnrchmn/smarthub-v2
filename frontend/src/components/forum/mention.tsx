import { useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

export interface NamaWarga {
  id_user: number
  nama_lengkap: string
}

const PALET = ['#1B6B4A', '#0E7490', '#7C3AED', '#B45309', '#BE185D', '#1D4ED8', '#065F46', '#9D174D']

export function warnaInisial(nama: string): string {
  let h = 0
  for (let i = 0; i < nama.length; i++) h = (h * 31 + nama.charCodeAt(i)) >>> 0
  return PALET[h % PALET.length]
}

export function inisial(nama: string): string {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('') || '?'
}

/** Merender teks: @Mention disorot & baris baru dihormati. */
export function renderRich(teks: string) {
  const parts = teks.split(/(@[\p{L}\p{N} .'-]+)/gu)
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((p, i) =>
        p.startsWith('@') && p.length > 1 ? (
          <span key={i} className="font-semibold text-primary">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  )
}

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return ''
  const s = Math.max(0, (Date.now() - d) / 1000)
  if (s < 60) return 'baru saja'
  if (s < 3600) return `${Math.floor(s / 60)} mnt`
  if (s < 86400) return `${Math.floor(s / 3600)} jam`
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} hari`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

interface Props {
  value: string
  onChange: (v: string) => void
  namaWarga: NamaWarga[]
  placeholder?: string
  rows?: number
  className?: string
}

/* Textarea dengan saran @Mention ala Instagram — daftar nama warga
   satu tenant, navigasi ↑/↓ + Enter/Tab, Esc menutup. */
export function MentionArea({ value, onChange, namaWarga, placeholder, rows = 3, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [q, setQ] = useState<string | null>(null)
  const [active, setActive] = useState(0)

  const saran = useMemo(() => {
    if (q === null) return []
    const kata = q.toLowerCase()
    return namaWarga.filter((n) => n.nama_lengkap.toLowerCase().includes(kata)).slice(0, 6)
  }, [q, namaWarga])

  const detect = (teks: string, caret: number) => {
    const before = teks.slice(0, caret)
    const at = before.lastIndexOf('@')
    const ws = Math.max(before.lastIndexOf(' '), before.lastIndexOf('\n'))
    if (at === -1 || at < ws) return setQ(null)
    setQ(before.slice(at + 1))
    setActive(0)
  }

  const pilih = (nama: string) => {
    if (q === null) return
    const el = ref.current
    const caret = el?.selectionStart ?? value.length
    const before = value.slice(0, caret)
    const at = before.lastIndexOf('@')
    const next = value.slice(0, at) + `@${nama} ` + value.slice(caret)
    onChange(next)
    setQ(null)
    requestAnimationFrame(() => {
      const pos = at + nama.length + 2
      el?.focus()
      el?.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className={cn('relative', className)}>
      {q !== null && saran.length > 0 && (
        <div className="absolute bottom-[calc(100%+6px)] left-0 right-0 z-20 max-h-52 overflow-y-auto rounded-2xl border border-border bg-surface-card p-1 shadow-2xl">
          {saran.map((s, i) => (
            <button
              key={s.id_user}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pilih(s.nama_lengkap)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors',
                i === active && 'bg-text-disabled/10'
              )}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: warnaInisial(s.nama_lengkap) }}
              >
                {inisial(s.nama_lengkap)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text-primary">{s.nama_lengkap}</span>
                <span className="block text-[11px] text-text-secondary">warga satu RT</span>
              </span>
            </button>
          ))}
        </div>
      )}
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        onChange={(e) => {
          onChange(e.target.value)
          detect(e.target.value, e.target.selectionStart)
        }}
        onSelect={(e) => detect(e.currentTarget.value, e.currentTarget.selectionStart)}
        onKeyDown={(e) => {
          if (q !== null && saran.length > 0) {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => (a + 1) % saran.length)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => (a - 1 + saran.length) % saran.length)
            } else if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault()
              pilih(saran[active].nama_lengkap)
            } else if (e.key === 'Escape') {
              setQ(null)
            }
          }
        }}
        onBlur={() => setTimeout(() => setQ(null), 150)}
      />
    </div>
  )
}
