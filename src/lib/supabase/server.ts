import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The setAll method was called from a Server Component.
          }
        },
      },
    }
  )
}

export async function getFastUser(): Promise<{ id: string; role: string } | null> {
  const { headers } = await import('next/headers')
  const headerList = await headers()
  const cookieStore = await cookies()

  const id = headerList.get('x-user-id') || cookieStore.get('user_id')?.value
  const role = headerList.get('x-user-role') || cookieStore.get('user_role')?.value || 'student'

  if (id) {
    return { id, role }
  }

  // Fallback to supabase auth getUser
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? { id: user.id, role } : null
}
