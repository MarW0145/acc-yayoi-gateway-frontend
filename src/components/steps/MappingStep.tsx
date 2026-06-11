import { INTERNAL_FIELD_OPTIONS } from '../../constants/mappingFields'
import type { FilePreviewResponse, HeaderMappingSuggestion, SourceType } from '../../types/api'

interface MappingStepProps {
  preview: FilePreviewResponse
  suggestions: HeaderMappingSuggestion[]
  headerMappings: Record<string, string>
  sourceType: SourceType
  loading: boolean
  onBack: () => void
  onMappingChange: (header: string, field: string) => void
  onSubmit: () => void
}

export function MappingStep({
  preview,
  suggestions,
  headerMappings,
  sourceType,
  loading,
  onBack,
  onMappingChange,
  onSubmit,
}: MappingStepProps) {
  const suggestionByHeader = Object.fromEntries(
    suggestions.map((item) => [item.header, item]),
  )

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">3. 列マッピング</h2>
        <p className="mt-1 text-sm text-slate-600">
          {preview.original_filename} — エンコーディング: {preview.encoding}（信頼度{' '}
          {(preview.encoding_confidence * 100).toFixed(0)}%）
        </p>

        {sourceType === 'credit_card' && (
          <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            クレジットカードモード：「利用金額」列を<strong>出金額</strong>にマッピングしてください。
            「入金額」（返金列）は任意です。
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">CSV ヘッダー</th>
                <th className="px-3 py-2 font-medium">内部フィールド</th>
                <th className="px-3 py-2 font-medium">提案</th>
                <th className="px-3 py-2 font-medium">信頼度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preview.headers.map((header) => {
                const suggestion = suggestionByHeader[header]
                return (
                  <tr key={header}>
                    <td className="px-3 py-2 font-mono text-xs">{header}</td>
                    <td className="px-3 py-2">
                      <select
                        value={headerMappings[header] ?? ''}
                        onChange={(event) => onMappingChange(header, event.target.value)}
                        className="w-full min-w-[10rem] rounded border border-slate-300 px-2 py-1 text-sm"
                      >
                        {INTERNAL_FIELD_OPTIONS.map((option) => (
                          <option key={option.value || '_empty'} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {suggestion?.suggested_field ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      {suggestion ? (
                        <span
                          className={
                            suggestion.needs_review ? 'text-amber-700' : 'text-emerald-700'
                          }
                        >
                          {(suggestion.confidence * 100).toFixed(0)}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            戻る
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onSubmit}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? '仕訳生成中…' : 'マッピング確定して仕訳プレビュー'}
          </button>
        </div>
      </div>

      {preview.preview_rows.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700">プレビュー（先頭行）</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50">
                <tr>
                  {preview.headers.map((header) => (
                    <th key={header} className="px-2 py-1 font-medium text-slate-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.preview_rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="whitespace-nowrap px-2 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  )
}
