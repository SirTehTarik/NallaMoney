import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, PrimaryButton, TEXT_PRIMARY, TEXT_MUTED, EXPENSE_COLOR, SURFACE_RAISED, BORDER, BRAND, TEXT_SECONDARY } from './ui';

interface AuthProps {
  onSuccess: (userId: string) => void;
  onClose?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.is_anonymous) {
          const { data, error } = await supabase.auth.updateUser({ email, password });
          if (error) throw error;
          if (data.user) {
            const isConfirmed = data.user.email_confirmed_at;
            if (!isConfirmed) alert("Verification link sent! Please check your inbox to confirm your email and complete account setup.");
            else alert("Account created successfully! Your guest data is now synced to your cloud account.");
            onSuccess(data.user.id);
          }
        } else {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (data.user) {
            const isConfirmed = data.user.email_confirmed_at;
            if (!isConfirmed && !data.session) alert("Verification link sent! Please check your inbox to confirm your email.");
            else alert("Sign up successful!");
            onSuccess(data.user.id);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onSuccess(data.user.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
    background: SURFACE_RAISED, border: `1px solid ${BORDER}`,
    color: TEXT_PRIMARY, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 150ms ease',
  };

  return (
    <Card style={{ padding: '28px', maxWidth: '400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, color: TEXT_PRIMARY }}>
          {isSignUp ? 'Create Cloud Account' : 'Sign In'}
        </h3>
        {onClose && (
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: TEXT_MUTED, cursor: 'pointer', fontSize: '16px' }}>✕</button>
        )}
      </div>

      <p style={{ color: TEXT_SECONDARY, fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
        {isSignUp ? 'Secure your guest transactions and budget goal by creating a cloud account.' : 'Log in to sync your finance dashboard across all your devices.'}
      </p>

      {errorMsg && (
        <div style={{ color: EXPENSE_COLOR, background: `${EXPENSE_COLOR}1a`, padding: '12px', borderRadius: '10px', fontSize: '13px', borderLeft: `3px solid ${EXPENSE_COLOR}` }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="auth-email" style={{ display: 'block', fontSize: 11, color: TEXT_MUTED, marginBottom: 6, fontWeight: 500, letterSpacing: '0.04em' }}>EMAIL ADDRESS</label>
          <input id="auth-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} style={inputStyle} />
        </div>

        <div>
          <label htmlFor="auth-password" style={{ display: 'block', fontSize: 11, color: TEXT_MUTED, marginBottom: 6, fontWeight: 500, letterSpacing: '0.04em' }}>PASSWORD</label>
          <input id="auth-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} style={inputStyle} />
        </div>

        <div style={{ marginTop: '8px' }}>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up & Sync Data' : 'Log In'}
          </PrimaryButton>
        </div>
      </form>

      <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '4px' }}>
        <span style={{ color: TEXT_SECONDARY }}>{isSignUp ? 'Already have an account? ' : "Want to sync across devices? "}</span>
        <button type="button" onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }} style={{ background: 'transparent', border: 'none', color: BRAND, fontWeight: 600, padding: 0, cursor: 'pointer' }}>
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </div>
    </Card>
  );
};
