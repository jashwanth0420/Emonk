'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import { createAdminClient } from '@/lib/supabase/admin'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  const { error, data } = await supabase.auth.signInWithPassword({ email, password })
  
  if (error) {
    // In a real implementation we would return the error to the frontend state
    // For now, we return it or redirect with an error param
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }
  
  // Use admin client to bypass RLS infinite recursion
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', data.user.id).single()
  
  const role = profile?.role || 'student'
  const basePath = (role === 'super_admin' || role === 'admin') ? 'admin' : role

  // Store user role in a fast cookie to eliminate DB roundtrips in middleware
  const cookieStore = await (await import('next/headers')).cookies()
  cookieStore.set('user_role', role, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })

  redirect(`/${basePath}/dashboard`)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = await (await import('next/headers')).cookies()
  cookieStore.delete('user_role')
  redirect('/login')
}
