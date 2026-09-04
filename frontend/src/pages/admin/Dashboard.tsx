export function AdminDashboard() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-4">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Dashboard Super Admin</h1>
        <p className="text-sm text-text-secondary">Kelola semua tenant dan sistem</p>
      </header>
      <div className="rounded-xl bg-surface-card p-8 text-center">
        <p className="text-4xl mb-2">🏢</p>
        <p className="text-sm text-text-secondary">Kelola tenants, pembayaran, dan pengaturan sistem dari sini.</p>
      </div>
    </div>
  )
}
