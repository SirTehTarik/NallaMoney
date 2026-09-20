import { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { Card, PrimaryButton, GhostButton, TEXT_PRIMARY, TEXT_MUTED, EXPENSE_COLOR, INCOME_COLOR, SURFACE_RAISED, BORDER, fmt } from './ui';

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

  const barColor = isOverBudget ? EXPENSE_COLOR : percentage > 75 ? '#f59e0b' : INCOME_COLOR;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px 11px 36px', borderRadius: 10, fontSize: 13,
    background: SURFACE_RAISED, border: `1px solid ${BORDER}`,
    color: TEXT_PRIMARY, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 150ms ease',
  }

  return (
    <Card style={{ padding: '24px', width: '100%', maxWidth: '600px', margin: '0 auto', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: TEXT_PRIMARY }}>Monthly Budget</h3>
        {monthlyBudget > 0 && !isEditing && (
          <GhostButton onClick={handleStartEditing}>Edit</GhostButton>
        )}
      </div>

      {monthlyBudget === 0 && !isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 0' }}>
          <span style={{ fontSize: '32px' }}>🎯</span>
          <p style={{ color: TEXT_MUTED, fontSize: '13px', textAlign: 'center', maxWidth: '260px' }}>
            Set a monthly spending limit to track your budget
          </p>
          <div style={{ width: '150px' }}>
            <PrimaryButton onClick={handleStartEditing}>Set Budget</PrimaryButton>
          </div>
        </div>
      )}

      {isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: TEXT_MUTED, marginBottom: 6, fontWeight: 500, letterSpacing: '0.04em' }}>BUDGET AMOUNT</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: TEXT_MUTED, fontSize: '14px' }}>$</span>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter amount"
                autoFocus
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}><PrimaryButton onClick={handleSave}>Save</PrimaryButton></div>
            <div style={{ flex: 1 }}><GhostButton onClick={handleCancel}>Cancel</GhostButton></div>
          </div>
        </div>
      )}

      {monthlyBudget > 0 && !isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '32px', fontWeight: 600, color: TEXT_PRIMARY }}>
              {fmt(monthlyBudget)}
            </span>
            <p style={{ margin: '4px 0 0', color: TEXT_MUTED, fontSize: '12px' }}>monthly budget</p>
          </div>

          <div style={{ position: 'relative', height: '28px', background: SURFACE_RAISED, borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${percentage}%`, background: barColor, borderRadius: '14px',
              transition: 'width 0.6s ease', minWidth: percentage > 0 ? '8px' : '0',
            }} />
            <span style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              fontSize: '12px', fontWeight: 600, color: percentage > 45 ? '#fff' : TEXT_MUTED,
            }}>
              {percentage.toFixed(0)}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <div>
              <span style={{ color: TEXT_MUTED }}>Spent </span>
              <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: EXPENSE_COLOR }}>{fmt(totalExpenses)}</span>
            </div>
            <div>
              <span style={{ color: TEXT_MUTED }}>{isOverBudget ? 'Over ' : 'Left '}</span>
              <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: isOverBudget ? EXPENSE_COLOR : INCOME_COLOR }}>{fmt(Math.abs(remaining))}</span>
            </div>
          </div>

          {isOverBudget && (
            <div style={{ padding: '10px', background: `${EXPENSE_COLOR}22`, borderRadius: '10px', fontSize: '12px', color: EXPENSE_COLOR, fontWeight: 500, textAlign: 'center' }}>
              ⚠️ You've exceeded your monthly budget
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
