interface AppHeaderProps {
  healthStatus: string | null
}

export function AppHeader({ healthStatus }: AppHeaderProps) {
  const healthClass =
    healthStatus === 'ok' || healthStatus === 'healthy'
      ? 'bg-emerald-100 text-emerald-800'
      : healthStatus === 'offline'
        ? 'bg-red-100 text-red-800'
        : 'bg-slate-100 text-slate-600'

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            弥生会計取込前データ整形・検証
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            acc-yayoi-gateway MVP
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${healthClass}`}>
          API: {healthStatus ?? '確認中…'}
        </span>
      </div>
    </header>
  )
}
