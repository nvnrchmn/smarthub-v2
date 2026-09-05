import { useState } from 'react'
import { api } from '../../lib/api'

export function BroadcastPage() {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState({ title: '', message: '', tipe: 'all' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.message) {
      setErr('Judul dan pesan wajib diisi')
      return
    }
    setLoading(true)
    setErr('')
    setOk('')
    try {
      await api('/admin/broadcasts', {
        method: 'POST',
        body: JSON.stringify({ title: form.title, message: form.message, tipe: form.tipe }),
      })
      setOk('Broadcast berhasil dikirim')
      setForm({ title: '', message: '', tipe: 'all' })
    } catch (e: any) {
      setErr(e.message || 'Gagal mengirim broadcast')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Broadcast Pengumuman</h1>
        <p className="text-sm text-text-secondary">Kirim pengumuman ke seluruh tenant atau user</p>
      </header>

      {err && (
        <div className="mb-4 rounded-xl bg-danger/10 p-4 text-sm text-danger">{err}</div>
      )}
      {ok && (
        <div className="mb-4 rounded-xl bg-success/10 p-4 text-sm text-success">{ok}</div>
      )}

      <form onSubmit={submit} className="rounded-2xl border border-border bg-surface-card p-6 space-y-4">
        <div>
          <label htmlFor="bc-judul" className="mb-1.5 block text-sm font-medium text-text-secondary">Judul</label>
          <input
            id="bc-judul"
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Judul pengumuman"
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-text-primary placeholder:text-text-disabled"
          />
        </div>

        <div>
          <label htmlFor="bc-tipe" className="mb-1.5 block text-sm font-medium text-text-secondary">Target</label>
          <select
            id="bc-tipe"
            value={form.tipe}
            onChange={e => setForm({ ...form, tipe: e.target.value })}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-text-primary"
          >
            <option value="all">Semua User</option>
            <option value="tenant">Tenant Tertentu</option>
            <option value="role">Role Tertentu</option>
          </select>
        </div>

        <div>
          <label htmlFor="bc-pesan" className="mb-1.5 block text-sm font-medium text-text-secondary">Pesan</label>
          <textarea
            id="bc-pesan"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="Tulis pesan pengumuman..."
            rows={5}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-disabled"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Kirim Broadcast'}
        </button>
      </form>
    </div>
  )
}