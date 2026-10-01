export type AttendanceStatus =
  | 'not_started'
  | 'checked_in'
  | 'question_assigned'
  | 'answer_submitted'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'cancelled';

const VALID_TRANSITIONS: Record<AttendanceStatus, AttendanceStatus[]> = {
  not_started: ['checked_in', 'expired'],
  checked_in: ['question_assigned', 'expired', 'cancelled'],
  question_assigned: ['answer_submitted', 'expired', 'cancelled'],
  answer_submitted: ['pending_review'],
  pending_review: ['approved', 'rejected'],
  approved: [],
  rejected: [],
  expired: [],
  cancelled: [],
};

export function canTransition(from: AttendanceStatus, to: AttendanceStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
