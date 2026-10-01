'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPostAction(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const post_type = formData.get('post_type') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('posts').insert({
    title, content, post_type, created_by: user?.id, is_published: true, published_at: new Date().toISOString()
  })

  // Create notifications for all students
  const { data: students } = await supabase.from('profiles').select('id').eq('role', 'student')
  if (students) {
    const notifications = students.map(s => ({
      user_id: s.id,
      type: 'ANNOUNCEMENT',
      title: `New ${post_type}: ${title}`,
      message: content.substring(0, 100) + '...'
    }))
    await supabase.from('notifications').insert(notifications)
  }

  revalidatePath('/admin/posts')
  revalidatePath('/student/feed')
}
