export function calculateAttendancePercentage(records: { status: string, schedule_status?: string }[]) {
  const eligible = records.filter(r => r.schedule_status !== 'cancelled')
  const approved = eligible.filter(r => r.status === 'approved')
  
  if (eligible.length === 0) return 0
  return Math.round((approved.length / eligible.length) * 100)
}
