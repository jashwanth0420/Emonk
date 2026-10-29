import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      {/* Restyled White Top Bar with 1px border and Emonk Wordmark */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6 bg-surface z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight text-text">
            Emonk
          </span>
          <span className="h-2 w-2 rounded-full bg-accent inline-block" />
        </div>
        <form action={logoutAction}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="text-muted hover:text-text hover:bg-[#F5F5F3] dark:hover:bg-[#2A2A2D] text-xs font-medium px-3 py-1.5 transition-colors"
          >
            Logout
          </Button>
        </form>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
