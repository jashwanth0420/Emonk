'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function loginAction(formData: FormData) {
  const identifier = ((formData.get('email') as string) || '').trim()
  const password = ((formData.get('password') as string) || '').trim()

  if (!identifier || !password) {
    return redirect('/login?error=' + encodeURIComponent('Please enter your name or email, and password.'))
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  let emailToUse = identifier

  // If identifier is not an email, find student or tutor by full_name or register_number
  if (!identifier.includes('@')) {
    // 1. Direct case-insensitive full name match
    const { data: matchedProfile } = await adminClient
      .from('profiles')
      .select('email, id, full_name')
      .ilike('full_name', identifier)
      .limit(1)
      .maybeSingle()

    if (matchedProfile?.email) {
      emailToUse = matchedProfile.email
    } else {
      // 2. Slug match (e.g. user typed "sarvesh", "priyadarshini", or register number)
      const cleanSlug = identifier.toLowerCase().replace(/[^a-z0-9]/g, '')
      const { data: allProfiles } = await adminClient
        .from('profiles')
        .select('email, full_name, register_number')

      const found = allProfiles?.find(p => {
        const pSlug = p.full_name?.toLowerCase().replace(/[^a-z0-9]/g, '')
        const regSlug = p.register_number?.toLowerCase()
        return pSlug === cleanSlug || (regSlug && regSlug === cleanSlug) || (p.email && p.email.startsWith(cleanSlug + '@'))
      })

      if (found?.email) {
        emailToUse = found.email
      } else {
        emailToUse = `${cleanSlug}@emonk.edu`
      }
    }
  }

  // 1. Attempt login with provided password
  let { error, data } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password: password
  })

  // 2. If failed, try case-insensitive lowercase (e.g. user typed SARVESH123 or Sarvesh123)
  if (error && password !== password.toLowerCase()) {
    const retry = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password.toLowerCase()
    })
    if (!retry.error && retry.data?.user) {
      error = null
      data = retry.data
    }
  }

  // 3. If failed and password didn't have 123, try appending 123
  if (error && !password.endsWith('123')) {
    const retry2 = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: `${password.toLowerCase()}123`
    })
    if (!retry2.error && retry2.data?.user) {
      error = null
      data = retry2.data
    }
  }

  if (error || !data?.user) {
    return redirect('/login?error=' + encodeURIComponent(error?.message || 'Invalid credentials. Default password is your name followed by 123.'))
  }

  // Use admin client to query user role
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const role = profile?.role || 'student'
  const basePath = (role === 'super_admin' || role === 'admin') ? 'admin' : role

  // Store user role and user id in fast cookies
  const cookieStore = await (await import('next/headers')).cookies()
  cookieStore.set('user_role', role, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  cookieStore.set('user_id', data.user.id, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })

  // Flag if student needs to change their initial password
  const mustChange = Boolean(data.user.user_metadata?.must_change_password)
  if (mustChange && role === 'student') {
    cookieStore.set('must_change_password', 'true', { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 })
  }

  redirect(`/${basePath}/dashboard`)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = await (await import('next/headers')).cookies()
  cookieStore.delete('user_role')
  cookieStore.delete('user_id')
  cookieStore.delete('must_change_password')
  redirect('/login')
}
