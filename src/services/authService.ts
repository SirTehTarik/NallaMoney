import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

export const authService = {
  async getSession() {
    return await supabase.auth.getSession();
  },

  async signInAnonymously() {
    return await supabase.auth.signInAnonymously();
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async getUser() {
    return await supabase.auth.getUser();
  },

  async updateUser(credentials: { email?: string; password?: string }) {
    return await supabase.auth.updateUser(credentials);
  },

  async signUp(credentials: { email: string; password: string }) {
    return await supabase.auth.signUp(credentials);
  },

  async signInWithPassword(credentials: { email: string; password: string }) {
    return await supabase.auth.signInWithPassword(credentials);
  },

  async signOut() {
    return await supabase.auth.signOut();
  }
};
