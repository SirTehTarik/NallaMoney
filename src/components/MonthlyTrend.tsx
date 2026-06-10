import { useState, useMemo } from 'react';
import type { Transaction } from '../types';

interface MonthlyTrendProps {
  transactions: Transaction[];
}

interface MonthData {
  label: string;
  income: number;
  expense: number;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_BAR_HEIGHT = 120;
const MIN_BAR_HEIGHT = 4;

export const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ transactions }) => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const monthlyData = useMemo((): MonthData[] => {
    const now = new Date();
    const months: MonthData[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === year && tDate.getMonth() === month;
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        label: MONTH_LABELS[month],
        income,
        expense,
      });
    }

    return months;
  }, [transactions]);

  const maxValue = useMemo(() => {
    const allValues = monthlyData.flatMap((m) => [m.income, m.expense]);
    return Math.max(...allValues, 1);
  }, [monthlyData]);

  const getBarHeight = (value: number): number => {
    if (value === 0) return MIN_BAR_HEIGHT;
    return Math.max(MIN_BAR_HEIGHT, (value / maxValue) * MAX_BAR_HEIGHT);
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.25rem', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Monthly Overview
        </h3>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: 'var(--income-color)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Income</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: 'var(--expense-color)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Expense</span>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '0.5rem',
          height: MAX_BAR_HEIGHT + 36,
          paddingTop: 8,
        }}
      >
        {monthlyData.map((month, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            {/* Bars container */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 3,
                height: MAX_BAR_HEIGHT,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {/* Income bar */}
              <div
                style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}
                onMouseEnter={() => setHoveredBar(`income-${index}`)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar === `income-${index}` && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: getBarHeight(month.income) + 6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--surface-color)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '4px 8px',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      color: 'var(--income-color)',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {formatAmount(month.income)}
                  </div>
                )}
                <div
                  style={{
                    width: 16,
                    height: getBarHeight(month.income),
                    backgroundColor: 'var(--income-color)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.6s ease, opacity 0.2s ease',
                    opacity: hoveredBar === `income-${index}` ? 1 : 0.85,
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Expense bar */}
              <div
                style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}
                onMouseEnter={() => setHoveredBar(`expense-${index}`)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar === `expense-${index}` && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: getBarHeight(month.expense) + 6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--surface-color)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '4px 8px',
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      color: 'var(--expense-color)',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {formatAmount(month.expense)}
                  </div>
                )}
                <div
                  style={{
                    width: 16,
                    height: getBarHeight(month.expense),
                    backgroundColor: 'var(--expense-color)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.6s ease, opacity 0.2s ease',
                    opacity: hoveredBar === `expense-${index}` ? 1 : 0.85,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            {/* Month label */}
            <span
              style={{
                marginTop: '0.5rem',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {month.label}
            </span>
          </div>
        ))}
      </div>

      {/* Baseline */}
      <div
        style={{
          height: 1,
          backgroundColor: 'var(--glass-border)',
          marginTop: '-1.65rem',
          marginBottom: '1.65rem',
        }}
      />
    </div>
  );
};
