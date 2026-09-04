import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

interface Warga {
  id_warga: number
  id_rumah: number
  nama_lengkap: string
  status_hubungan: string
  status_warga: string
}

export function RTWargaPage() {
  const [wargas, setWargas] = useState<Warga[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    tenant_id: 1,
    id_rumah: 1,
    nama_lengkap: '',
    nomor_ktp: '',
    nomor_kk: '',
    status_hubungan: 'Kepala Keluarga',
    status_warga: 'Tetap',
  })

  const load = async () => {
    try {
      const d = await api('/warga?tenant_id=1')
      setWargas(Array.isArray(d) ? d : [])
    } catch (e: any) {
      setMsg(e.message || 'Gagal memuat data warga')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    try {
      await api('/warga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setForm({ ...form, nama_lengkap: '', nomor_ktp: '', nomor_kk: '' })
      setMsg('Warga berhasil ditambahkan ✅')
      load()
    } catch {
      setMsg('Gagal menambahkan warga')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Kelola Warga</h1>
        <p className="text-sm text-text-secondary">Data warga terdaftar</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form tambah */}
        <form onSubmit={submit} className="rounded-2xl border border-border bg-surface-card p-4">
          <h2 className="mb-3 text-base font-semibold text-text-primary">Tambah Warga</h2>
          <div className="space-y-3">
            <input
              placeholder="Nama lengkap"
              required
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              placeholder="Nomor KTP"
              value={form.nomor_ktp}
              onChange={(e) => setForm({ ...form, nomor_ktp: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              placeholder="Nomor KK"
              value={form.nomor_kk}
              onChange={(e) => setForm({ ...form, nomor_kk: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="number"
              placeholder="ID Rumah (cth: 1)"
              required
              value={form.id_rumah}
              onChange={(e) => setForm({ ...form, id_rumah: Number(e.target.value) })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <select
              value={form.status_warga}
              onChange={(e) => setForm({ ...form, status_warga: e.target.value })}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="Tetap">Tetap</option>
              <option value="Aktif">Aktif</option>
              <option value="Pindah">Pindah</option>
              <option value="Meninggal">Meninggal</option>
            </select>
            <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-base font-medium text-white min-h-[44px]">
              Simpan
            </button>
            {msg && <p className="text-sm text-green-700" role="alert">{msg}</p>}
          </div>
        </form>

        {/* List warga */}
        <div className="space-y-2.5">
          {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
          {!loading && wargas.length === 0 && <p className="text-sm text-text-secondary">Belum ada data.</p>}
          {wargas.map((w) => (
            <div key={w.id_warga} className="flex items-center gap-3 rounded-xl border border-border bg-surface-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 font-bold text-primary">
                {w.nama_lengkap.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">{w.nama_lengkap}</p>
                <p className="text-xs text-text-secondary">
                  Rumah #{w.id_rumah} • {w.status_hubungan} • {w.status_warga}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
