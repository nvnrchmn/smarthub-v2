import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

interface Rumah {
  id_rumah: number
  nama_jalan_gang: string
  nomor_rumah: string
  status_hunian: string
}

export function RTRumahPage() {
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nama_jalan_gang: '', nomor_rumah: '', status_hunian: 'Dihuni' })
  const [msg, setMsg] = useState('')

  const load = async () => {
    const d = await api('wilayah/rumah?tenant_id=1')
    setRumahs(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    try {
      await api('wilayah/rumah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 1, ...form }),
      })
      setForm({ nama_jalan_gang: '', nomor_rumah: '', status_hunian: 'Dihuni' })
      setMsg('Rumah berhasil ditambahkan ✅')
      load()
    } catch {
      setMsg('Gagal menambahkan rumah')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Kelola Rumah</h1>
        <p className="text-sm text-text-secondary">Data rumah di lingkungan RT</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form tambah */}
        <form onSubmit={submit} className="rounded-2xl border border-border bg-surface-card p-4">
          <h2 className="mb-3 text-base font-semibold text-text-primary">Tambah Rumah</h2>
          <div className="space-y-3">
            <input
              placeholder="Nama jalan / gang (cth: Gang Melati)"
              required
              value={form.nama_jalan_gang}
              onChange={(e) => setForm({ ...form, nama_jalan_gang: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              placeholder="Nomor rumah (cth: A10)"
              required
              value={form.nomor_rumah}
              onChange={(e) => setForm({ ...form, nomor_rumah: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <select
              value={form.status_hunian}
              onChange={(e) => setForm({ ...form, status_hunian: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="Dihuni">Dihuni</option>
              <option value="Kosong">Kosong</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-white min-h-[44px]"
            >
              Simpan
            </button>
            {msg && <p className="text-sm text-green-700" role="alert">{msg}</p>}
          </div>
        </form>

        {/* List rumah */}
        <div className="space-y-2.5">
          {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
          {!loading && rumahs.length === 0 && <p className="text-sm text-text-secondary">Belum ada data.</p>}
          {rumahs.map((r) => (
            <div key={r.id_rumah} className="flex items-center gap-3 rounded-xl border border-border bg-surface-card p-4">
              <span className={`h-10 w-1 rounded-full ${r.status_hunian === 'Dihuni' ? 'bg-green-600' : 'bg-gray-400'}`} />
              <div className="flex-1">
                <p className="font-semibold text-text-primary">
                  {r.nama_jalan_gang} {r.nomor_rumah}
                </p>
                <p className="text-xs text-text-secondary">{r.status_hunian}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
