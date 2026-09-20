import { useState, useMemo } from 'react';
import type { Transaction, SavingsGoal } from '../types';
import { Card, PrimaryButton, GhostButton, TEXT_PRIMARY, TEXT_MUTED, EXPENSE_COLOR, INCOME_COLOR, SURFACE_RAISED, BORDER, fmt, TEXT_SECONDARY, BRAND, SURFACE } from './ui';

interface SavingsGoalPlannerProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthsDiff(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

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

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const habits = useMemo(() => {
    if (transactions.length === 0) return { avgIncome: 0, avgExpense: 0, avgSavings: 0, monthsOfData: 0 };
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

  const handleAddGoal = () => {
    const target = parseFloat(targetAmount);
    if (!name.trim() || isNaN(target) || target <= 0) return;
    onAddGoal({ name: name.trim(), targetAmount: target, savedAmount: 0, deadline: deadline || '' });
    setName(''); setTargetAmount(''); setDeadline(''); setIsAdding(false);
  };

  const handleAddSavings = (goalId: string) => {
    const amount = parseFloat(addSavingsInput);
    if (isNaN(amount) || amount <= 0) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    onUpdateGoal(goalId, { savedAmount: goal.savedAmount + amount });
    setAddSavingsInput(''); setAddToId(null);
  };

  const getGoalInsights = (goal: SavingsGoal) => {
    const remaining = goal.targetAmount - goal.savedAmount;
    const progress = (goal.savedAmount / goal.targetAmount) * 100;
    const monthsToGoal = habits.avgSavings > 0 ? remaining / habits.avgSavings : Infinity;
    let requiredMonthlySaving = 0;
    let monthsUntilDeadline = 0;
    let isOnTrack = true;
    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline);
      monthsUntilDeadline = Math.max(0, monthsDiff(new Date(), deadlineDate));
      requiredMonthlySaving = monthsUntilDeadline > 0 ? remaining / monthsUntilDeadline : remaining;
      isOnTrack = habits.avgSavings >= requiredMonthlySaving || remaining <= 0;
    }
    return { remaining: Math.max(0, remaining), progress: Math.min(100, progress), monthsToGoal, requiredMonthlySaving, monthsUntilDeadline, isOnTrack, isComplete: remaining <= 0 };
  };

  const getProgressColor = (progress: number, isOnTrack: boolean) => {
    if (progress >= 100) return INCOME_COLOR;
    if (!isOnTrack) return EXPENSE_COLOR;
    if (progress > 60) return INCOME_COLOR;
    if (progress > 30) return '#f59e0b';
    return BRAND;
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
    background: SURFACE_RAISED, border: `1px solid ${BORDER}`,
    color: TEXT_PRIMARY, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 150ms ease',
  };

  return (
    <Card style={{ padding: '24px', width: '100%', maxWidth: '600px', margin: '0 auto', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: TEXT_PRIMARY }}>Savings Goals</h3>
        {!isAdding && <GhostButton onClick={() => setIsAdding(true)}>+ Add Goal</GhostButton>}
      </div>

      {habits.monthsOfData > 0 && (
        <div style={{
          display: 'flex', gap: '8px', padding: '12px', marginBottom: '20px',
          background: habits.avgSavings > 0 ? `${INCOME_COLOR}1a` : `${EXPENSE_COLOR}1a`,
          borderRadius: '12px', fontSize: '12px', alignItems: 'center',
        }}>
          <span style={{ fontSize: '20px' }}>{habits.avgSavings > 0 ? '📊' : '⚠️'}</span>
          <div style={{ color: TEXT_SECONDARY, lineHeight: 1.4 }}>
            Based on {habits.monthsOfData} month{habits.monthsOfData > 1 ? 's' : ''} of data, you save{' '}
            <span style={{ fontWeight: 600, color: habits.avgSavings > 0 ? INCOME_COLOR : EXPENSE_COLOR }}>
              {fmt(Math.abs(habits.avgSavings))}/mo
            </span>
            {habits.avgSavings <= 0 && ' (you\'re spending more than you earn)'}
          </div>
        </div>
      )}

      {isAdding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px', background: SURFACE_RAISED, borderRadius: '12px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: TEXT_MUTED, marginBottom: 6, fontWeight: 500, letterSpacing: '0.04em' }}>GOAL NAME</label>
            <input type="text" placeholder="e.g., New Laptop" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: TEXT_MUTED, marginBottom: 6, fontWeight: 500, letterSpacing: '0.04em' }}>TARGET AMOUNT</label>
            <input type="number" placeholder="0.00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} style={inputStyle} min="0" step="0.01" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: TEXT_MUTED, marginBottom: 6, fontWeight: 500, letterSpacing: '0.04em' }}>DEADLINE (OPTIONAL)</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} min={new Date().toISOString().split('T')[0]} />
          </div>

          {targetAmount && parseFloat(targetAmount) > 0 && habits.avgSavings > 0 && (
            <div style={{ fontSize: '12px', color: TEXT_SECONDARY, padding: '10px', background: `${BRAND}1a`, borderRadius: '10px', borderLeft: `3px solid ${BRAND}` }}>
              💡 At your current pace, this will take{' '}
              <span style={{ fontWeight: 600, color: BRAND }}>~{Math.ceil(parseFloat(targetAmount) / habits.avgSavings)} months</span>
              {deadline && (() => {
                const monthsLeft = monthsDiff(new Date(), new Date(deadline));
                const needed = parseFloat(targetAmount) / Math.max(1, monthsLeft);
                return (
                  <>
                    {'. To meet your deadline, save '}
                    <span style={{ fontWeight: 600, color: needed > habits.avgSavings ? EXPENSE_COLOR : INCOME_COLOR }}>{fmt(needed)}/mo</span>
                  </>
                );
              })()}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}><PrimaryButton onClick={handleAddGoal}>Create Goal</PrimaryButton></div>
            <div style={{ flex: 1 }}><GhostButton onClick={() => { setIsAdding(false); setName(''); setTargetAmount(''); setDeadline(''); }}>Cancel</GhostButton></div>
          </div>
        </div>
      )}

      {goals.length === 0 && !isAdding && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '32px 16px' }}>
          <span style={{ fontSize: '40px' }}>🏦</span>
          <p style={{ margin: 0, color: TEXT_MUTED, fontSize: '13px', textAlign: 'center', lineHeight: 1.5 }}>
            Set a savings goal and we'll tell you how to get there based on your habits
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {goals.map((goal) => {
          const insights = getGoalInsights(goal);
          const progressColor = getProgressColor(insights.progress, insights.isOnTrack);

          return (
            <div key={goal.id} style={{
              display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px',
              background: SURFACE, borderRadius: '12px', borderLeft: `3px solid ${progressColor}`,
              border: `1px solid ${BORDER}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: TEXT_PRIMARY, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{insights.isComplete ? '🎉' : '🎯'}</span>
                    <span>{goal.name}</span>
                  </div>
                  {goal.deadline && (
                    <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '4px' }}>
                      Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {insights.monthsUntilDeadline > 0 && ` · ${insights.monthsUntilDeadline} month${insights.monthsUntilDeadline !== 1 ? 's' : ''} left`}
                    </div>
                  )}
                </div>
                <button onClick={() => onDeleteGoal(goal.id)} style={{ background: 'none', border: 'none', color: TEXT_MUTED, cursor: 'pointer', fontSize: '18px' }}>✕</button>
              </div>

              <div>
                <div style={{ position: 'relative', height: '22px', background: SURFACE_RAISED, borderRadius: '11px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${insights.progress}%`, background: progressColor, borderRadius: '11px',
                    transition: 'width 0.6s ease', minWidth: insights.progress > 0 ? '8px' : '0',
                    boxShadow: `0 0 6px ${progressColor}44`,
                  }} />
                  <span style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '11px', fontWeight: 600, color: insights.progress > 40 ? '#fff' : TEXT_MUTED,
                  }}>
                    {insights.progress.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: TEXT_MUTED }}>Saved <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: INCOME_COLOR }}>{fmt(goal.savedAmount)}</span></span>
                <span style={{ color: TEXT_MUTED }}>of <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: TEXT_PRIMARY }}>{fmt(goal.targetAmount)}</span></span>
              </div>

              {!insights.isComplete && habits.monthsOfData > 0 && (
                <div style={{ fontSize: '12px', color: TEXT_SECONDARY, padding: '8px 10px', background: `${BRAND}1a`, borderRadius: '8px', lineHeight: 1.5 }}>
                  {habits.avgSavings > 0 ? (
                    <>
                      💡 At your pace (<span style={{ fontWeight: 600, color: INCOME_COLOR }}>{fmt(habits.avgSavings)}/mo</span>), you'll reach this in{' '}
                      <span style={{ fontWeight: 600, color: BRAND }}>~{Math.ceil(insights.monthsToGoal)} month{Math.ceil(insights.monthsToGoal) !== 1 ? 's' : ''}</span>
                      {goal.deadline && !insights.isOnTrack && (
                        <>. Need <span style={{ fontWeight: 600, color: EXPENSE_COLOR }}>{fmt(insights.requiredMonthlySaving)}/mo</span> to meet deadline</>
                      )}
                      {goal.deadline && insights.isOnTrack && <span style={{ color: INCOME_COLOR }}> — on track! ✓</span>}
                    </>
                  ) : (
                    <span style={{ color: EXPENSE_COLOR }}>⚠️ You're currently spending more than you earn.</span>
                  )}
                </div>
              )}

              {insights.isComplete && (
                <div style={{ textAlign: 'center', padding: '8px', background: `${INCOME_COLOR}1a`, borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: INCOME_COLOR }}>
                  🎉 Goal reached!
                </div>
              )}

              {!insights.isComplete && (
                addToId === goal.id ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" placeholder="Amount" value={addSavingsInput} onChange={(e) => setAddSavingsInput(e.target.value)} autoFocus min="0" step="0.01" style={{ ...inputStyle, padding: '8px 12px', flex: 1 }} />
                    <PrimaryButton onClick={() => handleAddSavings(goal.id)}>Add</PrimaryButton>
                    <GhostButton onClick={() => { setAddToId(null); setAddSavingsInput(''); }}>✕</GhostButton>
                  </div>
                ) : (
                  <button onClick={() => setAddToId(goal.id)} style={{ background: `${BRAND}1a`, border: `1px dashed ${BRAND}`, borderRadius: '8px', color: BRAND, cursor: 'pointer', padding: '8px', fontSize: '13px', fontWeight: 500, width: '100%' }}>
                    + Add Savings
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
