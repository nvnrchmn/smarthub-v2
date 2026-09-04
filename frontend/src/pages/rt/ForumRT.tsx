import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { EmptyState, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'

interface Thread {
  id_thread: number
  tipe_thread: string
  judul: string
  konten: string
  created_at: string
}

const tgl = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function ForumRT() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [form, setForm] = useState({ tipe_thread: 'Pengumuman', judul: '', konten: '' })
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const d = await api('/forum')
      setThreads(Array.isArray(d) ? d : [])
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal memuat forum' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)
    try {
      await api('/forum', { method: 'POST', body: JSON.stringify(form) })
      setForm({ tipe_thread: 'Pengumuman', judul: '', konten: '' })
      setNotice({ type: 'ok', text: 'Thread berhasil diposting.' })
      load()
    } catch (err: any) {
      setNotice({ type: 'err', text: err.message || 'Gagal membuat thread' })
    }
  }

  const inputCls =
    'w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-base placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Forum &amp; Pengumuman</h1>
        <p className="text-xs text-text-secondary">Kelola pengumuman dan diskusi warga</p>
      </header>

      <form onSubmit={submit} className="mb-6 space-y-2.5 rounded-2xl border border-border bg-surface-card p-4">
        <p className="text-sm font-medium text-text-primary">Buat pengumuman / diskusi</p>
        <select value={form.tipe_thread} onChange={(e) => setForm({ ...form, tipe_thread: e.target.value })} aria-label="Jenis thread" className={inputCls}>
          <option>Pengumuman</option>
          <option>Diskusi</option>
        </select>
        <input placeholder="Judul" required autoComplete="off" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className={inputCls} />
        <textarea placeholder="Isi…" required value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} rows={3} className={inputCls} />
        <button type="submit" className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-base font-semibold text-white hover:bg-primary/90">
          Kirim
        </button>
        {notice && (
          <p role="status" className={`rounded-lg px-3 py-2 text-sm ${notice.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
            {notice.text}
          </p>
        )}
      </form>

      <div className="space-y-3">
        {loading && <div className="space-y-2.5"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>}
        {!loading && threads.length === 0 && (
          <EmptyState icon="chat" title="Belum ada thread" desc="Pengumuman atau diskusi akan tampil di sini." />
        )}
        {threads.map((t) => {
          const ann = t.tipe_thread === 'Pengumuman'
          return (
            <div
              key={t.id_thread}
              className={`rounded-xl p-4 ${ann ? 'border border-primary-100 bg-primary-50' : 'border border-border bg-surface-card'}`}
            >
              {ann && (
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
                  <Icon name="megaphone" size={12} aria-hidden />
                  Pengumuman
                </span>
              )}
              <p className="font-medium text-text-primary">{t.judul}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-text-secondary">{t.konten}</p>
              <p className="mt-2 text-xs text-text-secondary">{ann ? 'Pengurus RT' : 'Diskusi warga'} • {tgl(t.created_at)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
