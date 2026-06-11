import { useState } from 'react'
import { downloadExportPackage } from '../../services/gatewayApi'
import { ApiError } from '../../services/apiClient'
import type { YayoiExportResponse } from '../../types/api'

interface ExportStepProps {
  sessionId: string | null
  journalsConfirmed: boolean
  exportableCount: number
  warningCount: number
  includeWarning: boolean
  onIncludeWarningChange: (value: boolean) => void
  exportResult: YayoiExportResponse | null
  loading: boolean
  onBack: () => void
  onExport: () => void
  onRestart: () => void
}

export function ExportStep({
  sessionId,
  journalsConfirmed,
  exportableCount,
  warningCount,
  includeWarning,
  onIncludeWarningChange,
  exportResult,
  loading,
  onBack,
  onExport,
  onRestart,
}: ExportStepProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!exportResult) {
      return
    }
    setDownloading(true)
    setDownloadError(null)
    try {
      const blob = await downloadExportPackage(exportResult.download_url)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = exportResult.zip_filename ?? `yayoi_export_${exportResult.batch_id}.zip`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'ダウンロードに失敗しました'
      setDownloadError(message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">5. エクスポート</h2>
      <p className="mt-1 text-sm text-slate-600">
        弥生仕訳日記帳 CSV（Shift-JIS）、エラー一覧、Excel 確認表を ZIP でダウンロードします。
      </p>

      {!journalsConfirmed ? (
        <p className="mt-4 text-sm text-amber-800">
          仕訳が未確定です。前のステップで仕訳を確定してください。
        </p>
      ) : null}

      {journalsConfirmed && exportableCount === 0 ? (
        <p className="mt-4 text-sm font-medium text-red-700">
          確定済み仕訳に OK が 0 件のためエクスポートできません。仕訳レビューに戻り、借方・貸方科目と金額を修正してから再度確定してください。
        </p>
      ) : null}

      {journalsConfirmed && exportableCount > 0 ? (
        <p className="mt-4 text-sm text-emerald-800">
          エクスポート対象: <span className="font-semibold">{exportableCount}</span> 件（OK）
          {warningCount > 0 && !includeWarning ? (
            <span className="ml-2 text-amber-700">
              + WARNING {warningCount} 件（下記オプションで追加可）
            </span>
          ) : null}
        </p>
      ) : null}

      {journalsConfirmed && warningCount > 0 ? (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
          <input
            id="include-warning-toggle"
            type="checkbox"
            checked={includeWarning}
            onChange={(e) => onIncludeWarningChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-amber-600"
          />
          <label htmlFor="include-warning-toggle" className="cursor-pointer text-amber-900">
            <span className="font-medium">WARNING 行も含めてエクスポートする</span>
            <span className="ml-1 text-amber-700">
              （{warningCount} 件 — 中信頼度。担当者が内容を確認した上でチェックしてください）
            </span>
          </label>
        </div>
      ) : null}

      {exportResult ? (
        <dl className="mt-6 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">batch_id</dt>
            <dd className="font-mono text-xs">{exportResult.batch_id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">ZIP ファイル名</dt>
            <dd className="font-mono text-xs text-slate-700">{exportResult.zip_filename}</dd>
          </div>
          <div>
            <dt className="text-slate-500">出力件数</dt>
            <dd className="font-semibold text-emerald-800">
              {exportResult.exported_count}
              {exportResult.include_warning ? (
                <span className="ml-1 text-xs font-normal text-amber-700">（OK + WARNING）</span>
              ) : (
                <span className="ml-1 text-xs font-normal text-slate-500">（OK のみ）</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">スキップ（非出力）</dt>
            <dd>{exportResult.skipped_count}</dd>
          </div>
          <div>
            <dt className="text-slate-500">エラー件数</dt>
            <dd>{exportResult.error_count}</dd>
          </div>
          {exportResult.confirmation_workbook_filename ? (
            <div>
              <dt className="text-slate-500">Excel 確認表</dt>
              <dd>{exportResult.confirmation_workbook_filename}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {exportResult?.warnings.length ? (
        <ul className="mt-4 list-inside list-disc text-sm text-amber-800">
          {exportResult.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      {downloadError ? (
        <p className="mt-4 text-sm text-red-700">{downloadError}</p>
      ) : null}

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
          disabled={loading || !journalsConfirmed || !sessionId || exportableCount === 0}
          onClick={onExport}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'エクスポート中…' : exportResult ? '再エクスポート' : 'エクスポート実行'}
        </button>
        {exportResult ? (
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {downloading ? 'ダウンロード中…' : 'ZIP をダウンロード'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          最初からやり直す
        </button>
      </div>
    </section>
  )
}
