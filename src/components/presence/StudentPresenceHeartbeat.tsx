'use client'

import { useEffect } from 'react'
import { pingStudentPresenceAction } from '@/app/(protected)/student/actions'

export function StudentPresenceHeartbeat() {
  useEffect(() => {
    // Ping immediately on mount
    pingStudentPresenceAction()

    // Heartbeat every 90 seconds while tab is active
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        pingStudentPresenceAction()
      }
    }, 90000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingStudentPresenceAction()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null
}
