import type { ReviewStatus, YayoiJournalCandidate } from '../types/api'

export interface JournalStatusCounts {
  OK: number
  WARNING: number
  REVIEW_REQUIRED: number
  ERROR: number
}

export function countByReviewStatus(
  candidates: YayoiJournalCandidate[],
): JournalStatusCounts {
  const counts: JournalStatusCounts = {
    OK: 0,
    WARNING: 0,
    REVIEW_REQUIRED: 0,
    ERROR: 0,
  }
  for (const candidate of candidates) {
    counts[candidate.review_status] += 1
  }
  return counts
}

export function exportableCount(candidates: YayoiJournalCandidate[]): number {
  return candidates.filter((candidate) => candidate.review_status === 'OK').length
}

export function formatStatusCounts(counts: JournalStatusCounts): string {
  const parts: string[] = []
  const labels: Record<ReviewStatus, string> = {
    OK: 'OK',
    WARNING: '警告',
    REVIEW_REQUIRED: '要確認',
    ERROR: 'エラー',
  }
  for (const status of Object.keys(labels) as ReviewStatus[]) {
    if (counts[status] > 0) {
      parts.push(`${labels[status]} ${counts[status]}`)
    }
  }
  return parts.join(' / ')
}
