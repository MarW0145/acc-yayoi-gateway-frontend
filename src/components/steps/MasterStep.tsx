import { useState } from 'react'

interface MasterStepProps {
  clientId: string
  clientAccounts: string[]
  clientTaxCategories: string[]
  cardBookingMethod: 'A' | 'B' | null
  loading: boolean
  onBack: () => void
  onSave: (
    accounts: string[],
    taxCategories: string[],
    cardBookingMethod: 'A' | 'B' | null,
  ) => void
}

export function MasterStep({
  clientId,
  clientAccounts,
  clientTaxCategories,
  cardBookingMethod,
  loading,
  onBack,
  onSave,
}: MasterStepProps) {
  const [accounts, setAccounts] = useState<string[]>(clientAccounts)
  const [taxCategories, setTaxCategories] = useState<string[]>(clientTaxCategories)
  const [method, setMethod] = useState<'A' | 'B' | null>(cardBookingMethod)
  const [newAccount, setNewAccount] = useState('')
  const [newTaxCategory, setNewTaxCategory] = useState('')

  const addAccount = () => {
    const name = newAccount.trim()
    if (!name || accounts.includes(name)) return
    setAccounts((prev) => [...prev, name].sort())
    setNewAccount('')
  }

  const removeAccount = (name: string) => {
    setAccounts((prev) => prev.filter((a) => a !== name))
  }

  const addTaxCategory = () => {
    const name = newTaxCategory.trim()
    if (!name || taxCategories.includes(name)) return
    setTaxCategories((prev) => [...prev, name].sort())
    setNewTaxCategory('')
  }

  const removeTaxCategory = (name: string) => {
    setTaxCategories((prev) => prev.filter((t) => t !== name))
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">マスター管理</h2>
            <p className="mt-1 text-sm text-slate-500">
              顧客 ID：<span className="font-mono font-medium text-slate-700">{clientId}</span>
              　／　弥生会計の標準科目（183科目・60税区分）は常に使用可能です。ここでは顧客固有の追加設定を管理します。
            </p>
          </div>
        </div>
      </div>

      {/* 勘定科目 */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800">顧客固有の勘定科目</h3>
        <p className="mt-1 text-xs text-slate-500">
          弥生標準科目にない科目名を追加できます。仕訳レビューのドロップダウンと取込前検査で使用されます。
        </p>
        <ul className="mt-3 space-y-1">
          {accounts.length === 0 && (
            <li className="text-sm text-slate-400">追加された科目はありません</li>
          )}
          {accounts.map((name) => (
            <li key={name} className="flex items-center justify-between rounded px-3 py-1.5 text-sm hover:bg-slate-50">
              <span>{name}</span>
              <button
                type="button"
                onClick={() => removeAccount(name)}
                className="ml-4 text-xs text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newAccount}
            onChange={(e) => setNewAccount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAccount()}
            placeholder="科目名を入力"
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="button"
            onClick={addAccount}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            追加
          </button>
        </div>
      </div>

      {/* 税区分 */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800">顧客固有の税区分</h3>
        <p className="mt-1 text-xs text-slate-500">
          弥生標準税区分（60区分）にない税区分を追加できます。
        </p>
        <ul className="mt-3 space-y-1">
          {taxCategories.length === 0 && (
            <li className="text-sm text-slate-400">追加された税区分はありません</li>
          )}
          {taxCategories.map((name) => (
            <li key={name} className="flex items-center justify-between rounded px-3 py-1.5 text-sm hover:bg-slate-50">
              <span>{name}</span>
              <button
                type="button"
                onClick={() => removeTaxCategory(name)}
                className="ml-4 text-xs text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newTaxCategory}
            onChange={(e) => setNewTaxCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTaxCategory()}
            placeholder="税区分名を入力"
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="button"
            onClick={addTaxCategory}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            追加
          </button>
        </div>
      </div>

      {/* クレカ計上方式 */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800">クレジットカード計上方式</h3>
        <p className="mt-1 text-xs text-slate-500">
          クレジットカード明細を処理する際の仕訳方式を設定します。
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {(
            [
              { value: 'A', label: '方式A — 利用時計上（貸方：未払金）', desc: '利用した月に費用を計上し、引落時に未払金を消込む。一般的な方式。' },
              { value: 'B', label: '方式B — 引落時計上（貸方：普通預金）', desc: '口座から引き落とされた月に費用を計上する。' },
            ] as const
          ).map(({ value, label, desc }) => (
            <label key={value} className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 px-4 py-3 hover:bg-slate-50">
              <input
                type="radio"
                name="card_booking_method"
                value={value}
                checked={method === value}
                onChange={() => setMethod(value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </label>
          ))}
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 px-4 py-3 hover:bg-slate-50">
            <input
              type="radio"
              name="card_booking_method"
              value=""
              checked={method === null}
              onChange={() => setMethod(null)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">未設定</p>
              <p className="text-xs text-slate-500">設定しない場合、クレカ明細は全行「要確認」になります。</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => onSave(accounts, taxCategories, method)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? '保存中…' : '保存する'}
        </button>
      </div>
    </section>
  )
}
