import type { SourceType } from '../../types/api'

interface ClientStepProps {
  clientId: string
  sourceType: SourceType
  loading: boolean
  onClientIdChange: (value: string) => void
  onSourceTypeChange: (value: SourceType) => void
  onSubmit: () => void
}

export function ClientStep({
  clientId,
  sourceType,
  loading,
  onClientIdChange,
  onSourceTypeChange,
  onSubmit,
}: ClientStepProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">1. 顧客選択</h2>
      <p className="mt-1 text-sm text-slate-600">
        顧客 ID に紐づくマスタ・学習マッピングを使用します（例: demo-client）。
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">顧客 ID</span>
          <input
            type="text"
            value={clientId}
            onChange={(event) => onClientIdChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="demo-client"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">入力種別</span>
          <select
            value={sourceType}
            onChange={(event) => onSourceTypeChange(event.target.value as SourceType)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="bank">銀行（bank）</option>
            <option value="credit_card" disabled>
              クレジットカード（未対応）
            </option>
            <option value="cashbook" disabled>
              現金出納帳（未対応）
            </option>
          </select>
        </label>
      </div>
      <div className="mt-6">
        <button
          type="button"
          disabled={loading}
          onClick={onSubmit}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          次へ：ファイルアップロード
        </button>
      </div>
    </section>
  )
}
