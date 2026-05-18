import { useEffect, useState } from 'react'

function App() {
  const [health, setHealth] = useState<string>('…')

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j) => setHealth(JSON.stringify(j)))
      .catch(() => setHealth('接続失敗（バックエンドを起動しましたか？）'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          弥生会計取込前データ整形・検証（MVP）
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          acc-yayoi-gateway — Week 1 基盤（FastAPI + React）
        </p>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">API 疎通</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-slate-100 p-4 text-left text-sm">
            {health}
          </pre>
        </section>
      </main>
    </div>
  )
}

export default App
