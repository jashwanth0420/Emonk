import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPostAction } from './actions'

export default async function AdminPostsPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('posts').select('*, profiles(full_name)').order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Announcements Feed</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-lg p-4 bg-card h-fit">
          <h2 className="text-lg font-semibold mb-4">Create Post</h2>
          <form action={createPostAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post_type">Type</Label>
              <select id="post_type" name="post_type" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
                <option value="deadline">Deadline</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" required className="min-h-[150px]" />
            </div>
            <Button type="submit" className="w-full">Publish to Feed</Button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Published Posts</h2>
          {posts?.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Posted by {post.profiles?.full_name} - {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase bg-muted px-2 py-1 rounded">{post.post_type}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
          {(!posts || posts.length === 0) && (
            <p className="text-center py-10 text-muted-foreground border rounded-md">No announcements yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}