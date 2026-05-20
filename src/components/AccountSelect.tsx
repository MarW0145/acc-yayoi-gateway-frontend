interface AccountSelectProps {
  value: string | null
  options: string[]
  onChange: (value: string | null) => void
  className?: string
}

function buildOptionList(options: string[], current: string | null): string[] {
  if (current && !options.includes(current)) {
    return [current, ...options]
  }
  return options
}

export function AccountSelect({ value, options, onChange, className }: AccountSelectProps) {
  const items = buildOptionList(options, value)

  return (
    <select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || null)}
      className={className ?? 'w-32 min-w-[8rem] rounded border border-slate-300 px-1 py-0.5 text-xs'}
    >
      <option value="">（未選択）</option>
      {items.map((account) => (
        <option key={account} value={account}>
          {account}
        </option>
      ))}
    </select>
  )
}
