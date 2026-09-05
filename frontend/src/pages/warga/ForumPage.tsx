import { ForumFeed } from '../../components/forum/ForumFeed'

export function ForumWargaPage() {
  return (
    <div className="page-enter mx-auto max-w-md px-4 pt-4">
      <header className="mb-1">
        <h1 className="text-xl font-bold text-text-primary">Forum Warga</h1>
      </header>
      <ForumFeed canAnnounce={false} />
    </div>
  )
}
