import { useMemo } from 'react';
import type { Transaction } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const { income, expenses, balance } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income: inc, expenses: exp, balance: inc - exp };
  }, [transactions]);

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      {/* Month indicator */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        <span style={{ fontSize: '1.25rem' }}>📅</span>
        <span style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-secondary)', 
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {currentMonth}
        </span>
      </div>

      {/* Balance */}
      <div style={{ marginBottom: '0.25rem' }}>
        <span style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)',
          fontWeight: 400 
        }}>
          Total Balance
        </span>
      </div>
      <div className="text-gradient" style={{ 
        fontSize: '2.75rem', 
        fontWeight: 700, 
        marginBottom: '1.5rem',
        lineHeight: 1.1
      }}>
        ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      
      {/* Income / Expense cards */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ 
          flex: 1, 
          background: 'var(--income-bg)', 
          padding: '1rem', 
          borderRadius: 'var(--border-radius-sm)',
          borderLeft: '3px solid var(--income-color)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.375rem', 
            marginBottom: '0.375rem' 
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--income-color)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Income</span>
          </div>
          <div style={{ color: 'var(--income-color)', fontWeight: 600, fontSize: '1.2rem' }}>
            +${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          background: 'var(--expense-bg)', 
          padding: '1rem', 
          borderRadius: 'var(--border-radius-sm)',
          borderLeft: '3px solid var(--expense-color)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.375rem', 
            marginBottom: '0.375rem' 
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--expense-color)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Expenses</span>
          </div>
          <div style={{ color: 'var(--expense-color)', fontWeight: 600, fontSize: '1.2rem' }}>
            -${expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};
