import { supabase } from '../supabaseClient';
import type { SavingsGoal } from '../types';

export const goalService = {
  async fetchGoals(): Promise<SavingsGoal[]> {
    const { data: serverGoals, error } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }

    if (!serverGoals) return [];

    return serverGoals.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      name: String(row.name),
      targetAmount: Number(row.target_amount),
      savedAmount: Number(row.saved_amount),
      deadline: row.deadline ? String(row.deadline) : '',
    }));
  },

  async addGoal(userId: string, goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal | null> {
    const { data, error } = await supabase.from('savings_goals').insert([{
      user_id: userId,
      name: goal.name,
      target_amount: goal.targetAmount,
      saved_amount: goal.savedAmount,
      deadline: goal.deadline
    }]).select().single();

    if (error) {
      console.error('Error adding savings goal:', error);
      throw error;
    }

    if (data) {
      return {
        id: data.id,
        name: data.name,
        targetAmount: Number(data.target_amount),
        savedAmount: Number(data.saved_amount),
        deadline: data.deadline || '',
      };
    }
    return null;
  },

  async updateGoal(id: string, updates: Partial<SavingsGoal>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
    if (updates.savedAmount !== undefined) dbUpdates.saved_amount = updates.savedAmount;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;

    const { error } = await supabase.from('savings_goals').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  },

  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }
};
