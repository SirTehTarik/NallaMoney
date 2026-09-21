import { useState } from 'react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import type { Transaction } from '../types'
import {
  TEXT_PRIMARY, TEXT_MUTED, TEXT_SECONDARY, BORDER,
  INCOME_COLOR, EXPENSE_COLOR, EXPENSE_COLORS,
  fmt, fmtDate, Card, SectionLabel, ChartTooltip, SURFACE_RAISED
} from './ui'

export function Dashboard({ transactions }: { transactions: Transaction[] }) {
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly')

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense

  const catMap: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] ?? 0) + t.amount
  })
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }))
  const recent  = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  // Derive data for Area Chart
  const timeMap: Record<string, { income: number, expense: number, timestamp: number }> = {}
  transactions.forEach(t => {
    const entry = (() => {
      if (timeframe === 'monthly') {
        const d = new Date(t.date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // e.g., 2024-09
        const timestamp = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
        return { key, timestamp }
      }
      const d = new Date(t.date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
      const start = new Date(d.setDate(diff))
      start.setHours(0,0,0,0)
      const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
      const timestamp = start.getTime()
      return { key, timestamp }
    })()

    if (!timeMap[entry.key]) {
      timeMap[entry.key] = { income: 0, expense: 0, timestamp: entry.timestamp }
    }

    if (t.type === 'income') timeMap[entry.key].income += t.amount
    else timeMap[entry.key].expense += t.amount
  })

  const chartData = Object.entries(timeMap)
    .sort(([, a], [, b]) => a.timestamp - b.timestamp) // sort chronologically
    .map(([, data]) => {
      const d = new Date(data.timestamp)
      const label = timeframe === 'monthly'
        ? d.toLocaleDateString('en-US', { month: 'short' })
        : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      return { label, income: data.income, expense: data.expense }
    })

  return (
    <div className="responsive-container">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: TEXT_PRIMARY, letterSpacing: '-0.02em' }}>Overview</h1>
      </div>

      {/* Balance hero + income/expense */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        {/* Balance — most important number, largest display */}
        <Card style={{ padding: '24px 24px' }} hover>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT_MUTED }}>Total Balance</p>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 32, fontWeight: 600, color: TEXT_PRIMARY, marginTop: 10, letterSpacing: '-0.02em' }}>{fmt(balance)}</p>
          <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6 }}>All accounts</p>
        </Card>

        {/* Income — secondary stat, no brand color */}
        <Card style={{ padding: '24px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT_MUTED }}>Income</p>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 600, color: INCOME_COLOR, marginTop: 10 }}>{fmt(totalIncome)}</p>
        </Card>

        {/* Expenses */}
        <Card style={{ padding: '24px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT_MUTED }}>Expenses</p>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 600, color: EXPENSE_COLOR, marginTop: 10 }}>{fmt(totalExpense)}</p>
        </Card>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <Card style={{ padding: '24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <SectionLabel>Income & Expenses</SectionLabel>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.15)', padding: 4, borderRadius: 8, marginTop: -8 }}>
              {(['weekly', 'monthly'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeframe === t ? SURFACE_RAISED : 'transparent',
                    color: timeframe === t ? TEXT_PRIMARY : TEXT_MUTED,
                    boxShadow: timeframe === t ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={INCOME_COLOR} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={EXPENSE_COLOR} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income"  name="Income"  stroke={INCOME_COLOR}  strokeWidth={2} fill="url(#gIncome)"  dot={false} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke={EXPENSE_COLOR} strokeWidth={2} fill="url(#gExpense)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: '24px 24px' }}>
          <SectionLabel>Spending Breakdown</SectionLabel>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={EXPENSE_COLORS[entry.name] ?? '#64748b'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(Number(v ?? 0))} contentStyle={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT_PRIMARY, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {pieData.length === 0 && <p style={{ textAlign: 'center', fontSize: 12, color: TEXT_MUTED }}>No expense data</p>}
            {pieData.map(entry => (
              <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: EXPENSE_COLORS[entry.name] ?? '#64748b', flexShrink: 0 }} />
                  <span style={{ color: TEXT_SECONDARY }}>{entry.name}</span>
                </div>
                <span style={{ color: TEXT_MUTED, fontFamily: 'DM Mono, monospace' }}>{fmt(entry.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card style={{ padding: '24px 24px' }}>
        <SectionLabel>Recent Transactions</SectionLabel>
        {recent.length === 0 && <p style={{ fontSize: 13, color: TEXT_MUTED }}>No recent transactions.</p>}
        {recent.map((t, i) => (
          <RecentRow key={t.id} t={t} last={i === recent.length - 1} />
        ))}
      </Card>
    </div>
  )
}

function RecentRow({ t, last }: { t: Transaction; last: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 0',
        borderBottom: last ? 'none' : `1px solid ${hover ? '#1e293b' : '#131f30'}`,
        transition: 'border-color 150ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: t.type === 'income' ? `${INCOME_COLOR}18` : `${EXPENSE_COLOR}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: t.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR,
          transition: 'background 150ms ease',
        }}>
          {t.type === 'income' ? '↑' : '↓'}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: hover ? TEXT_PRIMARY : TEXT_SECONDARY, transition: 'color 150ms ease' }}>{t.note}</p>
          <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{fmtDate(t.date)} · {t.category}</p>
        </div>
      </div>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 600, color: t.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}>
        {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
      </span>
    </div>
  )
}
