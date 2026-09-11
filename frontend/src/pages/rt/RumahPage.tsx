import { useToast } from '../../context/ToastContext'
import { useState, useCallback, useEffect } from 'react'
import { api } from '../../lib/api'
import { Icon } from '../../components/ui/Icon'
import { Skeleton } from '../../components/ui/bento'
import { Drawer } from '../../components/ui/Drawer'
import { cn } from '../../lib/utils'

interface Rumah {
  id_rumah: number
  id_tenant: number
  nama_jalan_gang: string
  nomor_rumah: string
  status_hunian: string
  total_penghuni: number
}

interface Warga {
  id_warga: number
  nama_lengkap: string
  no_hp: string
  status_hubungan: string
}

const STATUS_COLOR: Record<string, string> = {
  Dihuni: 'bg-green-100 text-green-700',
  Kosong: 'bg-gray-100 text-gray-500',
  Disewakan: 'bg-amber-100 text-amber-700',
}

export function RumahPage() {
  const { toast } = useToast()
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Rumah | null>(null)
  const [wargas, setWargas] = useState<Warga[]>([])
  const [wargaLoading, setWargaLoading] = useState(false)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Form rumah
  const [openForm, setOpenForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ nama_jalan_gang: '', nomor_rumah: '', status_hunian: 'Dihuni' })
  const [saving, setSaving] = useState(false)

  // Form warga
  const [wargaForm, setWargaForm] = useState<{ id_warga?: number; nama_lengkap: string; nik: string; no_kk: string; status_hubungan: string } | null>(null)
  const [wargaSaving, setWargaSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api('/wilayah/rumah')
      .then(d => setRumahs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const loadWarga = async (rumah?: Rumah) => {
    const r = rumah || selected
    if (!r) return
    setWargaLoading(true)
    try {
      const d = await api(`/wilayah/rumah/${r.id_rumah}/warga`)
      setWargas(Array.isArray(d) ? d : [])
    } catch {
      setWargas([])
    } finally {
      setWargaLoading(false)
    }
  }

  const openDetail = (rumah: Rumah) => {
    setSelected(rumah)
    setWargaForm(null)
    setTimeout(() => loadWarga(rumah), 50)
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ nama_jalan_gang: '', nomor_rumah: '', status_hunian: 'Dihuni' })
    setOpenForm(true)
  }

  const openEdit = (r: Rumah) => {
    setEditingId(r.id_rumah)
    setForm({ nama_jalan_gang: r.nama_jalan_gang, nomor_rumah: r.nomor_rumah, status_hunian: r.status_hunian })
    setOpenForm(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editingId) {
        await api(`/wilayah/rumah/${editingId}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        await api('/wilayah/rumah', { method: 'POST', body: JSON.stringify(form) })
      }
      setOpenForm(false)
      load()
      setNotice({ type: 'ok', text: editingId ? 'Rumah berhasil diupdate' : 'Rumah berhasil ditambahkan' })
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal menyimpan' })
    }
    setSaving(false)
    setTimeout(() => setNotice(null), 3000)
  }

  const remove = async (id: number) => {
    if (!confirm('Yakin hapus rumah ini?')) return
    try {
      await api(`/wilayah/rumah/${id}`, { method: 'DELETE' })
      load()
      setNotice({ type: 'ok', text: 'Rumah berhasil dihapus' })
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal menghapus' })
    }
    setTimeout(() => setNotice(null), 3000)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Daftar Rumah</h1>
          <p className="text-xs text-text-secondary">Total {rumahs.length} rumah terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95">
          <Icon name="plus" size={16} /> Tambah
        </button>
      </header>

      {notice && (
        <div className={cn('mb-3 rounded-xl px-3.5 py-2.5 text-sm', notice.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : rumahs.length === 0 ? (
        <div className="py-16 text-center text-sm text-text-secondary">Belum ada rumah terdaftar.</div>
      ) : (
        <div className="space-y-2">
          {rumahs.map(r => (
            <div key={r.id_rumah} className="rounded-2xl border border-border bg-surface-card p-3.5">
              <button onClick={() => openDetail(r)} className="w-full flex items-center gap-3 text-left">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <Icon name="home" size={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary truncate">{r.nama_jalan_gang} No. {r.nomor_rumah}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLOR[r.status_hunian] || 'bg-gray-100 text-gray-500')}>{r.status_hunian}</span>
                    <span className="text-[11px] text-text-secondary flex items-center gap-1"><Icon name="users" size={12} /> {r.total_penghuni} penghuni</span>
                  </div>
                </div>
                <Icon name="chevron" size={16} className="shrink-0 text-text-secondary" />
              </button>
              <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/50 pt-2">
                <button onClick={() => openEdit(r)} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:bg-text-disabled/10"><Icon name="user" size={12} /> Edit</button>
                <button onClick={() => remove(r.id_rumah)} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-danger hover:bg-red-50"><Icon name="trash" size={12} /> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer: Warga CRUD */}
      <Drawer open={!!selected} onClose={() => { setSelected(null); setWargaForm(null); }} title={selected ? `${selected.nama_jalan_gang} No. ${selected.nomor_rumah}` : ''} subtitle={selected?.status_hunian}>
        {!wargaForm ? (
          <>
            <div className="mb-3 flex justify-end">
              <button onClick={() => setWargaForm({ nama_lengkap: '', nik: '', no_kk: '', status_hubungan: 'Kepala Keluarga' })} className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white"><Icon name="plus" size={14} /> Tambah Warga</button>
            </div>
            {wargaLoading ? (
              <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-14" />)}</div>
            ) : wargas.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-secondary">Belum ada warga di rumah ini.</div>
            ) : (
              <div className="space-y-2">
                {wargas.map(w => (
                  <div key={w.id_warga} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{w.nama_lengkap[0]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">{w.nama_lengkap}</p>
                      <p className="text-[11px] text-text-secondary">{w.status_hubungan}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setWargaForm({ id_warga: w.id_warga, nama_lengkap: w.nama_lengkap, nik: '', no_kk: '', status_hubungan: w.status_hubungan })} className="rounded-lg px-2 py-1 text-[11px] text-text-secondary hover:bg-text-disabled/10">Edit</button>
                      <button onClick={async () => { if (!confirm('Hapus warga ini?')) return; await api(`/warga/${w.id_warga}`, { method: 'DELETE' }); loadWarga(); load(); }} className="rounded-lg px-2 py-1 text-[11px] text-danger hover:bg-red-50">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault()
            setWargaSaving(true)
            try {
              if (wargaForm.id_warga) {
                await api(`/warga/${wargaForm.id_warga}`, { method: 'PUT', body: JSON.stringify({ nama_lengkap: wargaForm.nama_lengkap, status_hubungan: wargaForm.status_hubungan, ...(wargaForm.nik && { nik: wargaForm.nik }), ...(wargaForm.no_kk && { no_kk: wargaForm.no_kk }) }) })
              } else {
                await api('/warga', { method: 'POST', body: JSON.stringify({ ...wargaForm, id_rumah: selected!.id_rumah, id_tenant: selected!.id_tenant }) })
              }
              setWargaForm(null)
              loadWarga()
              load()
            } catch (e: any) {
              toast(e.message || 'Gagal menyimpan', 'error')
            } finally {
              setWargaSaving(false)
            }
          }} className="space-y-3">
            <div><label className="mb-1 block text-xs font-medium text-text-secondary">Nama Lengkap</label><input required value={wargaForm.nama_lengkap} onChange={e => setWargaForm({ ...wargaForm, nama_lengkap: e.target.value })} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm" /></div>
            <div><label className="mb-1 block text-xs font-medium text-text-secondary">NIK</label><input value={wargaForm.nik || ''} onChange={e => setWargaForm({ ...wargaForm, nik: e.target.value })} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm" placeholder="Opsional" /></div>
            <div><label className="mb-1 block text-xs font-medium text-text-secondary">No KK</label><input value={wargaForm.no_kk || ''} onChange={e => setWargaForm({ ...wargaForm, no_kk: e.target.value })} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm" placeholder="Opsional" /></div>
            <div><label className="mb-1 block text-xs font-medium text-text-secondary">Status Hubungan</label><select value={wargaForm.status_hubungan} onChange={e => setWargaForm({ ...wargaForm, status_hubungan: e.target.value })} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"><option>Kepala Keluarga</option><option>Istri</option><option>Anak</option><option>Orang Tua</option><option>Lainnya</option></select></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={wargaSaving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-50">{wargaSaving ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={() => setWargaForm(null)} className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary">Batal</button>
            </div>
          </form>
        )}
      </Drawer>

      {/* Form Tambah/Edit Rumah Drawer */}
      <Drawer open={openForm} onClose={() => setOpenForm(false)} title={editingId ? 'Edit Rumah' : 'Tambah Rumah'}>
        <div className="space-y-4">
          <div><label className="mb-1 block text-xs font-medium text-text-secondary">Nama Jalan / Gang</label><input value={form.nama_jalan_gang} onChange={e => setForm({ ...form, nama_jalan_gang: e.target.value })} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm" placeholder="Contoh: Jl. Mawar" /></div>
          <div><label className="mb-1 block text-xs font-medium text-text-secondary">Nomor Rumah</label><input value={form.nomor_rumah} onChange={e => setForm({ ...form, nomor_rumah: e.target.value })} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm" placeholder="Contoh: 12" /></div>
          <div><label className="mb-1 block text-xs font-medium text-text-secondary">Status Hunian</label><select value={form.status_hunian} onChange={e => setForm({ ...form, status_hunian: e.target.value })} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"><option>Dihuni</option><option>Kosong</option><option>Disewakan</option></select></div>
          <button onClick={save} disabled={saving || !form.nama_jalan_gang || !form.nomor_rumah} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Rumah'}
          </button>
        </div>
      </Drawer>
    </div>
  )
}
