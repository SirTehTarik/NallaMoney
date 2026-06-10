import { useState, useMemo } from 'react';
import type { Transaction, SavingsGoal } from '../types';

interface SavingsGoalPlannerProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

/* ── Helpers ── */

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthsDiff(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

/* ── Component ── */

export const SavingsGoalPlanner = ({
  transactions,
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: SavingsGoalPlannerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addToId, setAddToId] = useState<string | null>(null);
  const [addSavingsInput, setAddSavingsInput] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  /* ── Analyze financial habits ── */
  const habits = useMemo(() => {
    if (transactions.length === 0) {
      return { avgIncome: 0, avgExpense: 0, avgSavings: 0, monthsOfData: 0 };
    }

    // Group transactions by month
    const monthlyMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = getMonthKey(d);
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
      if (t.type === 'income') monthlyMap[key].income += t.amount;
      else monthlyMap[key].expense += t.amount;
    });

    const months = Object.values(monthlyMap);
    const monthsOfData = months.length;

    const totalIncome = months.reduce((s, m) => s + m.income, 0);
    const totalExpense = months.reduce((s, m) => s + m.expense, 0);

    return {
      avgIncome: totalIncome / monthsOfData,
      avgExpense: totalExpense / monthsOfData,
      avgSavings: (totalIncome - totalExpense) / monthsOfData,
      monthsOfData,
    };
  }, [transactions]);

  /* ── Handlers ── */

  const handleAddGoal = () => {
    const target = parseFloat(targetAmount);
    if (!name.trim() || isNaN(target) || target <= 0) return;

    onAddGoal({
      name: name.trim(),
      targetAmount: target,
      savedAmount: 0,
      deadline: deadline || '',
    });

    setName('');
    setTargetAmount('');
    setDeadline('');
    setIsAdding(false);
  };

  const handleAddSavings = (goalId: string) => {
    const amount = parseFloat(addSavingsInput);
    if (isNaN(amount) || amount <= 0) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    onUpdateGoal(goalId, { savedAmount: goal.savedAmount + amount });
    setAddSavingsInput('');
    setAddToId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action();
    if (e.key === 'Escape') {
      setIsAdding(false);
      setAddToId(null);
    }
  };

  /* ── Compute insights per goal ── */
  const getGoalInsights = (goal: SavingsGoal) => {
    const remaining = goal.targetAmount - goal.savedAmount;
    const progress = (goal.savedAmount / goal.targetAmount) * 100;

    // Based on average savings
    const monthsToGoal = habits.avgSavings > 0 ? remaining / habits.avgSavings : Infinity;

    // Deadline based
    let requiredMonthlySaving = 0;
    let monthsUntilDeadline = 0;
    let isOnTrack = true;

    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline);
      monthsUntilDeadline = Math.max(0, monthsDiff(new Date(), deadlineDate));
      requiredMonthlySaving = monthsUntilDeadline > 0 ? remaining / monthsUntilDeadline : remaining;
      isOnTrack = habits.avgSavings >= requiredMonthlySaving || remaining <= 0;
    }

    return {
      remaining: Math.max(0, remaining),
      progress: Math.min(100, progress),
      monthsToGoal,
      requiredMonthlySaving,
      monthsUntilDeadline,
      isOnTrack,
      isComplete: remaining <= 0,
    };
  };

  const getProgressColor = (progress: number, isOnTrack: boolean) => {
    if (progress >= 100) return 'var(--income-color)';
    if (!isOnTrack) return 'var(--expense-color)';
    if (progress > 60) return 'var(--income-color)';
    if (progress > 30) return '#f59e0b';
    return 'var(--accent-primary)';
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="flex-between">
        <h3 className="section-title">Savings Goals</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 'var(--border-radius-sm)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-highlight)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            + Add Goal
          </button>
        )}
      </div>

      {/* Financial Habits Summary */}
      {habits.monthsOfData > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem',
          background: habits.avgSavings > 0 ? 'var(--income-bg)' : 'var(--expense-bg)',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: '0.8rem',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '1.25rem' }}>{habits.avgSavings > 0 ? '📊' : '⚠️'}</span>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Based on {habits.monthsOfData} month{habits.monthsOfData > 1 ? 's' : ''} of data, you save{' '}
            <span style={{
              fontWeight: 600,
              color: habits.avgSavings > 0 ? 'var(--income-color)' : 'var(--expense-color)',
            }}>
              ${Math.abs(habits.avgSavings).toFixed(2)}/mo
            </span>
            {habits.avgSavings <= 0 && ' (you\'re spending more than you earn)'}
          </div>
        </div>
      )}

      {/* Add Goal Form */}
      {isAdding && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          padding: '1rem',
          background: 'rgba(0,0,0,0.15)',
          borderRadius: 'var(--border-radius-sm)',
        }}>
          <div>
            <label>Goal Name</label>
            <input
              type="text"
              placeholder="e.g., New Laptop, Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAddGoal)}
              autoFocus
            />
          </div>
          <div>
            <label>Target Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAddGoal)}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label>Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ colorScheme: 'dark', cursor: 'pointer' }}
            />
          </div>

          {/* Preview insight */}
          {targetAmount && parseFloat(targetAmount) > 0 && habits.avgSavings > 0 && (
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              padding: '0.5rem 0.75rem',
              background: 'rgba(99,102,241,0.1)',
              borderRadius: 'var(--border-radius-sm)',
              borderLeft: '3px solid var(--accent-primary)',
            }}>
              💡 At your current pace, this will take{' '}
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                ~{Math.ceil(parseFloat(targetAmount) / habits.avgSavings)} months
              </span>
              {deadline && (() => {
                const monthsLeft = monthsDiff(new Date(), new Date(deadline));
                const needed = parseFloat(targetAmount) / Math.max(1, monthsLeft);
                return (
                  <>
                    {'. To meet your deadline, save '}
                    <span style={{ fontWeight: 600, color: needed > habits.avgSavings ? 'var(--expense-color)' : 'var(--income-color)' }}>
                      ${needed.toFixed(2)}/mo
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button className="btn-primary" onClick={handleAddGoal} style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>
              Create Goal
            </button>
            <button
              className="btn-ghost"
              onClick={() => { setIsAdding(false); setName(''); setTargetAmount(''); setDeadline(''); }}
              style={{ flex: 1, fontSize: '0.875rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 && !isAdding && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.75rem', padding: '2rem 1rem',
        }}>
          <span style={{ fontSize: '2.5rem' }}>🏦</span>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.5 }}>
            Set a savings goal and we'll tell you how to get there based on your habits
          </p>
        </div>
      )}

      {goals.map((goal) => {
        const insights = getGoalInsights(goal);
        const progressColor = getProgressColor(insights.progress, insights.isOnTrack);

        return (
          <div key={goal.id} style={{
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            padding: '1rem',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: 'var(--border-radius-sm)',
            borderLeft: `3px solid ${progressColor}`,
          }}>
            {/* Goal header */}
            <div className="flex-between">
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span>{insights.isComplete ? '🎉' : '🎯'}</span>
                  <span>{goal.name}</span>
                </div>
                {goal.deadline && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {insights.monthsUntilDeadline > 0 && ` · ${insights.monthsUntilDeadline} month${insights.monthsUntilDeadline !== 1 ? 's' : ''} left`}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDeleteGoal(goal.id)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', padding: '0.25rem', fontSize: '1.1rem', lineHeight: 1,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--expense-color)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                title="Delete goal"
              >
                ×
              </button>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{
                position: 'relative', height: '22px',
                background: 'var(--surface-highlight)', borderRadius: '11px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${insights.progress}%`,
                  background: progressColor, borderRadius: '11px',
                  transition: 'width 0.6s ease',
                  minWidth: insights.progress > 0 ? '8px' : '0',
                  boxShadow: `0 0 6px ${progressColor}44`,
                }} />
                <span style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.7rem', fontWeight: 600,
                  color: insights.progress > 40 ? '#fff' : 'var(--text-secondary)',
                  pointerEvents: 'none',
                }}>
                  {insights.progress.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Amount info */}
            <div className="flex-between" style={{ fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Saved{' '}
                <span style={{ fontWeight: 600, color: 'var(--income-color)' }}>
                  ${goal.savedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                of{' '}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            </div>

            {/* Smart insights */}
            {!insights.isComplete && habits.monthsOfData > 0 && (
              <div style={{
                fontSize: '0.78rem', color: 'var(--text-secondary)',
                padding: '0.5rem 0.65rem',
                background: 'rgba(99,102,241,0.08)',
                borderRadius: 'var(--border-radius-sm)',
                lineHeight: 1.5,
              }}>
                {habits.avgSavings > 0 ? (
                  <>
                    💡 At your current pace ({' '}
                    <span style={{ fontWeight: 600, color: 'var(--income-color)' }}>
                      ${habits.avgSavings.toFixed(2)}/mo
                    </span>
                    {' '}savings), you'll reach this in{' '}
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                      ~{Math.ceil(insights.monthsToGoal)} month{Math.ceil(insights.monthsToGoal) !== 1 ? 's' : ''}
                    </span>
                    {goal.deadline && !insights.isOnTrack && (
                      <>
                        {'. Need '}
                        <span style={{ fontWeight: 600, color: 'var(--expense-color)' }}>
                          ${insights.requiredMonthlySaving.toFixed(2)}/mo
                        </span>
                        {' to meet deadline'}
                      </>
                    )}
                    {goal.deadline && insights.isOnTrack && (
                      <span style={{ color: 'var(--income-color)' }}> — on track! ✓</span>
                    )}
                  </>
                ) : (
                  <span style={{ color: 'var(--expense-color)' }}>
                    ⚠️ You're currently spending more than you earn. Try reducing expenses to start saving.
                  </span>
                )}
              </div>
            )}

            {/* Completed badge */}
            {insights.isComplete && (
              <div style={{
                textAlign: 'center', padding: '0.5rem',
                background: 'var(--income-bg)', borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem', fontWeight: 600, color: 'var(--income-color)',
              }}>
                🎉 Goal reached!
              </div>
            )}

            {/* Add savings button/form */}
            {!insights.isComplete && (
              addToId === goal.id ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    placeholder="Amount to add"
                    value={addSavingsInput}
                    onChange={(e) => setAddSavingsInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleAddSavings(goal.id))}
                    autoFocus
                    min="0"
                    step="0.01"
                    style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => handleAddSavings(goal.id)}
                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Add
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => { setAddToId(null); setAddSavingsInput(''); }}
                    style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddToId(goal.id)}
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px dashed var(--accent-primary)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                >
                  + Add Savings
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};
