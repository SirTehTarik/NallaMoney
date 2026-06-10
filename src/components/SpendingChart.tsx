import { useMemo } from 'react';
import type { Transaction } from '../types';

interface SpendingChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c084fc', '#e879f9',
  '#f472b6', '#fb7185', '#f97316', '#facc15', '#34d399',
];

export const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped: Record<string, number> = {};
    expenses.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalExpenses = categoryData.reduce((sum, c) => sum + c.amount, 0);

  const radius = 70;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    let offset = 0;
    return categoryData.map((cat, i) => {
      const pct = totalExpenses > 0 ? cat.amount / totalExpenses : 0;
      const dashLength = pct * circumference;
      const seg = {
        color: COLORS[i % COLORS.length],
        dasharray: `${dashLength} ${circumference - dashLength}`,
        dashoffset: -offset,
        name: cat.name,
        amount: cat.amount,
        pct,
      };
      offset += dashLength;
      return seg;
    });
  }, [categoryData, totalExpenses, circumference]);

  if (categoryData.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>Spending Breakdown</h3>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0', fontStyle: 'italic', fontSize: '0.875rem' }}>
          No expenses to visualize
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>Spending Breakdown</h3>

      {/* Donut Chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke="var(--surface-highlight)"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="90" cy="90" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.dashoffset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
            />
          ))}
          {/* Center text */}
          <text
            x="90" y="86" textAnchor="middle" dominantBaseline="middle"
            fill="var(--text-secondary)" fontSize="11"
            style={{ transform: 'rotate(90deg)', transformOrigin: '90px 90px' }}
          >
            Total Spent
          </text>
          <text
            x="90" y="102" textAnchor="middle" dominantBaseline="middle"
            fill="var(--text-primary)" fontSize="16" fontWeight="700"
            style={{ transform: 'rotate(90deg)', transformOrigin: '90px 90px' }}
          >
            ${totalExpenses.toFixed(2)}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {segments.map((seg, i) => (
          <div key={i} className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', backgroundColor: seg.color, flexShrink: 0
              }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{seg.name}</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              ${seg.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
