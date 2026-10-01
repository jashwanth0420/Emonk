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
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6 bg-background">
        <h2 className="font-semibold text-lg">Emonk Attendance</h2>
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" type="submit">Logout</Button>
        </form>
      </header>
      <main className="flex-1 bg-muted/10">
        {children}
      </main>
    </div>
  )
}
