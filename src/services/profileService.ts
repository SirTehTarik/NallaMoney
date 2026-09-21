import { supabase } from '../supabaseClient';

export const profileService = {
  async fetchProfile(userId: string): Promise<number> {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('monthly_budget')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    if (profileData) {
      return Number(profileData.monthly_budget);
    }
    
    // If no profile data exists, we create it.
    // Try to get budget from localStorage just in case it's a first time migration
    let budgetValue = 0;
    const localBudgetStr = localStorage.getItem('nalla-monthly-budget');
    if (localBudgetStr) budgetValue = parseFloat(localBudgetStr) || 0;
    
    await supabase.from('profiles').insert([{ id: userId, monthly_budget: budgetValue }]);
    localStorage.removeItem('nalla-monthly-budget');
    
    return budgetValue;
  },

  async upsertProfile(userId: string, budget: number): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, monthly_budget: budget });
      
    if (error) {
      console.error('Error saving budget:', error);
      throw error;
    }
  }
};
