import type { ReviewStatus } from '../types/api'
import { REVIEW_STATUS_BADGE_CLASS, REVIEW_STATUS_LABELS } from '../utils/reviewStatus'

interface StatusBadgeProps {
  status: ReviewStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${REVIEW_STATUS_BADGE_CLASS[status]}`}
    >
      {REVIEW_STATUS_LABELS[status]}
    </span>
  )
}
