import type { ReviewStatus } from '../types/api'

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  OK: 'OK',
  WARNING: '警告',
  REVIEW_REQUIRED: '要確認',
  ERROR: 'エラー',
}

export const REVIEW_STATUS_ROW_CLASS: Record<ReviewStatus, string> = {
  OK: 'bg-emerald-50',
  WARNING: 'bg-amber-50',
  REVIEW_REQUIRED: 'bg-orange-50',
  ERROR: 'bg-red-50',
}

export const REVIEW_STATUS_BADGE_CLASS: Record<ReviewStatus, string> = {
  OK: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  WARNING: 'bg-amber-100 text-amber-900 ring-amber-200',
  REVIEW_REQUIRED: 'bg-orange-100 text-orange-900 ring-orange-200',
  ERROR: 'bg-red-100 text-red-800 ring-red-200',
}
