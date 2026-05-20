interface ErrorAlertProps {
  message: string | null
  onDismiss?: () => void
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) {
    return null
  }
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <div className="flex items-start justify-between gap-3">
        <span>{message}</span>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-red-600 underline hover:text-red-800"
          >
            閉じる
          </button>
        ) : null}
      </div>
    </div>
  )
}
