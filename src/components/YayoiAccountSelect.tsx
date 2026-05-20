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
import type { AccountGroup } from '../types/api'

interface YayoiAccountSelectProps {
  value: string | null
  groups: AccountGroup[]
  onChange: (value: string | null) => void
  className?: string
}

const PANEL_WIDTH_PX = 352
const PANEL_MAX_HEIGHT_PX = 280

function normalizeQuery(text: string): string {
  return text.trim().toLowerCase()
}

function matchesAccount(
  name: string,
  searchKey: string,
  searchKeyNumber: string,
  query: string,
): boolean {
  if (!query) {
    return true
  }
  return (
    name.toLowerCase().includes(query) ||
    searchKey.toLowerCase().includes(query) ||
    searchKeyNumber.includes(query)
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
    return {
      position: 'fixed',
      left,
      bottom: window.innerHeight - anchor.top + gap,
      width,
      zIndex: 9999,
    }
  }

  return {
    position: 'fixed',
    left,
    top: anchor.bottom + gap,
    width,
    zIndex: 9999,
  }
}

export function YayoiAccountSelect({ value, groups, onChange, className }: YayoiAccountSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const groupsWithCurrent = useMemo(() => {
    if (!value) {
      return groups
    }
    const exists = groups.some((group) =>
      group.accounts.some((account) => account.name === value),
    )
    if (exists) {
      return groups
    }
    return [
      {
        label: '[現在の値]',
        search_key: '',
        accounts: [{ name: value, search_key: '', search_key_number: '' }],
      },
      ...groups,
    ]
  }, [groups, value])

  const filteredGroups = useMemo(() => {
    const q = normalizeQuery(query)
    if (!q) {
      return groupsWithCurrent
    }
    return groupsWithCurrent
      .map((group) => ({
        ...group,
        accounts: group.accounts.filter((account) =>
          matchesAccount(account.name, account.search_key, account.search_key_number, q),
        ),
      }))
      .filter((group) => group.accounts.length > 0 || group.search_key.toLowerCase().includes(q))
  }, [groupsWithCurrent, query])

  const updatePanelPosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) {
      return
    }
    setPanelStyle(computePanelStyle(button.getBoundingClientRect()))
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }
    updatePanelPosition()
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)
    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [open, updatePanelPosition])

  useEffect(() => {
    if (!open) {
      return
    }
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const displayValue = value ?? '（未選択）'

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
                placeholder="科目名 / サーチキー"
                className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto text-xs">
              <button
                type="button"
                className="flex w-full items-center justify-between px-2 py-1 text-left text-slate-500 hover:bg-[#316AC5] hover:text-white"
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                  setQuery('')
                }}
              >
                <span>（未選択）</span>
              </button>
              {filteredGroups.map((group) => (
                <div key={`${group.label}-${group.search_key}`}>
                  <div className="flex items-center justify-between bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    <span>{group.label}</span>
                    {group.search_key ? (
                      <span className="font-mono text-[10px] text-slate-500">{group.search_key}</span>
                    ) : null}
                  </div>
                  {group.accounts.map((account) => {
                    const selected = value === account.name
                    return (
                      <button
                        key={`${group.label}-${account.name}`}
                        type="button"
                        className={`flex w-full items-center justify-between px-2 py-0.5 text-left ${
                          selected
                            ? 'bg-[#316AC5] text-white'
                            : 'text-slate-900 hover:bg-[#316AC5] hover:text-white'
                        }`}
                        onClick={() => {
                          onChange(account.name)
                          setOpen(false)
                          setQuery('')
                        }}
                      >
                        <span className="truncate pr-2">{account.name}</span>
                        <span
                          className={`shrink-0 font-mono text-[10px] ${
                            selected ? 'text-white/90' : 'text-slate-500'
                          }`}
                        >
                          {account.search_key}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
              {filteredGroups.length === 0 ? (
                <p className="px-2 py-3 text-center text-slate-500">該当する科目がありません</p>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div ref={rootRef} className={`relative min-w-[11rem] ${className ?? ''}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((current) => {
            const next = !current
            if (next) {
              requestAnimationFrame(updatePanelPosition)
            }
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

