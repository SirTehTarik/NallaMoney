import React, { useState } from 'react';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍔',
  Rent: '🏠',
  Transport: '🚗',
  Groceries: '🛒',
  Health: '💊',
  Entertainment: '🎬',
  Subscriptions: '📱',
  Shopping: '👕',
  Education: '📚',
  Utilities: '⚡',
  Salary: '💰',
  Freelance: '💼',
  Investment: '📈',
  Gift: '🎁',
  Refund: '💵',
};

const DEFAULT_EMOJI = '📋';
const VISIBLE_COUNT = 10;

function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? DEFAULT_EMOJI;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TrashIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleTransactions = showAll
    ? transactions
    : transactions.slice(0, VISIBLE_COUNT);

  const hasMore = transactions.length > VISIBLE_COUNT;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
            Recent Transactions
          </h3>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '1.5rem',
              height: '1.5rem',
              padding: '0 0.45rem',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: 'var(--accent-primary)',
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {transactions.length}
          </span>
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll((prev) => !prev)}
            style={{
              background: 'transparent',
              color: 'var(--accent-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--border-radius-sm)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--surface-highlight)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '3rem', lineHeight: 1 }}>🧾</span>
          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          >
            No transactions yet
          </p>
          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              opacity: 0.7,
            }}
          >
            Add your first income or expense to get started.
          </p>
        </div>
      ) : (
        /* Transaction List */
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
        >
          {visibleTransactions.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              onDelete={onDeleteTransaction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* Transaction Card */

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction: t,
  onDelete,
}) => {
  const [hovered, setHovered] = useState(false);
  const isIncome = t.type === 'income';

  const borderColor = isIncome ? 'var(--income-color)' : 'var(--expense-color)';
  const amountColor = isIncome ? 'var(--income-color)' : 'var(--expense-color)';

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 0,
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Colored left border stripe */}
      <div
        style={{
          width: '4px',
          alignSelf: 'stretch',
          background: borderColor,
          flexShrink: 0,
          borderRadius: '4px 0 0 4px',
        }}
      />

      {/* Content */}
      <div
        className="flex-between"
        style={{
          flex: 1,
          padding: '0.85rem 1rem',
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 500,
              marginBottom: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>{getCategoryEmoji(t.category)}</span>
            <span>{t.category}</span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {formatDate(t.date)}
            {t.note && ` · ${t.note}`}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: amountColor,
            }}
          >
            {isIncome ? '+' : '-'}${t.amount.toFixed(2)}
          </span>

          {/* Delete button — visible only on card hover */}
          <button
            onClick={() => onDelete(t.id)}
            title="Delete transaction"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.3rem',
              borderRadius: 'var(--border-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'scale(1)' : 'scale(0.8)',
              transition: 'opacity 0.2s, transform 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--expense-color)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--text-secondary)')
            }
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
