import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'

interface Thread {
  id_thread: number
  tipe_thread: string
  judul: string
  konten: string
  created_at: string
}

export function ForumRT() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [form, setForm] = useState({ tipe_thread: 'Pengumuman', judul: '', konten: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api(`/forum?tenant_id=${user?.tenant_id ?? 1}`)
      .then((d) => setThreads(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [user])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    try {
      await api('/forum', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setForm({ tipe_thread: 'Pengumuman', judul: '', konten: '' })
      load()
    } catch (err: any) {
      setMsg(err.message || 'Gagal membuat thread')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Forum &amp; Pengumuman</h1>
      </header>

      <form onSubmit={submit} className="mb-6 space-y-2 rounded-2xl bg-surface-card p-4">
        <p className="text-sm font-medium text-text-primary">Buat pengumuman / diskusi</p>
        <select value={form.tipe_thread} onChange={(e) => setForm({ ...form, tipe_thread: e.target.value })} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm">
          <option>Pengumuman</option>
          <option>Diskusi</option>
        </select>
        <input placeholder="Judul" required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm" />
        <textarea placeholder="Isi..." required value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} rows={2} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm" />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white min-h-[44px]">Kirim</button>
      </form>

      <div className="space-y-3">
        {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
        {!loading && threads.length === 0 && <p className="text-sm text-text-secondary">Belum ada thread.</p>}
        {threads.map((t) => (
          <div key={t.id_thread} className={`rounded-2xl p-4 ${t.tipe_thread === 'Pengumuman' ? 'bg-primary-50' : 'bg-surface-card border border-primary-100'}`}>
            <span className="text-[11px] font-medium uppercase text-primary">{t.tipe_thread}</span>
            <p className="mt-1 font-medium text-text-primary">{t.judul}</p>
            <p className="text-sm text-text-secondary line-clamp-2">{t.konten}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
