import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { revalidatePath } from 'next/cache'

export default async function TopicsPage() {
  const supabase = await createClient()
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .order('name', { ascending: true })

  async function createTopicAction(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string

    const supabase = await createClient()
    await supabase.from('topics').insert({ name, category, description })
    revalidatePath('/admin/topics')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Learning Topics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-lg p-4 bg-card h-fit">
          <h2 className="text-lg font-semibold mb-4">Create New Topic</h2>
          <form action={createTopicAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Topic Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Binary Search" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required placeholder="e.g. DSA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Brief description..." />
            </div>
            <Button type="submit" className="w-full">Create Topic</Button>
          </form>
        </div>

        <div className="md:col-span-2 border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics?.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">{topic.name}</TableCell>
                  <TableCell>{topic.category}</TableCell>
                  <TableCell>{topic.is_active ? 'Active' : 'Inactive'}</TableCell>
                </TableRow>
              ))}
              {topics?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No topics found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
