import { useState } from 'react'

interface ChartTooltipPayload {
  name?: string | number
  value?: number | string
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string | number
}

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

export function PrimaryButton({ children, onClick, small, type, disabled }: { children: React.ReactNode; onClick?: () => void; small?: boolean; type?: "button" | "submit" | "reset"; disabled?: boolean }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: BRAND,
        color: BG,
        transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
        boxShadow: pressed || disabled ? 'none' : `0 4px 14px ${BRAND}40`,
        transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease',
        padding: small ? '6px 14px' : '9px 18px',
        borderRadius: 12,
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        outline: 'none',
        opacity: disabled ? 0.6 : 1,
        width: '100%'
      }}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, onClick, type, disabled }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" | "reset"; disabled?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type={type || "button"}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover && !disabled ? '#1d4ed8' : 'transparent',
        color: hover && !disabled ? TEXT_PRIMARY : TEXT_SECONDARY,
        border: `1px solid ${hover && !disabled ? '#2563eb' : BORDER}`,
        transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
        padding: '6px 14px',
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  )
}

export function Card({ children, className, style, hover = false }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  hover?: boolean
}) {
  const [isHover, setIsHover] = useState(false)
  return (
    <div
      className={className}
      onMouseEnter={() => hover && setIsHover(true)}
      onMouseLeave={() => hover && setIsHover(false)}
      style={{
        background: SURFACE,
        border: `1px solid ${isHover ? '#2563eb' : BORDER}`,
        borderRadius: 16,
        transition: 'border-color 180ms ease, box-shadow 180ms ease',
        boxShadow: isHover ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT_MUTED, marginBottom: 16 }}>
      {children}
    </p>
  )
}

export function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 500,
      background: color + '1a', color,
    }}>
      {label}
    </span>
  )
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: SURFACE_RAISED, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, color: TEXT_PRIMARY }}>
      <p style={{ color: TEXT_MUTED, marginBottom: 4, fontWeight: 500 }}>{label}</p>
      {payload.map((p) => (
        <p key={String(p.name)} style={{ color: p.color }}>{p.name}: {fmt(Number(p.value))}</p>
      ))}
    </div>
  )
}
