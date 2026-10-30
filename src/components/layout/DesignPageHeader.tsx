'use client'

import Link from 'next/link'
import { Settings, Plus, Sparkles, LucideIcon } from 'lucide-react'

interface DesignPageHeaderProps {
  firstLinePrefix?: string
  firstLinePillIcon?: LucideIcon
  firstLineSuffix?: string
  secondLinePrefix?: string
  secondLinePillIcon?: LucideIcon
  secondLineSuffix?: string
  actionLabel?: string
  actionHref?: string
  settingsHref?: string
}

export function DesignPageHeader({
  firstLinePrefix = 'Managing',
  firstLinePillIcon: FirstIcon = Settings,
  firstLineSuffix = 'Your Team',
  secondLinePrefix = 'and',
  secondLinePillIcon: SecondIcon = Sparkles,
  secondLineSuffix = 'Workflows',
  actionLabel = '+ Create a New Schedule',
  actionHref = '/admin/schedules',
  settingsHref = '/admin/analytics',
}: DesignPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
      {/* Big Playful Headline with Inline Rounded Badges */}
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-bold tracking-[-0.03em] text-[#111215] leading-[1.15]">
          <span>{firstLinePrefix}</span>{' '}
          <span className="inline-flex items-center justify-center mx-1 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-sm align-middle translate-y-[-2px]">
            <FirstIcon className="w-4 h-4 text-[#111215]" />
          </span>{' '}
          <span>{firstLineSuffix}</span>
          <br className="hidden sm:inline" />
          <span className="inline-block sm:mt-1">
            <span>{secondLinePrefix}</span>{' '}
            <span className="inline-flex items-center justify-center mx-1 px-3 py-1.5 rounded-full bg-[#EBFD78] text-[#111215] shadow-sm align-middle translate-y-[-2px]">
              <SecondIcon className="w-4 h-4 text-[#111215]" />
            </span>{' '}
            <span>{secondLineSuffix}</span>
          </span>
        </h1>
      </div>

      {/* Action Controls matching image (Settings Circle + Black Rounded Pill) */}
      <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
        {settingsHref && (
          <Link
            href={settingsHref}
            className="w-10 h-10 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[#111215] hover:bg-gray-50 shadow-sm transition-all"
            title="Settings & Analytics"
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="h-10 px-5 rounded-full bg-[#111215] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 hover:bg-black shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel.replace(/^\+\s*/, '')}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
