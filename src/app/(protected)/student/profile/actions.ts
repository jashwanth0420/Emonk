'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { profileSchema } from '@/lib/validations/profile'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const rawData = {
    bio: formData.get('bio') as string,
    linkedin_url: formData.get('linkedin_url') as string,
    github_url: formData.get('github_url') as string,
    leetcode_url: formData.get('leetcode_url') as string,
    hackerrank_url: formData.get('hackerrank_url') as string,
  }

  const result = profileSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { error } = await supabase
    .from('profiles')
    .update(result.data)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student/profile')
  return { success: true }
}
