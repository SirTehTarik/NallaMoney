import { supabase } from '../supabaseClient';
import type { Transaction, TransactionType } from '../types';

export const transactionService = {
  async fetchTransactions(): Promise<Transaction[]> {
    const { data: serverTxs, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    if (!serverTxs) return [];

    return serverTxs.map((row: any) => ({
      id: row.id,
      type: row.type as TransactionType,
      amount: Number(row.amount),
      category: row.category,
      date: row.date,
      note: row.description || '',
    }));
  },

  async addTransaction(userId: string, newTx: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    const { data, error } = await supabase.from('transactions').insert([{
      user_id: userId,
      amount: newTx.amount,
      category: newTx.category,
      description: newTx.note,
      date: newTx.date,
      type: newTx.type
    }]).select().single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    if (data) {
      return {
        id: data.id,
        type: data.type as TransactionType,
        amount: Number(data.amount),
        category: data.category,
        date: data.date,
        note: data.description || '',
      };
    }
    return null;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};
