import { useState, useEffect } from 'react';
import type { Transaction, SavingsGoal } from './types';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { SpendingChart } from './components/SpendingChart';
import { MonthlyTrend } from './components/MonthlyTrend';
import { BudgetGoal } from './components/BudgetGoal';
import { SavingsGoalPlanner } from './components/SavingsGoalPlanner';
import { DataManagement } from './components/DataManagement';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nalla-transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }
    return [];
  });

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('nalla-monthly-budget');
    if (saved) {
      const parsed = parseFloat(saved);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('nalla-savings-goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse savings goals", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('nalla-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nalla-monthly-budget', String(monthlyBudget));
  }, [monthlyBudget]);

  useEffect(() => {
    localStorage.setItem('nalla-savings-goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = { ...goal, id: crypto.randomUUID() };
    setSavingsGoals(prev => [newGoal, ...prev]);
  };

  const handleUpdateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const handleDeleteGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleImportTransactions = (importedTransactions: Transaction[]) => {
    setTransactions(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTransactions = importedTransactions.filter(t => !existingIds.has(t.id));
      return [...newTransactions, ...prev];
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Nalla Money</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Minimalist Finance Manager</p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Dashboard transactions={transactions} />
        <BudgetGoal
          transactions={transactions}
          monthlyBudget={monthlyBudget}
          onSetBudget={setMonthlyBudget}
        />
        <TransactionForm onAddTransaction={handleAddTransaction} />
        <SavingsGoalPlanner
          transactions={transactions}
          goals={savingsGoals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
        />
        <MonthlyTrend transactions={transactions} />
        <SpendingChart transactions={transactions} />
        <TransactionList transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
        <DataManagement transactions={transactions} onImportTransactions={handleImportTransactions} />
      </main>
    </div>
  );
}

export default App;
