import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AccountEntry {
  id: string;
  entry_date: string;
  description: string;
  reference_number: string;
  category_id: string;
  sub_category: string;
  amount: number;
  debit_amount: number;
  credit_amount: number;
  status: 'pending' | 'posted' | 'reconciled' | 'cancelled';
  source_type?: string;
  source_id?: string;
  notes?: string;
  posted_by?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
  account_categories?: {
    name: string;
    type: string;
    account_code: string;
  };
}

export interface AccountCategory {
  id: string;
  name: string;
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  account_code: string;
  is_active: boolean;
}

export interface Budget {
  id: string;
  name: string;
  fiscal_year: number;
  category_id: string;
  budgeted_amount: number;
  actual_amount: number;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  period_number: number;
  variance: number;
  variance_percentage: number;
  account_categories?: {
    name: string;
    type: string;
    account_code: string;
  };
}

export const useAccountEntries = () => {
  return useQuery({
    queryKey: ['account-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_entries')
        .select(`
          *,
          account_categories (
            name,
            type,
            account_code
          )
        `)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as AccountEntry[];
    }
  });
};

export const useAccountCategories = () => {
  return useQuery({
    queryKey: ['account-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_categories')
        .select('*')
        .eq('is_active', true)
        .order('account_code');

      if (error) throw error;
      return data as AccountCategory[];
    }
  });
};

export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          account_categories (
            name,
            type,
            account_code
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data as Budget[];
    }
  });
};

export const useFinancialSummary = () => {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from('account_entries')
        .select(`
          amount,
          account_categories (type)
        `)
        .eq('status', 'posted');

      if (error) throw error;

      const summary = {
        revenue: 0,
        expenses: 0,
        assets: 0,
        liabilities: 0,
        equity: 0,
        netIncome: 0
      };

      entries.forEach((entry: any) => {
        const amount = parseFloat(entry.amount);
        const type = entry.account_categories?.type;

        switch (type) {
          case 'revenue':
            summary.revenue += Math.abs(amount);
            break;
          case 'expense':
            summary.expenses += Math.abs(amount);
            break;
          case 'asset':
            summary.assets += Math.abs(amount);
            break;
          case 'liability':
            summary.liabilities += Math.abs(amount);
            break;
          case 'equity':
            summary.equity += Math.abs(amount);
            break;
        }
      });

      summary.netIncome = summary.revenue - summary.expenses;
      return summary;
    }
  });
};

export const useAddAccountEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (entry: any) => {
      const { data, error } = await supabase
        .from('account_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-entries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast({
        title: "Success",
        description: "Account entry created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create account entry",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAccountEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AccountEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('account_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-entries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast({
        title: "Success",
        description: "Account entry updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update account entry",
        variant: "destructive",
      });
    },
  });
};