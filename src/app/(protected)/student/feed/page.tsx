import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default async function StudentFeedPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(full_name)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Central Feed</h1>
      </div>

      <div className="space-y-6">
        {posts?.map((post) => (
          <Card key={post.id} className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Posted by {post.profiles?.full_name} - {new Date(post.published_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {post.post_type}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-gray-700">{post.content}</p>
            </CardContent>
          </Card>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
            No active announcements. Check back later!
          </div>
        )}
      </div>
    </div>
  )
}