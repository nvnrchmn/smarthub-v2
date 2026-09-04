export function ForumPage() {
  const threads = [
    { id_thread: 1, judul: 'Peraturan Baru Parkir', tipe_thread: 'Pengumuman', created_at: '2026-09-04' },
    { id_thread: 2, judul: 'Jadwal Posy Minggu Ini', tipe_thread: 'Diskusi', created_at: '2026-09-03' },
  ]
  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Forum Warga</h1>
      </header>
      <div className="space-y-3">
        {threads.map(t => (
          <div key={t.id_thread} className={`rounded-xl p-4 ${t.tipe_thread === 'Pengumuman' ? 'bg-primary-50' : 'bg-surface-card border border-primary-100'}`}>
            <p className="font-medium text-text-primary">{t.judul}</p>
            <p className="text-xs text-text-secondary">{t.tipe_thread} • {t.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LapakPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Lapak Warga</h1>
      </header>
      <p className="text-sm text-text-secondary">Belum ada produk yang dijual.</p>
    </div>
  )
}
