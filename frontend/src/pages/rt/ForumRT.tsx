import { ForumFeed } from '../../components/forum/ForumFeed'

export function ForumRT() {
  return (
    <div className="page-enter mx-auto max-w-lg">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Forum Pengurus</h1>
        <p className="text-sm text-text-secondary">Diskusi & pengumuman untuk warga satu RT</p>
      </header>
      <ForumFeed canAnnounce />
    </div>
  )
}
