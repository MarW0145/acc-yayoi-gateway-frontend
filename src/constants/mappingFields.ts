export const INTERNAL_FIELD_OPTIONS = [
  { value: '', label: '（未マッピング）' },
  { value: 'transaction_date', label: '取引日' },
  { value: 'description', label: '摘要' },
  { value: 'source_inflow_amount', label: '入金額' },
  { value: 'source_outflow_amount', label: '出金額' },
  { value: 'balance', label: '残高' },
  { value: 'counterparty', label: '取引先' },
] as const

export const REQUIRED_MAPPING_FIELDS = [
  'transaction_date',
  'description',
  'source_inflow_amount',
  'source_outflow_amount',
] as const

// クレカは入金列（返金）が存在しないことが多いため source_inflow_amount は任意
export const CREDIT_CARD_REQUIRED_MAPPING_FIELDS = [
  'transaction_date',
  'description',
  'source_outflow_amount',
] as const

export const INTERNAL_FIELD_LABELS: Record<string, string> = {
  transaction_date: '取引日',
  description: '摘要',
  source_inflow_amount: '入金額',
  source_outflow_amount: '出金額',
  balance: '残高',
  counterparty: '取引先',
}

export const WORKFLOW_STEPS = [
  { id: 'client' as const, label: '顧客' },
  { id: 'upload' as const, label: 'アップロード' },
  { id: 'mapping' as const, label: '列マッピング' },
  { id: 'journal' as const, label: '仕訳レビュー' },
  { id: 'export' as const, label: 'エクスポート' },
]
