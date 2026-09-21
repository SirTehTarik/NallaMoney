export const BRAND = '#2563eb'
export const INCOME_COLOR = '#60a5fa'
export const EXPENSE_COLOR = '#f87171'
export const TEXT_PRIMARY = '#eff6ff'
export const TEXT_MUTED = '#93c5fd'
export const TEXT_SECONDARY = '#bfdbfe'
export const BORDER = '#1d4ed8'
export const SURFACE = '#1e40af'
export const SURFACE_RAISED = '#1d4ed8'
export const BG = '#1e3a8a'

export const EXPENSE_COLORS: Record<string, string> = {
  Housing:       '#2563eb',
  Food:          '#0ea5e9',
  Transport:     '#8b5cf6',
  Entertainment: '#f97316',
  Shopping:      '#eab308',
  Health:        '#ec4899',
  Other:         '#94a3b8',
}

export const INCOME_CATS = ['Salary', 'Freelance', 'Investment', 'Other']
export const EXPENSE_CATS = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Other']

export const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
