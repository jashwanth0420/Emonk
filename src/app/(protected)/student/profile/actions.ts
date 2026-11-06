'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { profileSchema } from '@/lib/validations/profile'
import { cookies } from 'next/headers'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rawData = {
    bio: (formData.get('bio') as string)?.trim() || '',
    linkedin_url: (formData.get('linkedin_url') as string)?.trim() || null,
    github_url: (formData.get('github_url') as string)?.trim() || null,
    leetcode_url: (formData.get('leetcode_url') as string)?.trim() || null,
    hackerrank_url: (formData.get('hackerrank_url') as string)?.trim() || null,
  }

  const result = profileSchema.safeParse(rawData)
  if (!result.success) {
    const errorMsg = result.error.issues?.[0]?.message || (result.error as any).errors?.[0]?.message || 'Invalid input'
    redirect(`/student/profile?error=${encodeURIComponent(errorMsg)}`)
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update(result.data)
    .eq('id', user.id)

  if (error) {
    redirect(`/student/profile?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/student/profile')
  redirect('/student/profile?success=Profile+successfully+updated!')
}

export async function changePasswordAction(formData: FormData) {
  const newPassword = ((formData.get('new_password') as string) || '').trim()
  const confirmPassword = ((formData.get('confirm_password') as string) || '').trim()

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match. Please verify and retype.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Session expired. Please sign in again.' }
  }

  // Update password in Supabase Auth & clear must_change_password flag
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    data: { must_change_password: false }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Clear cookie
  const cookieStore = await cookies()
  cookieStore.delete('must_change_password')

  revalidatePath('/student/dashboard')
  revalidatePath('/student/profile')

  return { success: true }
}
