import React, { useState, useRef } from 'react';
import type { TransactionType } from '../types';

interface TransactionFormProps {
  onAddTransaction: (transaction: {
    type: TransactionType;
    amount: number;
    category: string;
    note: string;
    date: string;
  }) => void;
}

const EXPENSE_CATEGORIES = [
  { emoji: '🍔', label: 'Food' },
  { emoji: '🏠', label: 'Rent' },
  { emoji: '🚗', label: 'Transport' },
  { emoji: '🛒', label: 'Groceries' },
  { emoji: '💊', label: 'Health' },
  { emoji: '🎬', label: 'Entertainment' },
  { emoji: '📱', label: 'Subscriptions' },
  { emoji: '👕', label: 'Shopping' },
  { emoji: '📚', label: 'Education' },
  { emoji: '⚡', label: 'Utilities' },
  { emoji: '✏️', label: 'Other' },
];

const INCOME_CATEGORIES = [
  { emoji: '💰', label: 'Salary' },
  { emoji: '💼', label: 'Freelance' },
  { emoji: '📈', label: 'Investment' },
  { emoji: '🎁', label: 'Gift' },
  { emoji: '💵', label: 'Refund' },
  { emoji: '✏️', label: 'Other' },
];

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(getTodayString);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isOtherSelected = category === 'Other';

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory('');
    setCustomCategory('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedCategory = isOtherSelected ? customCategory.trim() : category;
    if (!amount || !resolvedCategory) return;

    onAddTransaction({
      type,
      amount: parseFloat(amount),
      category: resolvedCategory,
      note,
      date: new Date(date).toISOString(),
    });

    /* reset form */
    setAmount('');
    setCategory('');
    setCustomCategory('');
    setDate(getTodayString());
    setNote('');

    /* success flash */
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 700);
  };

  return (
    <form
      ref={formRef}
      className={`glass-panel ${showSuccess ? 'success-flash' : ''}`}
      style={{ padding: '1.5rem' }}
      onSubmit={handleSubmit}
    >
      <h3 className="section-title" style={{ marginBottom: '1.25rem' }}>Add Transaction</h3>

      {/* Type Toggle */}
      <div style={{ marginBottom: '1.1rem' }}>
        <label>Type</label>
        <div className="toggle-group">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`toggle-btn ${type === 'income' ? 'active-income' : ''}`}
          >
            ↑ Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`toggle-btn ${type === 'expense' ? 'active-expense' : ''}`}
          >
            ↓ Expense
          </button>
        </div>
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '1.1rem' }}>
        <label>Amount</label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          required
        />
      </div>

      {/* Category */}
      <div style={{ marginBottom: '1.1rem' }}>
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            if (e.target.value !== 'Other') setCustomCategory('');
          }}
          required
        >
          <option value="" disabled>
            Select a category…
          </option>
          {categories.map((cat) => (
            <option key={cat.label} value={cat.label}>
              {cat.emoji}  {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Category (when Other selected) */}
      {isOtherSelected && (
        <div style={{ marginBottom: '1.1rem' }}>
          <label>Custom Category</label>
          <input
            type="text"
            placeholder="Enter category name"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            required
            autoFocus
          />
        </div>
      )}

      {/* Date */}
      <div style={{ marginBottom: '1.1rem' }}>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={getTodayString()}
          required
          style={{ colorScheme: 'dark', cursor: 'pointer' }}
        />
      </div>

      {/* Note */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label>Note (optional)</label>
        <input
          type="text"
          placeholder="Add a short note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary" style={{ fontWeight: 600 }}>
        {type === 'income' ? '+ Add Income' : '+ Add Expense'}
      </button>
    </form>
  );
};
