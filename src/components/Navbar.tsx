import { useState } from 'react'
import { BRAND, BORDER, PrimaryButton } from './ui'

export type Section = 'dashboard' | 'transactions' | 'budget' | 'profile'

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: <IconGrid /> },
  { id: 'transactions', label: 'Transactions', icon: <IconArrows /> },
  { id: 'budget',       label: 'Budget',       icon: <IconTarget /> },
]

function IconGrid()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/></svg> }
function IconArrows() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5.5L6 2.5L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="6" y1="3" x2="6" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 10.5L10 13.5L7 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="10" y1="13" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconTarget() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" opacity=".5"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg> }
function IconBell()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 003.5 6v3.5L2 11h12l-1.5-1.5V6A4.5 4.5 0 008 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }

export function Navbar({ active, setActive, onAdd, userEmail }: {
  active: Section
  setActive: (s: Section) => void
  onAdd: () => void
  userEmail?: string | null
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 60,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <a
          href="#"
          onClick={e => { e.preventDefault(); setActive('dashboard') }}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: BRAND,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 11L6 7L9 10L14 4" stroke="#eff6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            nalla<span style={{ color: BRAND }}>money</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="hide-mobile">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.id} item={item} active={active === item.id} onClick={() => setActive(item.id)} />
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Notification bell */}
        <NotifButton />

        {/* CTA */}
        <div className="hide-mobile">
          <PrimaryButton onClick={onAdd} small>＋ Add Transaction</PrimaryButton>
        </div>

        {/* Avatar */}
        <button
          title={userEmail || "Profile"}
          onClick={() => setActive('profile')}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#dbeafe',
            border: `2px solid ${active === 'profile' ? BRAND : 'transparent'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: BRAND,
            cursor: 'pointer', transition: 'border-color 150ms ease',
            flexShrink: 0,
          }}
        >
          {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'GM'}
        </button>

        {/* Mobile hamburger */}
        <button
          className="show-mobile"
          onClick={() => setMenuOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#64748b' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {menuOpen
              ? <path d="M4 4L16 16M4 16L16 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              : <><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 60, left: 0, right: 0,
          background: 'white', borderBottom: '1px solid #e2e8f0',
          padding: '8px 16px 16px',
          display: 'flex', flexDirection: 'column', gap: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setMenuOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, border: 'none',
                background: active === item.id ? '#eff6ff' : 'transparent',
                color: active === item.id ? BRAND : '#64748b',
                fontSize: 14, fontWeight: active === item.id ? 600 : 400,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
            <PrimaryButton onClick={() => { onAdd(); setMenuOpen(false) }}>＋ Add Transaction</PrimaryButton>
          </div>
        </div>
      )}
    </header>
  )
}

function NavLink({ item, active, onClick }: {
  item: { id: Section; label: string; icon: React.ReactNode }
  active: boolean
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 12px', borderRadius: 8,
        border: 'none', cursor: 'pointer',
        background: active ? '#eff6ff' : hover ? '#f8fafc' : 'transparent',
        color: active ? BRAND : hover ? '#475569' : '#64748b',
        fontSize: 13, fontWeight: active ? 600 : 400,
        transition: 'background 150ms ease, color 150ms ease',
        outline: 'none',
        position: 'relative',
      }}
    >
      <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
      {item.label}
      {/* Active underline pill */}
      {active && (
        <span style={{
          position: 'absolute', bottom: -17, left: '50%',
          transform: 'translateX(-50%)',
          width: 20, height: 2, borderRadius: 99,
          background: BRAND,
        }} />
      )}
    </button>
  )
}

function NotifButton() {
  const [hover, setHover] = useState(false)
  const [open, setOpen] = useState(false)
  const notifications = [
    { title: 'Welcome', body: 'Welcome to NallaMoney!', time: 'Just now' },
  ]
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 34, height: 34, borderRadius: 10, border: `1px solid ${hover ? '#93c5fd' : '#e2e8f0'}`,
          background: hover ? '#f0f9ff' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#64748b', position: 'relative',
          transition: 'background 150ms ease, border-color 150ms ease',
        }}
      >
        <IconBell />
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 6, height: 6, borderRadius: '50%',
          background: BRAND, border: '1.5px solid #1e40af',
        }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
          <div style={{
            position: 'absolute', top: 42, right: 0,
            width: 300, borderRadius: 14,
            background: 'white', border: '1px solid #e2e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 40, overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Notifications</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#dbeafe', color: BRAND, fontWeight: 600 }}>{notifications.length} new</span>
            </div>
            {notifications.map((n, i) => (
              <NotifRow key={i} n={n} last={i === notifications.length - 1} />
            ))}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <button onClick={() => setOpen(false)} style={{ fontSize: 12, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>View all notifications</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function NotifRow({ n, last }: { n: { title: string; body: string; time: string }; last: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '12px 16px',
        borderBottom: last ? 'none' : '1px solid #f1f5f9',
        background: hover ? '#f8fafc' : 'white',
        cursor: 'pointer', transition: 'background 150ms ease',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND, marginTop: 5, flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{n.title}</p>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.body}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{n.time}</p>
      </div>
    </div>
  )
}
