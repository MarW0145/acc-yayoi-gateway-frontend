import { useRef, useState } from 'react'

interface UploadStepProps {
  clientId: string
  loading: boolean
  onBack: () => void
  onUpload: (file: File) => void
}

export function UploadStep({ clientId, loading, onBack, onUpload }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const handleFileChange = () => {
    const file = inputRef.current?.files?.[0]
    setSelectedName(file?.name ?? null)
  }

  const handleSubmit = () => {
    const file = inputRef.current?.files?.[0]
    if (!file) {
      return
    }
    onUpload(file)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">2. ファイルアップロード</h2>
      <p className="mt-1 text-sm text-slate-600">
        顧客 <span className="font-mono text-slate-800">{clientId}</span> — CSV / TSV
        をアップロードしてください。
      </p>
      <div className="mt-6">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
        {selectedName ? (
          <p className="mt-2 text-sm text-slate-500">選択: {selectedName}</p>
        ) : null}
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
          disabled={loading || !selectedName}
          onClick={handleSubmit}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? '処理中…' : 'アップロードして列マッピングへ'}
        </button>
      </div>
    </section>
  )
}
