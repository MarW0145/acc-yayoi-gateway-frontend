import { YayoiAccountSelect } from '../YayoiAccountSelect'
import { YayoiTaxSelect } from '../YayoiTaxSelect'
import { YayoiSubAccountSelect } from '../YayoiSubAccountSelect'
import { StatusBadge } from '../StatusBadge'
import type { AccountGroup, TaxCategoryEntry, YayoiJournalCandidate } from '../../types/api'
import { REVIEW_STATUS_ROW_CLASS } from '../../utils/reviewStatus'
import { formatStatusCounts, countByReviewStatus } from '../../utils/journalCounts'

interface JournalReviewStepProps {
  candidates: YayoiJournalCandidate[]
  accountGroups: AccountGroup[]
  taxEntries: TaxCategoryEntry[]
  duplicateCount: number
  loading: boolean
  onBack: () => void
  onCandidateChange: (transactionId: string, patch: Partial<YayoiJournalCandidate>) => void
  onSubmit: () => void
}

function isDuplicateMessage(message: string): boolean {
  return message.includes('重複')
}

export function JournalReviewStep({
  candidates,
  accountGroups,
  taxEntries,
  duplicateCount,
  loading,
  onBack,
  onCandidateChange,
  onSubmit,
}: JournalReviewStepProps) {
  const statusCounts = countByReviewStatus(candidates)
  const okCount = statusCounts.OK

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">4. 仕訳レビュー</h2>
      <p className="mt-1 text-sm text-slate-600">
        全 {candidates.length} 件（{formatStatusCounts(statusCounts)}）。弥生 CSV に出力できるのは{' '}
        <span className="font-semibold text-emerald-800">OK</span> のみです。
      </p>
      <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
        銀行明細では、入金は借方に「普通預金」、出金は貸方に「普通預金」が自動設定されます（相手科目は空欄）。
        入金の貸方・出金の借方は、弥生形式の科目リスト（区分・サーチキー付き）から選択してから「仕訳を確定」してください。
      </p>
      {duplicateCount > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span className="mt-0.5 shrink-0 text-base">⚠️</span>
          <span>
            <strong>{duplicateCount} 件</strong>の重複取込候補が検出されました。
            該当行の検証メッセージを確認し、意図しない重複取込でないか確認してください。
          </span>
        </div>
      )}
      {okCount === 0 ? (
        <p className="mt-2 text-sm font-medium text-amber-800">
          現在プレビュー上 OK は 0 件です。科目を補完して確定しないとエクスポートできません。
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-2 py-2">状態</th>
              <th className="px-2 py-2">日付</th>
              <th className="px-2 py-2">摘要</th>
              <th className="px-2 py-2">借方科目</th>
              <th className="px-2 py-2">借方補助</th>
              <th className="px-2 py-2">借方税区分</th>
              <th className="px-2 py-2">貸方科目</th>
              <th className="px-2 py-2">貸方補助</th>
              <th className="px-2 py-2">貸方税区分</th>
              <th className="px-2 py-2">借方金額</th>
              <th className="px-2 py-2">貸方金額</th>
              <th className="px-2 py-2">信頼度</th>
              <th className="w-48 min-w-[12rem] px-2 py-2">メッセージ</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr
                key={candidate.transaction_id}
                className={`border-t border-slate-100 ${REVIEW_STATUS_ROW_CLASS[candidate.review_status]}`}
              >
                <td className="px-2 py-2 align-top">
                  <StatusBadge status={candidate.review_status} />
                </td>
                <td className="px-2 py-2 align-top whitespace-nowrap">{candidate.journal_date}</td>
                <td className="px-2 py-2 align-top">
                  <input
                    type="text"
                    value={candidate.description}
                    onChange={(event) =>
                      onCandidateChange(candidate.transaction_id, {
                        description: event.target.value,
                      })
                    }
                    className="w-40 min-w-[8rem] rounded border border-slate-300 px-1 py-0.5"
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <YayoiAccountSelect
                    value={candidate.debit_account}
                    groups={accountGroups}
                    onChange={(debit_account) =>
                      onCandidateChange(candidate.transaction_id, { debit_account })
                    }
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <YayoiSubAccountSelect
                    value={candidate.debit_sub_account}
                    onChange={(debit_sub_account) =>
                      onCandidateChange(candidate.transaction_id, { debit_sub_account })
                    }
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <YayoiTaxSelect
                    value={candidate.debit_tax_category}
                    entries={taxEntries}
                    onChange={(debit_tax_category) =>
                      onCandidateChange(candidate.transaction_id, { debit_tax_category })
                    }
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <YayoiAccountSelect
                    value={candidate.credit_account}
                    groups={accountGroups}
                    onChange={(credit_account) =>
                      onCandidateChange(candidate.transaction_id, { credit_account })
                    }
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <YayoiSubAccountSelect
                    value={candidate.credit_sub_account}
                    onChange={(credit_sub_account) =>
                      onCandidateChange(candidate.transaction_id, { credit_sub_account })
                    }
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <YayoiTaxSelect
                    value={candidate.credit_tax_category}
                    entries={taxEntries}
                    onChange={(credit_tax_category) =>
                      onCandidateChange(candidate.transaction_id, { credit_tax_category })
                    }
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <input
                    type="text"
                    value={candidate.debit_amount}
                    onChange={(event) =>
                      onCandidateChange(candidate.transaction_id, {
                        debit_amount: event.target.value,
                      })
                    }
                    className="w-20 rounded border border-slate-300 px-1 py-0.5"
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <input
                    type="text"
                    value={candidate.credit_amount}
                    onChange={(event) =>
                      onCandidateChange(candidate.transaction_id, {
                        credit_amount: event.target.value,
                      })
                    }
                    className="w-20 rounded border border-slate-300 px-1 py-0.5"
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  {(candidate.confidence_score * 100).toFixed(0)}%
                </td>
                <td className="w-48 min-w-[12rem] max-w-xs px-2 py-2 align-top">
                  {candidate.validation_messages.length === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <ul className="space-y-0.5">
                      {candidate.validation_messages.map((msg, i) => (
                        <li
                          key={i}
                          className={`break-words ${
                            isDuplicateMessage(msg)
                              ? 'font-medium text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {isDuplicateMessage(msg) ? '⚠ ' : ''}{msg}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
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
          disabled={loading || candidates.length === 0}
          onClick={onSubmit}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? '確定中…' : '仕訳を確定してエクスポートへ'}
        </button>
      </div>
    </section>
  )
}
