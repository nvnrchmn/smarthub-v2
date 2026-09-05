import { useRef, useState } from 'react'
import { uploadFoto } from '../../lib/upload'
import { Icon } from './Icon'
import { cn } from '../../lib/utils'

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
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={sibuk}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-4 text-sm font-medium text-text-secondary transition-colors active:scale-[.98] disabled:opacity-60">
          <Icon name="plus" size={15} />
          {sibuk ? 'Mengunggah…' : tampil ? 'Ganti foto' : 'Pilih foto'}
        </button>
        {tampil && (
          <button type="button" onClick={() => onChange('')} aria-label="Hapus foto"
            className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface-card text-text-secondary hover:text-danger">
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
      {tampil ? (
        <div className="mt-3 flex items-center gap-3">
          <img src={value} alt="Pratinjau produk" className="h-16 w-16 rounded-xl border border-border object-cover" />
          <span className={cn('truncate text-xs', err ? 'text-danger' : 'text-text-secondary')}>{err || 'Terunggah — foto akan tampil di Lapak.'}</span>
        </div>
      ) : (
        err && <p className="mt-2 text-xs text-danger">{err}</p>
      )}
    </div>
  )
}
