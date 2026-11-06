import { StudentPresenceHeartbeat } from '@/components/presence/StudentPresenceHeartbeat'
import { ChangePasswordModal } from '@/components/student/ChangePasswordModal'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-[1520px] mx-auto w-full min-w-0 overflow-x-hidden">
      <StudentPresenceHeartbeat />
      <ChangePasswordModal />
      {children}
    </div>
  )
}
