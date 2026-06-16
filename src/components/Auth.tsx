import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

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
        // Get current user to see if we can upgrade an anonymous session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.is_anonymous) {
          // Upgrade current anonymous session to a permanent account (preserves existing data)
          const { data, error } = await supabase.auth.updateUser({
            email,
            password
          });
          if (error) throw error;
          
          if (data.user) {
            // Check if confirmation is required
            const isConfirmed = data.user.email_confirmed_at;
            if (!isConfirmed) {
              alert("Verification link sent! Please check your inbox to confirm your email and complete account setup.");
            } else {
              alert("Account created successfully! Your guest data is now synced to your cloud account.");
            }
            onSuccess(data.user.id);
          }
        } else {
          // Regular signup if no session exists or current user is already permanent
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          
          if (data.user) {
            // Check if email confirmation is required
            const isConfirmed = data.user.email_confirmed_at;
            if (!isConfirmed && !data.session) {
              alert("Verification link sent! Please check your inbox to confirm your email.");
            } else {
              alert("Sign up successful!");
            }
            onSuccess(data.user.id);
          }
        }
      } else {
        // Log in with existing credentials
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onSuccess(data.user.id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1rem 0' }}>
      <div className="flex-between">
        <h3 className="section-title" style={{ fontSize: '1.15rem' }}>
          {isSignUp ? 'Create Cloud Account' : 'Sign In'}
        </h3>
        {onClose && (
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none',
              padding: '4px 8px', 
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        )}
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
        {isSignUp 
          ? 'Secure your guest transactions and budget goal by creating a cloud account.' 
          : 'Log in to sync your finance dashboard across all your devices.'}
      </p>

      {errorMsg && (
        <div style={{ 
          color: 'var(--expense-color)', 
          background: 'var(--expense-bg)', 
          padding: '0.75rem', 
          borderRadius: 'var(--border-radius-sm)', 
          fontSize: '0.85rem',
          borderLeft: '3px solid var(--expense-color)'
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="auth-email">Email Address</label>
          <input
            id="auth-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Please wait...' : isSignUp ? 'Sign Up & Sync Data' : 'Log In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '0.25rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account? ' : "Want to sync across devices? "}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg(null);
          }}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--accent-secondary)', 
            fontWeight: 600, 
            padding: 0,
            cursor: 'pointer'
          }}
        >
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
};
