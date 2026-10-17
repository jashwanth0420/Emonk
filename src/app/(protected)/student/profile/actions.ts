'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { profileSchema } from '@/lib/validations/profile'

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
    redirect(`/student/profile?error=${encodeURIComponent(result.error.errors[0].message)}`)
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
