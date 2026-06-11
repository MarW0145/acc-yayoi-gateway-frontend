import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'
import type { TaxCategoryEntry } from '../types/api'

interface YayoiTaxSelectProps {
  value: string
  entries: TaxCategoryEntry[]
  onChange: (value: string) => void
  className?: string
}

const PANEL_WIDTH_PX = 300
const PANEL_MAX_HEIGHT_PX = 260

function normalizeQuery(text: string): string {
  return text.trim().toLowerCase()
}

function matchesEntry(entry: TaxCategoryEntry, query: string): boolean {
  if (!query) return true
  return (
    entry.name.toLowerCase().includes(query) ||
    entry.abbreviation.toLowerCase().includes(query) ||
    entry.search_key.toLowerCase().includes(query)
  )
}

function computePanelStyle(anchor: DOMRect): CSSProperties {
  const width = Math.min(PANEL_WIDTH_PX, window.innerWidth * 0.9)
  const left = Math.min(Math.max(8, anchor.left), window.innerWidth - width - 8)
  const gap = 4
  const spaceBelow = window.innerHeight - anchor.bottom - gap
  const spaceAbove = anchor.top - gap
  const openUpward = spaceBelow < PANEL_MAX_HEIGHT_PX && spaceAbove > spaceBelow

  if (openUpward) {
    return { position: 'fixed', left, bottom: window.innerHeight - anchor.top + gap, width, zIndex: 9999 }
  }
  return { position: 'fixed', left, top: anchor.bottom + gap, width, zIndex: 9999 }
}

export function YayoiTaxSelect({ value, entries, onChange, className }: YayoiTaxSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const entriesWithCurrent = useMemo(() => {
    if (!value) return entries
    const exists = entries.some((e) => e.name === value)
    if (exists) return entries
    return [{ name: value, abbreviation: '', search_key: '' }, ...entries]
  }, [entries, value])

  const filteredEntries = useMemo(() => {
    const q = normalizeQuery(query)
    return entriesWithCurrent.filter((e) => matchesEntry(e, q))
  }, [entriesWithCurrent, query])

  const updatePanelPosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) return
    setPanelStyle(computePanelStyle(button.getBoundingClientRect()))
  }, [])

  useEffect(() => {
    if (!open) return
    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)
    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [open, updatePanelPosition])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const displayValue = value || '（未選択）'

  const panel =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            id={listId}
            ref={panelRef}
            style={panelStyle}
            className="overflow-hidden rounded border border-slate-300 bg-white shadow-lg"
          >
            <div className="border-b border-slate-200 p-1.5">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="税区分名 / サーチキー"
                className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-52 overflow-y-auto text-xs">
              <button
                type="button"
                className="flex w-full items-center justify-between px-2 py-1 text-left text-slate-500 hover:bg-[#316AC5] hover:text-white"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                  setQuery('')
                }}
              >
                <span>（未選択）</span>
              </button>
              {filteredEntries.map((entry) => {
                const selected = value === entry.name
                return (
                  <button
                    key={entry.name}
                    type="button"
                    className={`flex w-full items-center justify-between px-2 py-0.5 text-left ${
                      selected
                        ? 'bg-[#316AC5] text-white'
                        : 'text-slate-900 hover:bg-[#316AC5] hover:text-white'
                    }`}
                    onClick={() => {
                      onChange(entry.name)
                      setOpen(false)
                      setQuery('')
                    }}
                  >
                    <span className="truncate pr-2">{entry.name}</span>
                    {entry.search_key ? (
                      <span
                        className={`shrink-0 font-mono text-[10px] ${selected ? 'text-white/90' : 'text-slate-400'}`}
                      >
                        {entry.search_key}
                      </span>
                    ) : null}
                  </button>
                )
              })}
              {filteredEntries.length === 0 ? (
                <p className="px-2 py-3 text-center text-slate-500">該当する税区分がありません</p>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div ref={rootRef} className={`relative min-w-[9rem] ${className ?? ''}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((current) => {
            const next = !current
            if (next) requestAnimationFrame(updatePanelPosition)
            return next
          })
        }}
        className="flex w-full items-center justify-between gap-1 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-left text-xs hover:border-slate-400"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className="truncate">{displayValue}</span>
        <span className="text-slate-400">▾</span>
      </button>
      {panel}
    </div>
  )
}
