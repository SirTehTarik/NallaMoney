import { useState, useRef } from 'react'
import type { Transaction } from '../types'
import {
  Card, GhostButton, Chip
} from './ui'
import {
  TEXT_PRIMARY, TEXT_MUTED, TEXT_SECONDARY, BORDER, SURFACE,
  INCOME_COLOR, EXPENSE_COLOR, EXPENSE_COLORS,
  fmt, fmtDate
} from '../constants'

export function TransactionView({ transactions, onDelete }: {
  transactions: Transaction[]
  onDelete: (id: string) => void
}) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t =>
      t.note.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  const exportCSV = () => {
    const csv = ['Date,Type,Category,Description,Amount',
      ...transactions.map(t => `${t.date},${t.type},${t.category},"${t.note}",${t.amount}`),
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'nallamoney-transactions.csv'
    a.click()
  }

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    // We keep this purely UI for now. Import logic is handled by DataManagement component if needed.
    alert('Import functionality is handled in the Data Management section or via Supabase.')
    if (e.target) e.target.value = ''
  }

  return (
    <div className="responsive-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: TEXT_PRIMARY, letterSpacing: '-0.02em' }}>Transactions</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <GhostButton onClick={() => fileRef.current?.click()}>↑ Import CSV</GhostButton>
          <GhostButton onClick={exportCSV}>↓ Export CSV</GhostButton>
          <input ref={fileRef} type="file" accept=".csv,.json" style={{ display: 'none' }} onChange={importCSV} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 10, background: SURFACE }}>
          {(['all', 'income', 'expense'] as const).map(f => (
            <FilterTab key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>
        <input
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 180, padding: '8px 14px', borderRadius: 10, fontSize: 13,
            background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT_PRIMARY,
            outline: 'none', transition: 'border-color 150ms ease',
          }}
          onFocus={e => (e.target.style.borderColor = '#3b82f6')}
          onBlur={e => (e.target.style.borderColor = BORDER)}
        />
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px 44px', minWidth: 600,
          padding: '10px 20px',
          borderBottom: `1px solid ${BORDER}`,
          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT_MUTED,
        }}>
          <span>Description</span><span>Category</span><span>Date</span><span style={{ textAlign: 'right' }}>Amount</span><span />
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '48px 0', fontSize: 13, color: TEXT_MUTED }}>No transactions found.</p>
        )}
        {filtered.map((t, i) => (
          <TableRow key={t.id} t={t} last={i === filtered.length - 1} onDelete={onDelete} />
        ))}
        </div>
      </Card>
    </div>
  )
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
        border: 'none', cursor: 'pointer', textTransform: 'capitalize',
        background: active ? '#1d4ed8' : hover ? '#1e40af' : 'transparent',
        color: active ? TEXT_PRIMARY : hover ? TEXT_SECONDARY : TEXT_MUTED,
        transition: 'background 150ms ease, color 150ms ease',
        outline: 'none',
      }}
    >
      {label}
    </button>
  )
}

function TableRow({ t, last, onDelete }: { t: Transaction; last: boolean; onDelete: (id: string) => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px 44px', minWidth: 600,
        alignItems: 'center', padding: '13px 20px',
        borderBottom: last ? 'none' : `1px solid ${hover ? BORDER : '#131f30'}`,
        background: hover ? '#1e40af' : 'transparent',
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: t.type === 'income' ? `${INCOME_COLOR}18` : `${EXPENSE_COLOR}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: t.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR,
        }}>
          {t.type === 'income' ? '↑' : '↓'}
        </div>
        <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>{t.note}</span>
      </div>
      <Chip label={t.category} color={EXPENSE_COLORS[t.category] ?? '#64748b'} />
      <span style={{ fontSize: 12, color: TEXT_MUTED }}>{fmtDate(t.date)}</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 600, textAlign: 'right', color: t.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
        {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
      </span>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <DeleteButton onDelete={() => onDelete(t.id)} />
      </div>
    </div>
  )
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onDelete}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 26, height: 26, borderRadius: 7, border: 'none', cursor: 'pointer',
        background: hover ? `${EXPENSE_COLOR}22` : 'transparent',
        color: hover ? EXPENSE_COLOR : TEXT_MUTED,
        fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >✕</button>
  )
}
