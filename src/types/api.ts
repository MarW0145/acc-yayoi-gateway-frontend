export type SourceType = 'bank' | 'credit_card' | 'cashbook' | 'generic'

export type ReviewStatus = 'OK' | 'WARNING' | 'REVIEW_REQUIRED' | 'ERROR'

export type WorkflowStep = 'client' | 'upload' | 'mapping' | 'journal' | 'export'

export interface HealthResponse {
  status: string
}

export interface ClientMasterResponse {
  client_id: string
  accounts: string[]
  tax_categories: string[]
}

export interface FileUploadResponse {
  session_id: string
  client_id: string
  original_filename: string
}

export interface FilePreviewResponse {
  session_id: string
  client_id: string
  original_filename: string
  encoding: string
  encoding_confidence: number
  headers: string[]
  preview_rows: string[][]
}

export interface HeaderMappingSuggestion {
  header: string
  suggested_field: string | null
  confidence: number
  needs_review: boolean
}

export interface MappingSuggestResponse {
  session_id: string
  client_id: string
  source_type: SourceType
  suggestions: HeaderMappingSuggestion[]
}

export interface MappingConfirmRequest {
  session_id: string
  source_type: SourceType
  mappings: Record<string, string>
}

export interface MappingConfirmResponse {
  session_id: string
  client_id: string
  source_type: SourceType
  mappings: Record<string, string>
  saved_to_learner: boolean
}

export interface YayoiJournalCandidate {
  transaction_id: string
  journal_date: string
  debit_account: string | null
  debit_sub_account: string | null
  debit_department: string | null
  debit_tax_category: string
  debit_amount: string
  debit_tax_amount: string | null
  credit_account: string | null
  credit_sub_account: string | null
  credit_department: string | null
  credit_tax_category: string
  credit_amount: string
  credit_tax_amount: string | null
  description: string
  memo: string | null
  confidence_score: number
  review_status: ReviewStatus
  validation_messages: string[]
  import_row_hash: string
}

export interface JournalPreviewResponse {
  session_id: string
  client_id: string
  source_type: SourceType
  source_transactions: unknown[]
  journal_candidates: YayoiJournalCandidate[]
  exportable_count: number
}

export interface JournalConfirmResponse {
  session_id: string
  client_id: string
  source_type: SourceType
  journal_candidates: YayoiJournalCandidate[]
  confirmed_count: number
  exportable_count: number
}

export interface YayoiExportResponse {
  batch_id: string
  session_id: string
  client_id: string
  exported_count: number
  skipped_count: number
  error_count: number
  download_url: string
  warnings: string[]
  confirmation_workbook_filename: string | null
}
