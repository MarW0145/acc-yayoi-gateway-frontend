interface YayoiSubAccountSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  className?: string
}

/**
 * 補助科目入力フィールド。
 * 現時点では弥生補助科目リストのデータ構造がないため自由入力テキストとして実装。
 * 将来的に options: string[] を渡してドロップダウン化できるよう設計。
 */
export function YayoiSubAccountSelect({ value, onChange, className }: YayoiSubAccountSelectProps) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(event) => {
        const v = event.target.value
        onChange(v === '' ? null : v)
      }}
      placeholder="補助科目"
      className={`w-24 rounded border border-slate-300 px-1 py-0.5 text-xs placeholder:text-slate-300 ${className ?? ''}`}
    />
  )
}
