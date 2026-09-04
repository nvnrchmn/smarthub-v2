import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { EmptyState, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../context/AuthContext'

interface Thread {
  id_thread: number
  tipe_thread: string
  judul: string
  konten: string
  created_at: string
}

export function ForumWargaPage() {
  const { user } = useAuth()
  const canAnnounce = user?.role === 'ketua_rt' || user?.role === 'super_admin'
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [form, setForm] = useState({ tipe_thread: 'Diskusi', judul: '', konten: '' })

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
      await api('/forum', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm({ tipe_thread: 'Diskusi', judul: '', konten: '' })
      setNotice({ type: 'ok', text: 'Thread berhasil diposting.' })
      load()
    } catch (err: any) {
      setNotice({ type: 'err', text: err.message || 'Gagal memposting thread' })
    }
  }

  const tgl = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Forum Warga</h1>
        <p className="text-xs text-text-secondary">Diskusi & pengumuman lingkungan</p>
      </header>

      {/* Form baru */}
      <form onSubmit={submit} className="mb-5 rounded-2xl border border-border bg-surface-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Buat Thread Baru</h2>
        <div className="space-y-2.5">
          <select
            value={form.tipe_thread}
            onChange={(e) => setForm({ ...form, tipe_thread: e.target.value })}
            aria-label="Jenis thread"
            className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="Diskusi">Diskusi</option>
            {canAnnounce && <option value="Pengumuman">Pengumuman</option>}
          </select>
          <input
            placeholder="Judul"
            required
            autoComplete="off"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            placeholder="Isi konten…"
            required
            rows={3}
            value={form.konten}
            onChange={(e) => setForm({ ...form, konten: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button type="submit" className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-base font-semibold text-white hover:bg-primary/90">
            Posting
          </button>
          {notice && (
            <p role="status" className={`rounded-lg px-3 py-2 text-sm ${notice.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
              {notice.text}
            </p>
          )}
        </div>
      </form>

      {/* List thread */}
      <div className="space-y-3">
        {loading && <div className="space-y-2.5"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>}
        {!loading && threads.length === 0 && (
          <EmptyState icon="chat" title="Belum ada thread" desc="Mulai diskusi pertama di lingkungan RT." />
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
              <p className="mt-1 text-sm text-text-secondary whitespace-pre-line">{t.konten}</p>
              <p className="mt-2 text-xs text-text-secondary">
                {ann ? 'Pengurus RT' : 'Diskusi warga'} • {tgl(t.created_at)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
