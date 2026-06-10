import { useState, useMemo } from 'react';
import type { Transaction } from '../types';

interface BudgetGoalProps {
  transactions: Transaction[];
  monthlyBudget: number;
  onSetBudget: (budget: number) => void;
}

export const BudgetGoal = ({ transactions, monthlyBudget, onSetBudget }: BudgetGoalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const totalExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const percentage = monthlyBudget > 0 ? Math.min((totalExpenses / monthlyBudget) * 100, 100) : 0;
  const remaining = monthlyBudget - totalExpenses;
  const isOverBudget = remaining < 0;

  const handleStartEditing = () => {
    setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const value = parseFloat(budgetInput);
    if (!isNaN(value) && value > 0) {
      onSetBudget(value);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setBudgetInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const barColor = isOverBudget
    ? 'var(--expense-color)'
    : percentage > 75
      ? '#f59e0b'
      : 'var(--income-color)';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="flex-between" style={{ alignItems: 'center' }}>
        <h3 className="section-title">Monthly Budget</h3>
        {monthlyBudget > 0 && !isEditing && (
          <button
            onClick={handleStartEditing}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: 'var(--border-radius-sm)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-highlight)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            Edit
          </button>
        )}
      </div>

      {/* Empty State */}
      {monthlyBudget === 0 && !isEditing && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem 1rem',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>🎯</span>
          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: '260px',
            }}
          >
            Set a monthly spending limit to track your budget
          </p>
          <button
            className="btn-primary"
            onClick={handleStartEditing}
            style={{
              marginTop: '0.25rem',
              padding: '0.65rem 2rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              width: 'auto',
            }}
          >
            Set Budget
          </button>
        </div>
      )}

      {/* Editing State */}
      {isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Input Row */}
          <div>
            <label>Budget Amount</label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  fontWeight: 500,
                  pointerEvents: 'none',
                }}
              >
                $
              </span>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter amount"
                autoFocus
                style={{ paddingLeft: '2rem' }}
              />
            </div>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button
              className="btn-primary"
              onClick={handleSave}
              style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}
            >
              Save
            </button>
            <button
              className="btn-ghost"
              onClick={handleCancel}
              style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Progress Section */}
      {monthlyBudget > 0 && !isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Budget Amount */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ${monthlyBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              monthly budget
            </p>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              position: 'relative',
              height: '28px',
              background: 'var(--surface-highlight)',
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentage}%`,
                background: barColor,
                borderRadius: '14px',
                transition: 'width 0.6s ease, background 0.3s ease',
                minWidth: percentage > 0 ? '8px' : '0',
                boxShadow: `0 0 8px ${isOverBudget ? 'rgba(244,63,94,0.3)' : percentage > 75 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
              }}
            />
            {/* Percentage text overlaid on bar */}
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: percentage > 45 ? '#fff' : 'var(--text-secondary)',
                textShadow: percentage > 45 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {percentage.toFixed(0)}%
            </span>
          </div>

          {/* Spent / Remaining */}
          <div className="flex-between" style={{ fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Spent </span>
              <span style={{ fontWeight: 600, color: 'var(--expense-color)' }}>
                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isOverBudget ? 'Over ' : 'Left '}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: isOverBudget ? 'var(--expense-color)' : 'var(--income-color)',
                }}
              >
                ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Over budget warning */}
          {isOverBudget && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                background: 'var(--expense-bg)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--expense-color)',
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              ⚠️ You've exceeded your monthly budget
            </div>
          )}
        </div>
      )}
    </div>
  );
};
