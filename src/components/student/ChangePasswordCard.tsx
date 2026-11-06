'use client'

import { useState, useTransition } from 'react'
import { KeyRound, Check, Eye, EyeOff } from 'lucide-react'
import { changePasswordAction } from '@/app/(protected)/student/profile/actions'

export function ChangePasswordCard() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    const formData = new FormData()
    formData.append('new_password', newPassword)
    formData.append('confirm_password', confirmPassword)

    startTransition(async () => {
      const res = await changePasswordAction(formData)
      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to update password')
      } else {
        setSuccessMsg('Your password has been changed successfully!')
        setNewPassword('')
        setConfirmPassword('')
      }
    })
  }

  return (
    <div className="max-w-2xl rounded-[28px] border border-black/[0.06] bg-white shadow-sm p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EBFD78] text-[#111315] flex items-center justify-center">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-[#111315]">Change Account Password</h3>
          <p className="text-xs text-[#737780] mt-0.5">
            Update your personal login password. Must be at least 6 characters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#111315]">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-xs p-3 pr-9 rounded-2xl bg-[#F9FAFB] border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#111215]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#111315]">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Retype password"
              className="w-full text-xs p-3 rounded-2xl bg-[#F9FAFB] border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#111215]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#111215] hover:bg-black text-[#EBFD78] font-bold text-xs px-6 py-2.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
