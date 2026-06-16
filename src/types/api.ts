export type SourceType = 'bank' | 'credit_card' | 'cashbook' | 'generic'

export type ReviewStatus = 'OK' | 'WARNING' | 'REVIEW_REQUIRED' | 'ERROR'

export type WorkflowStep = 'client' | 'upload' | 'mapping' | 'journal' | 'export' | 'master'

export interface HealthResponse {
  status: string
}

export interface AccountEntry {
  name: string
  search_key: string
  search_key_number: string
}

export interface AccountGroup {
  label: string
  search_key: string
  accounts: AccountEntry[]
}

export interface TaxCategoryEntry {
  name: string
  abbreviation: string
  search_key: string
}

export interface ClientMasterResponse {
  client_id: string
  accounts: string[]
  tax_categories: string[]
  account_groups: AccountGroup[]
  tax_category_entries: TaxCategoryEntry[]
  card_booking_method: 'A' | 'B' | null
  client_accounts: string[]
  client_tax_categories: string[]
}

export interface UpdateMasterRequest {
  accounts: string[]
  tax_categories: string[]
  card_booking_method: 'A' | 'B' | null
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
  duplicate_count: number
}

export interface JournalConfirmResponse {
  session_id: string
  client_id: string
  source_type: SourceType
  journal_candidates: YayoiJournalCandidate[]
  confirmed_count: number
  exportable_count: number
}

export interface YayoiExportRequest {
  session_id: string
  include_warning?: boolean
}

export interface YayoiExportResponse {
  batch_id: string
  session_id: string
  client_id: string
  exported_count: number
  skipped_count: number
  error_count: number
  download_url: string
  zip_filename: string
  warnings: string[]
  confirmation_workbook_filename: string | null
  include_warning: boolean
}
