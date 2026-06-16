import { useState, useEffect } from 'react';
import type { Transaction, SavingsGoal, TransactionType } from './types';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { SpendingChart } from './components/SpendingChart';
import { MonthlyTrend } from './components/MonthlyTrend';
import { BudgetGoal } from './components/BudgetGoal';
import { SavingsGoalPlanner } from './components/SavingsGoalPlanner';
import { DataManagement } from './components/DataManagement';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize session and auth state listener
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = session.user;
          setUserId(user.id);
          setIsAnonymous(user.is_anonymous || !user.email);
          setUserEmail(user.email || null);
        } else {
          // Auto sign-in anonymously if no session exists
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          if (data?.user) {
            setUserId(data.user.id);
            setIsAnonymous(true);
            setUserEmail(null);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setLoading(false);
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        setUserId(user.id);
        setIsAnonymous(user.is_anonymous || !user.email);
        setUserEmail(user.email || null);
      } else {
        // If logged out, reset user info and trigger anonymous login
        setUserId(null);
        setIsAnonymous(true);
        setUserEmail(null);
        supabase.auth.signInAnonymously().then(({ data }) => {
          if (data?.user) {
            setUserId(data.user.id);
            setIsAnonymous(true);
            setUserEmail(null);
          }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data (transactions, goals, budget) whenever userId changes
  useEffect(() => {
    if (!userId) return;

    async function loadUserData(activeUserId: string) {
      setLoading(true);
      try {
        // 1. Fetch budget / profile
        let budgetValue = 0;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('monthly_budget')
          .eq('id', activeUserId)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profileData) {
          budgetValue = Number(profileData.monthly_budget);
        } else {
          // Check legacy localStorage budget
          const localBudgetStr = localStorage.getItem('nalla-monthly-budget');
          if (localBudgetStr) {
            const parsed = parseFloat(localBudgetStr);
            if (!isNaN(parsed)) {
              budgetValue = parsed;
            }
          }
          // Create profile record in Supabase
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert([{ id: activeUserId, monthly_budget: budgetValue }]);
          
          if (!createProfileError) {
            localStorage.removeItem('nalla-monthly-budget');
          }
        }
        setMonthlyBudget(budgetValue);

        // 2. Fetch savings goals
        const { data: serverGoals, error: goalsError } = await supabase
          .from('savings_goals')
          .select('*')
          .order('created_at', { ascending: true });

        if (goalsError) throw goalsError;

        let mappedGoals: SavingsGoal[] = [];
        if (serverGoals) {
          mappedGoals = serverGoals.map((row: any) => ({
            id: row.id,
            name: row.name,
            targetAmount: Number(row.target_amount),
            savedAmount: Number(row.saved_amount),
            deadline: row.deadline || '',
          }));
        }

        // Sync legacy localStorage savings goals to Supabase if any
        const localGoalsStr = localStorage.getItem('nalla-savings-goals');
        if (localGoalsStr) {
          try {
            const localGoals = JSON.parse(localGoalsStr) as SavingsGoal[];
            if (localGoals.length > 0 && mappedGoals.length === 0) {
              const rowsToInsert = localGoals.map(goal => ({
                user_id: activeUserId,
                name: goal.name,
                target_amount: goal.targetAmount,
                saved_amount: goal.savedAmount,
                deadline: goal.deadline
              }));

              const { data: insertedGoals, error: insertGoalsError } = await supabase
                .from('savings_goals')
                .insert(rowsToInsert)
                .select();

              if (insertGoalsError) throw insertGoalsError;

              if (insertedGoals) {
                mappedGoals = insertedGoals.map((row: any) => ({
                  id: row.id,
                  name: row.name,
                  targetAmount: Number(row.target_amount),
                  savedAmount: Number(row.saved_amount),
                  deadline: row.deadline || '',
                }));
                localStorage.removeItem('nalla-savings-goals');
              }
            }
          } catch (e) {
            console.error("Failed to migrate savings goals to Supabase", e);
          }
        }
        setSavingsGoals(mappedGoals);

        // 3. Fetch transactions for this user
        const { data: serverTxs, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (fetchError) throw fetchError;

        let mappedTxs: Transaction[] = [];
        if (serverTxs) {
          mappedTxs = serverTxs.map((row: any) => ({
            id: row.id,
            type: row.type as TransactionType,
            amount: Number(row.amount),
            category: row.category,
            date: row.date,
            note: row.description || '',
          }));
        }

        // Sync legacy localStorage transactions to Supabase if any
        const localDataStr = localStorage.getItem('nalla-transactions');
        if (localDataStr) {
          try {
            const localTxs = JSON.parse(localDataStr) as Transaction[];
            if (localTxs.length > 0 && mappedTxs.length === 0) {
              const rowsToInsert = localTxs.map(tx => ({
                user_id: activeUserId,
                amount: tx.amount,
                category: tx.category,
                description: tx.note,
                date: tx.date,
                type: tx.type
              }));

              const { data: insertedData, error: insertError } = await supabase
                .from('transactions')
                .insert(rowsToInsert)
                .select();

              if (insertError) throw insertError;

              if (insertedData) {
                mappedTxs = insertedData.map((row: any) => ({
                  id: row.id,
                  type: row.type as TransactionType,
                  amount: Number(row.amount),
                  category: row.category,
                  date: row.date,
                  note: row.description || '',
                }));
                localStorage.removeItem('nalla-transactions');
              }
            }
          } catch (e) {
            console.error("Failed to migrate local transactions to Supabase", e);
          }
        }
        setTransactions(mappedTxs);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData(userId);
  }, [userId]);

  const handleSetBudget = async (budget: number) => {
    setMonthlyBudget(budget); // Optimistic UI update

    if (!userId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, monthly_budget: budget });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving budget to Supabase:', err);
    }
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (!userId) {
      // Local fallback
      const transaction: Transaction = {
        ...newTx,
        id: crypto.randomUUID(),
      };
      setTransactions(prev => [transaction, ...prev]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          amount: newTx.amount,
          category: newTx.category,
          description: newTx.note,
          date: newTx.date,
          type: newTx.type
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const added: Transaction = {
          id: data.id,
          type: data.type as TransactionType,
          amount: Number(data.amount),
          category: data.category,
          date: data.date,
          note: data.description || '',
        };
        setTransactions(prev => [added, ...prev]);
      }
    } catch (err) {
      console.error('Error adding transaction to Supabase:', err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    // Optimistic UI update
    setTransactions(prev => prev.filter(t => t.id !== id));

    if (!userId) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting transaction from Supabase:', err);
    }
  };

  const handleAddGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    if (!userId) {
      const newGoal: SavingsGoal = { ...goal, id: crypto.randomUUID() };
      setSavingsGoals(prev => [newGoal, ...prev]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{
          user_id: userId,
          name: goal.name,
          target_amount: goal.targetAmount,
          saved_amount: goal.savedAmount,
          deadline: goal.deadline
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const added: SavingsGoal = {
          id: data.id,
          name: data.name,
          targetAmount: Number(data.target_amount),
          savedAmount: Number(data.saved_amount),
          deadline: data.deadline || '',
        };
        setSavingsGoals(prev => [...prev, added]);
      }
    } catch (err) {
      console.error('Error adding savings goal to Supabase:', err);
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    // Optimistic UI update
    setSavingsGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updates } : g))
    );

    if (!userId) return;

    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
      if (updates.savedAmount !== undefined) dbUpdates.saved_amount = updates.savedAmount;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;

      const { error } = await supabase
        .from('savings_goals')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating savings goal in Supabase:', err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    // Optimistic UI update
    setSavingsGoals(prev => prev.filter(g => g.id !== id));

    if (!userId) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting savings goal from Supabase:', err);
    }
  };

  const handleImportTransactions = async (importedTransactions: Transaction[]) => {
    if (!userId) {
      setTransactions(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newTransactions = importedTransactions.filter(t => !existingIds.has(t.id));
        return [...newTransactions, ...prev];
      });
      return;
    }

    try {
      const existingIds = new Set(transactions.map(t => t.id));
      const newTransactions = importedTransactions.filter(t => !existingIds.has(t.id));
      if (newTransactions.length === 0) return;

      const rowsToInsert = newTransactions.map(tx => ({
        user_id: userId,
        amount: tx.amount,
        category: tx.category,
        description: tx.note,
        date: tx.date,
        type: tx.type
      }));

      const { data, error } = await supabase
        .from('transactions')
        .insert(rowsToInsert)
        .select();

      if (error) throw error;

      if (data) {
        const mappedNew: Transaction[] = data.map((row: any) => ({
          id: row.id,
          type: row.type as TransactionType,
          amount: Number(row.amount),
          category: row.category,
          date: row.date,
          note: row.description || '',
        }));
        setTransactions(prev => [...mappedNew, ...prev]);
      }
    } catch (err) {
      console.error('Error importing transactions to Supabase:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--surface-color)',
          borderTop: '4px solid var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)' }}>Connecting to Supabase...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Nalla Money</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Minimalist Finance Manager</p>
      </header>

      {/* Auth / Profile Bar */}
      <div className="glass-panel" style={{ 
        padding: '0.75rem 1rem', 
        marginBottom: '1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '0.85rem'
      }}>
        {isAnonymous ? (
          <>
            <span style={{ color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
              ⚠️ Guest Mode (Data temporary)
            </span>
            <button 
              className="btn-ghost" 
              onClick={() => setShowAuthModal(!showAuthModal)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
            >
              {showAuthModal ? 'Close Panel' : 'Sign Up / Log In'}
            </button>
          </>
        ) : (
          <>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
              👤 {userEmail}
            </span>
            <button 
              className="btn-ghost" 
              onClick={async () => {
                const confirmLogout = window.confirm("Are you sure you want to sign out?");
                if (confirmLogout) {
                  await supabase.auth.signOut();
                }
              }}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto', border: '1px solid var(--expense-bg)', color: 'var(--expense-color)' }}
            >
              Sign Out
            </button>
          </>
        )}
      </div>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Auth form Panel */}
        {showAuthModal && (
          <Auth 
            onSuccess={() => setShowAuthModal(false)} 
            onClose={() => setShowAuthModal(false)} 
          />
        )}

        {/* Guest Warning Banner */}
        {isAnonymous && !showAuthModal && (
          <div className="glass-panel fade-in" style={{ 
            padding: '1.25rem', 
            borderLeft: '4px solid var(--warning-color)', 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--warning-color)', fontSize: '0.95rem' }}>
              <span>⚠️</span> Warning: Data Loss Risk
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
              Your transactions and budget goals are stored temporarily under a guest profile. Clearing your browser data, cookies, or switching devices will cause you to **lose all your data permanently**.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => setShowAuthModal(true)}
              style={{ width: 'fit-content', padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: '0.25rem' }}
            >
              Create Cloud Account
            </button>
          </div>
        )}

        <Dashboard transactions={transactions} />
        <BudgetGoal
          transactions={transactions}
          monthlyBudget={monthlyBudget}
          onSetBudget={handleSetBudget}
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
