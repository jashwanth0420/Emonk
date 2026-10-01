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
  
  const basePath = (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : (profile?.role || 'student')
  redirect(`/${basePath}/dashboard`)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
