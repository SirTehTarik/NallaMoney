import { useState, useRef } from 'react'
import type { Transaction } from '../types'
import {
  TEXT_PRIMARY, TEXT_MUTED, BORDER, SURFACE, SURFACE_RAISED, BG,
  INCOME_COLOR, EXPENSE_COLOR, INCOME_CATS, EXPENSE_CATS,
  PrimaryButton
} from './ui'
import { supabase } from '../supabaseClient'

export function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (t: Omit<Transaction, 'id'>) => void }) {
  const [type, setType]               = useState<'income' | 'expense'>('expense')
  const [amount, setAmount]           = useState('')
  const [category, setCategory]       = useState('Food')
  const [note, setNote]               = useState('')
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting]   = useState(false)
  const [extracting, setExtracting]   = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError]             = useState('')

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message
    return 'Unknown error'
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError('');

    try {
      // apiKey is no longer needed on the frontend!

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          
          const { data, error } = await supabase.functions.invoke('analyze-receipt', {
            body: { base64Data, mimeType: file.type }
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          if (data?.text) {
            const parsed = JSON.parse(data.text);
            if (parsed.amount) setAmount(parsed.amount.toString());
            if (parsed.category && EXPENSE_CATS.includes(parsed.category)) setCategory(parsed.category);
            if (parsed.note) setNote(parsed.note);
            if (parsed.date) setDate(parsed.date);
            setType('expense');
          }
        } catch (err: unknown) {
          console.error(err);
          setError('Failed to extract data: ' + getErrorMessage(err));
        } finally {
          setExtracting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setError('Failed to extract data: Failed to read file');
        setExtracting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to extract data: ' + getErrorMessage(err));
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submit = () => {
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount greater than 0.')
      return
    }
    if (!note.trim()) {
      setError('Please enter a description for this transaction.')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      onAdd({ type, amount: amt, category, note: note.trim(), date })
      onClose()
    }, 400)
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
    background: SURFACE_RAISED, border: `1px solid ${BORDER}`,
    color: TEXT_PRIMARY, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 150ms ease',
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 440, borderRadius: 20, padding: 28,
        background: SURFACE, border: `1px solid ${BORDER}`,
        display: 'flex', flexDirection: 'column', gap: 20,
        animation: 'slideUp 180ms ease',
      }}>
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: TEXT_PRIMARY }}>New Transaction</h2>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={extracting}
              style={{
                background: 'linear-gradient(135deg, #10b98122, #05966922)',
                border: '1px solid #10b98144',
                color: '#34d399',
                padding: '4px 10px',
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 600,
                cursor: extracting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {extracting ? (
                <>
                  <span style={{ display: 'inline-block', width: 10, height: 10, border: `2px solid #34d399`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Extracting...
                </>
              ) : 'Extract from Receipt 📸'}
            </button>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: SURFACE_RAISED, border: `1px solid ${BORDER}`, color: TEXT_MUTED, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Type toggle */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          capture="environment"
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }} 
        />
        <div style={{ display: 'flex', gap: 8, padding: 4, borderRadius: 12, background: SURFACE_RAISED }}>
          {(['expense', 'income'] as const).map(t => (
            <button key={t} onClick={() => { setType(t); setCategory(t === 'income' ? 'Salary' : 'Food') }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
                border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                transition: 'background 150ms ease, color 150ms ease',
                background: type === t ? '#1e293b' : 'transparent',
                color: type === t
                  ? (t === 'income' ? INCOME_COLOR : EXPENSE_COLOR)
                  : TEXT_MUTED,
              }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Amount (USD)', node: <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={fieldStyle} /> },
            { label: 'Category', node:
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...fieldStyle, colorScheme: 'dark' }}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select> },
            { label: 'Description', node: <input type="text" placeholder="What was this for?" value={note} onChange={e => setNote(e.target.value)} style={fieldStyle} /> },
            { label: 'Date', node: <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...fieldStyle, colorScheme: 'dark' }} /> },
          ].map(({ label, node }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: 11, color: TEXT_MUTED, marginBottom: 6, fontWeight: 500, letterSpacing: '0.04em' }}>{label}</label>
              {node}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ color: EXPENSE_COLOR, background: `${EXPENSE_COLOR}1a`, padding: '10px 14px', borderRadius: '8px', fontSize: '13px', borderLeft: `3px solid ${EXPENSE_COLOR}` }}>
            {error}
          </div>
        )}

        <PrimaryButton onClick={submit}>
          {submitting
            ? <span style={{ display: 'inline-block', width: 14, height: 14, border: `2px solid ${BG}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            : '＋ '}
          {submitting ? 'Adding…' : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </PrimaryButton>
      </div>
    </div>
  )
}
