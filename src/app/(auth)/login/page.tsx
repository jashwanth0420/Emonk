import { loginAction } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { KeyRound, User, Sparkles } from 'lucide-react'

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const error = (await searchParams).error
  
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-[#F9FAFB]">
      <Card className="relative z-10 w-full max-w-md bg-white rounded-[28px] shadow-xl border border-black/[0.08] p-2">
        <CardHeader className="space-y-1.5 text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#EBFD78] text-[#111315] flex items-center justify-center font-bold mb-1 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#111315]">
            Emonk Attendance
          </CardTitle>
          <CardDescription className="text-xs text-[#737780]">
            Sign in to access your lab attendance and mentoring dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={loginAction} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-2xl border border-red-200 text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[#111315] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#737780]" />
                Email or Student Name
              </Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="e.g. Sarvesh or sarvesh@emonk.edu"
                className="rounded-2xl border-black/[0.08] text-xs h-11 bg-[#F9FAFB]"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-[#111315] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#737780]" />
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password (e.g. sarvesh123)"
                className="rounded-2xl border-black/[0.08] text-xs h-11 bg-[#F9FAFB]"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Quick Helper Note for Students */}
            <div className="p-3 bg-[#F3F4F6] rounded-2xl border border-black/[0.04] text-[11px] text-[#737780] space-y-0.5">
              <strong className="text-[#111315] block font-semibold">Student Default Credentials:</strong>
              <p>Username: Your Name (e.g. <em>Sarvesh</em>)</p>
              <p>Password: Name followed by 123 (e.g. <em>sarvesh123</em>)</p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-[#111215] text-[#EBFD78] hover:bg-black font-bold text-xs transition-all shadow-sm cursor-pointer mt-2"
            >
              Sign In to Platform
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
