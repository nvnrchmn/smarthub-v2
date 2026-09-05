import { useRef, useState } from 'react'
import { uploadFoto } from '../../lib/upload'
import { Icon } from './Icon'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function FotoField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [sibuk, setSibuk] = useState(false)
  const [err, setErr] = useState('')

  const pilih = async (f?: File | null) => {
    if (!f) return
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(f.type)) {
      setErr('Hanya PNG/JPG/WebP/GIF.')
      return
    }
    if (f.size > 8 * 1024 * 1024) {
      setErr('Maksimal 8 MB.')
      return
    }
    setErr('')
    setSibuk(true)
    try {
      onChange(await uploadFoto(f))
    } catch (e: any) {
      setErr(e.message || 'Gagal mengunggah.')
    } finally {
      setSibuk(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const tampil = value && /^(https?:\/\/|\/)/.test(value)

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => pilih(e.target.files?.[0])} />
      {tampil ? (
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border">
            <img src={value} alt="Pratinjau produk" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={sibuk}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm font-medium text-text-secondary transition-colors active:scale-[.98] disabled:opacity-60">
              <Icon name="refresh" size={14} />
              {sibuk ? 'Mengunggah…' : 'Ganti foto'}
            </button>
            <button type="button" onClick={() => onChange('')} aria-label="Hapus foto"
              className="ml-2 inline-flex items-center gap-1.5 rounded-xl border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition-colors">
              <Icon name="trash" size={14} />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={sibuk}
          className="flex min-h-[52px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-4 text-sm font-medium text-text-secondary transition-colors active:scale-[.98] disabled:opacity-60">
          <Icon name="plus" size={18} className="text-primary" />
          {sibuk ? 'Mengunggah…' : 'Pilih foto dari galeri'}
          <span className="text-[11px]">PNG, JPG, WebP · maks 8 MB</span>
        </button>
      )}
      {err && <p className="mt-2 text-xs text-danger">{err}</p>}
    </div>
  )
}
