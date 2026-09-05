import { ForumFeed } from '../../components/forum/ForumFeed'

export function ForumRT() {
  return (
    <div className="page-enter mx-auto max-w-lg">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Forum</h1>
        <p className="text-sm text-text-secondary">Diskusi &amp; pengumuman untuk warga</p>
      </header>
      <ForumFeed canAnnounce basePath="/rt/forum" />
    </div>
  )
}
