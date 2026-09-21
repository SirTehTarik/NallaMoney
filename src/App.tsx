import { useState, useEffect } from 'react';
import type { Transaction, SavingsGoal } from './types';
import { Dashboard } from './components/Dashboard';
import { TransactionView } from './components/TransactionView';
import { BudgetGoal } from './components/BudgetGoal';
import { SavingsGoalPlanner } from './components/SavingsGoalPlanner';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import type { Section } from './components/Navbar';
import { AddModal } from './components/AddModal';
import { authService } from './services/authService';
import { transactionService } from './services/transactionService';
import { goalService } from './services/goalService';
import { profileService } from './services/profileService';
import { PrimaryButton } from './components/ui';
import { BG, BRAND } from './constants';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // UI State
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await authService.getSession();
        if (session?.user) {
          const user = session.user;
          setUserId(user.id);
          setIsAnonymous(user.is_anonymous || !user.email);
          setUserEmail(user.email || null);
        } else {
          const { data, error } = await authService.signInAnonymously();
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

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        setUserId(user.id);
        setIsAnonymous(user.is_anonymous || !user.email);
        setUserEmail(user.email || null);
      } else {
        setUserId(null);
        setIsAnonymous(true);
        setUserEmail(null);
        authService.signInAnonymously().then(({ data }) => {
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

  useEffect(() => {
    if (!userId) return;

    async function loadUserData(activeUserId: string) {
      setLoading(true);
      try {
        const budgetValue = await profileService.fetchProfile(activeUserId);
        setMonthlyBudget(budgetValue);

        const mappedGoals = await goalService.fetchGoals();
        setSavingsGoals(mappedGoals);

        const mappedTxs = await transactionService.fetchTransactions();
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
    setMonthlyBudget(budget);
    if (!userId) return;
    try {
      await profileService.upsertProfile(userId, budget);
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (!userId) return;
    try {
      const added = await transactionService.addTransaction(userId, newTx);

      if (added) {
        setTransactions(prev => [added, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (!userId) return;
    try {
      await transactionService.deleteTransaction(id);
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleAddGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    if (!userId) return;
    try {
      const added = await goalService.addGoal(userId, goal);

      if (added) {
        setSavingsGoals(prev => [...prev, added]);
      }
    } catch (err) {
      console.error('Error adding savings goal:', err);
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
    if (!userId) return;
    try {
      await goalService.updateGoal(id, updates);
    } catch (err) {
      console.error('Error updating savings goal:', err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
    if (!userId) return;
    try {
      await goalService.deleteGoal(id);
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', background: BG }}>
        <div style={{ width: '40px', height: '40px', border: `4px solid #1e40af`, borderTop: `4px solid ${BRAND}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#93c5fd' }}>Connecting to Supabase...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar active={activeSection} setActive={setActiveSection} onAdd={() => setIsAddModalOpen(true)} userEmail={userEmail} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeSection === 'dashboard' && <Dashboard transactions={transactions} />}
        {activeSection === 'transactions' && <TransactionView transactions={transactions} onDelete={handleDeleteTransaction} />}
        {activeSection === 'budget' && (
          <div className="responsive-container">
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: '#eff6ff', letterSpacing: '-0.02em', marginBottom: '8px' }}>Budget & Goals</h1>
            <BudgetGoal transactions={transactions} monthlyBudget={monthlyBudget} onSetBudget={handleSetBudget} />
            <SavingsGoalPlanner transactions={transactions} goals={savingsGoals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} />
          </div>
        )}
        {activeSection === 'profile' && (
          <div className="responsive-container" style={{ alignItems: 'center' }}>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: '#eff6ff', letterSpacing: '-0.02em', marginBottom: '8px', alignSelf: 'flex-start' }}>Profile & Settings</h1>
            
            {isAnonymous ? (
              <div style={{ padding: '20px', background: '#f59e0b22', borderLeft: '4px solid #f59e0b', borderRadius: '12px', width: '100%', maxWidth: '500px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#f59e0b', fontSize: '15px' }}>
                  <span>⚠️</span> Warning: Data Loss Risk
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '8px 0 0', lineHeight: 1.5 }}>
                  Your transactions and budget goals are stored temporarily under a guest profile. Clearing your browser data, cookies, or switching devices will cause you to lose all your data permanently. Create an account below to sync.
                </p>
              </div>
            ) : (
              <div style={{ padding: '20px', background: '#10b98122', borderLeft: '4px solid #10b981', borderRadius: '12px', width: '100%', maxWidth: '500px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontWeight: 600, color: '#10b981', fontSize: '15px' }}>Logged in as {userEmail}</div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Your data is securely synced to the cloud.</p>
                <div style={{ width: '150px' }}>
                  <PrimaryButton onClick={async () => {
                    const confirmLogout = window.confirm("Are you sure you want to sign out?");
                    if (confirmLogout) await authService.signOut();
                  }}>Sign Out</PrimaryButton>
                </div>
              </div>
            )}

            {isAnonymous && <Auth onSuccess={() => setActiveSection('dashboard')} />}
          </div>
        )}
      </main>

      {isAddModalOpen && (
        <AddModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddTransaction} />
      )}
    </div>
  );
}

export default App;
