import { useCallback, useRef, useState } from 'react'
import { analyzeImages } from '../../services/gatewayApi'
import type { GeminiModel, ImageAnalysisResponse } from '../../types/api'

const MODELS: { id: GeminiModel; label: string; note: string }[] = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', note: '最新・高速' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', note: '軽量・安定' },
  { id: 'gemini-2.5-pro',   label: 'Gemini 2.5 Pro',   note: '高精度' },
]

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']
const MAX_BYTES = 50 * 1024 * 1024 // 50 MB
const MAX_FILES = 10

interface UploadedImage {
  id: string
  file: File
  previewUrl: string
}

interface ImageUploadStepProps {
  onBack: () => void
}

export function ImageUploadStep({ onBack }: ImageUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null)
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.5-flash')

  const processFiles = useCallback((incoming: FileList | File[]) => {
    setError(null)
    setResult(null)
    const files = Array.from(incoming)
    const errors: string[] = []
    const valid: UploadedImage[] = []

    for (const file of files) {
      if (file.type !== '' && !ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`「${file.name}」は対応外の形式です。`)
        continue
      }
      if (file.size > MAX_BYTES) {
        errors.push(`「${file.name}」が 50MB を超えています。`)
        continue
      }
      valid.push({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }

    setImages((prev) => {
      const combined = [...prev]
      for (const img of valid) {
        if (combined.find((i) => i.id === img.id)) continue
        combined.push(img)
      }
      if (combined.length > MAX_FILES) {
        const rejected = combined.splice(MAX_FILES)
        rejected.forEach((i) => URL.revokeObjectURL(i.previewUrl))
        errors.push(`最大 ${MAX_FILES} 枚までです。超過分は除外されました。`)
      }
      return combined
    })

    if (errors.length > 0) setError(errors.join(' '))
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }
  const handleInputChange = () => {
    if (inputRef.current?.files?.length) processFiles(inputRef.current.files)
  }

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
    setError(null)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (images.length === 0) return
    setError(null)
    setResult(null)
    setAnalyzing(true)
    try {
      const res = await analyzeImages(images.map((i) => i.file), selectedModel)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 解析中にエラーが発生しました。')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const bom = '\uFEFF'
    const blob = new Blob([bom + result.csv_content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatBytes = (b: number) => {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  // CSV プレビュー用のパース（先頭 6 行）
  const csvPreviewRows: string[][] = (() => {
    if (!result) return []
    return result.csv_content
      .split('\n')
      .filter(Boolean)
      .slice(0, 7)
      .map((line) => line.split(','))
  })()

  const canAddMore = images.length < MAX_FILES

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {/* ---- ヘッダー ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">画像アップロード</h2>
        <span className="text-sm text-slate-400">{images.length} / {MAX_FILES} 枚</span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        通帳・明細書などの写真をアップロードすると、AI が解析して CSV データに変換します。
      </p>

      <div className="mt-6 space-y-4">
        {/* ---- ドロップゾーン ---- */}
        {canAddMore && (
          <>
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-8 py-10 transition-colors',
                dragging
                  ? 'border-slate-500 bg-slate-100'
                  : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
              ].join(' ')}
            >
              <CloudUploadIcon className="h-12 w-12 text-slate-400" />
              <p className="text-base font-bold text-slate-700">写真をここへドロップ</p>
              <p className="text-sm text-sky-500">
                PNG, JPG, WEBP, HEIC（1 枚あたり最大 50MB・最大 {MAX_FILES} 枚）
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif"
              onChange={handleInputChange}
              className="hidden"
            />
          </>
        )}

        {/* ---- 画像グリッド ---- */}
        {images.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((img, idx) => (
              <li
                key={img.id}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm"
              >
                <img src={img.previewUrl} alt={img.file.name} className="h-28 w-full object-cover" />
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs font-medium text-slate-700">{img.file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(img.file.size)}</p>
                </div>
                <span className="absolute left-1 top-1 rounded bg-slate-800/70 px-1.5 py-0.5 text-xs text-white">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 group-hover:flex"
                  aria-label="削除"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {!canAddMore && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            上限の {MAX_FILES} 枚に達しました。追加するには既存の画像を削除してください。
          </p>
        )}

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* ---- モデル選択 ---- */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-medium text-slate-500">AI モデル</p>
        <div className="flex flex-wrap gap-2">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModel(m.id)}
              className={[
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                selectedModel === m.id
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50',
              ].join(' ')}
            >
              {m.label}
              <span className={[
                'ml-1.5 text-xs',
                selectedModel === m.id ? 'text-slate-300' : 'text-slate-400',
              ].join(' ')}>
                {m.note}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---- ボタン ---- */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={images.length === 0 || analyzing}
          onClick={handleAnalyze}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40"
        >
          {analyzing
            ? 'AI 解析中…'
            : `AI 解析して CSV 変換（${images.length} 枚）`}
        </button>
      </div>

      {/* ---- 解析結果 ---- */}
      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-slate-800">解析結果</h3>
              <span className={[
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                result.image_type === 'bank_passbook'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600',
              ].join(' ')}>
                {result.image_type === 'bank_passbook' ? '銀行通帳' : '明細書'}
              </span>
              <span className="text-sm text-slate-500">{result.transaction_count} 件</span>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <DownloadIcon className="h-4 w-4" />
              CSV ダウンロード
            </button>
          </div>

          {/* CSV プレビューテーブル */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  {result.headers.map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csvPreviewRows.slice(1).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {row.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.transaction_count > 6 && (
              <p className="border-t border-slate-200 px-3 py-2 text-xs text-slate-400">
                ほか {result.transaction_count - 6} 件… CSV をダウンロードして全件確認
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
