import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <h1 className="text-9xl font-bold text-muted">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-muted mt-2 max-w-sm mb-8">
        The page you are looking for does not exist, has been moved, or you do not have permission to view it.
      </p>
      <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors">
        Return Home
      </Link>
    </div>
  )
}
