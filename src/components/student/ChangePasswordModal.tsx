'use client'

import { useState, useEffect, useTransition } from 'react'
import { KeyRound, ShieldCheck, X, Check, Eye, EyeOff } from 'lucide-react'
import { changePasswordAction } from '@/app/(protected)/student/profile/actions'

export function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    // Check if user has must_change_password cookie
    if (typeof document !== 'undefined') {
      const hasCookie = document.cookie
        .split(';')
        .some(c => c.trim().startsWith('must_change_password=true'))
      if (hasCookie) {
        setIsOpen(true)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
    // Clear client-side cookie so it doesn't repeatedly nag in the same session
    document.cookie = 'must_change_password=; path=/; max-age=0'
  }

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
        setSuccessMsg('Your password has been successfully updated!')
        setTimeout(() => {
          setIsOpen(false)
        }, 1500)
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-black/[0.08] relative">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#EBFD78] text-[#111315] flex items-center justify-center mb-3">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-[#111315]">
            Set Your New Password
          </h3>
          <p className="text-xs text-[#737780] mt-1 leading-relaxed">
            You are logged in with the default initial password. Please set your personal secure password to protect your account.
          </p>
        </div>

        {successMsg ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#111315]">{successMsg}</p>
            <p className="text-xs text-[#737780]">Continuing to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111315]">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs p-3 pr-10 rounded-2xl bg-[#F9FAFB] border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#111215]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111315]">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Retype your new password"
                className="w-full text-xs p-3 rounded-2xl bg-[#F9FAFB] border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#111215]"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#737780] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Remind Me Later
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-full bg-[#111215] text-[#EBFD78] hover:bg-black font-bold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isPending ? 'Updating...' : 'Save New Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
