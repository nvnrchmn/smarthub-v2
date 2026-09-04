import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

interface Thread {
  id_thread: number
  tipe_thread: string
  judul: string
  konten: string
  created_at: string
}

export function ForumWargaPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ tipe_thread: 'Diskusi', judul: '', konten: '' })

  const load = async () => {
    const d = await api('forum?tenant_id=1')
    setThreads(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    try {
      await api('forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 1, ...form }),
      })
      setForm({ tipe_thread: 'Diskusi', judul: '', konten: '' })
      setMsg('Thread berhasil diposting ✅')
      load()
    } catch {
      setMsg('Gagal memposting thread')
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
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="Diskusi">Diskusi</option>
            <option value="Pengumuman">Pengumuman</option>
          </select>
          <input
            placeholder="Judul"
            required
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            placeholder="Isi konten…"
            required
            rows={2}
            value={form.konten}
            onChange={(e) => setForm({ ...form, konten: e.target.value })}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-white min-h-[44px]">
            Posting
          </button>
          {msg && <p className="text-sm text-green-700" role="alert">{msg}</p>}
        </div>
      </form>

      {/* List thread */}
      <div className="space-y-3">
        {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
        {threads.map((t) => (
          <div
            key={t.id_thread}
            className={`rounded-xl p-4 ${t.tipe_thread === 'Pengumuman' ? 'bg-primary-50' : 'bg-surface-card border border-border'}`}
          >
            <p className="font-medium text-text-primary">{t.judul}</p>
            <p className="mt-1 text-sm text-text-secondary">{t.konten}</p>
            <p className="mt-2 text-xs text-text-secondary">
              {t.tipe_thread} • {tgl(t.created_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
