import { supabase } from '../supabaseClient';

export const edgeFunctionsService = {
  async analyzeReceipt(base64Data: string, mimeType: string) {
    const { data, error } = await supabase.functions.invoke('analyze-receipt', {
      body: { base64Data, mimeType }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data;
  }
};
