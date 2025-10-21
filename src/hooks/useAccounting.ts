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
  status: 'pending' | 'posted' | 'reconciled' | 'cancelled' | 'paid_transfer' | 'paid_cash' | 'refund_cash' | 'refund_transfer';
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

export const useExpensesByCategory = () => {
  return useQuery({
    queryKey: ['expenses-by-category'],
    queryFn: async () => {
      // Get all expense entries with their categories
      const { data: expenseEntries, error } = await supabase
        .from('account_entries')
        .select(`
          amount,
          category_id,
          account_categories (
            id,
            name,
            account_code,
            parent_id
          )
        `)
        .in('status', ['paid_transfer', 'paid_cash', 'posted', 'pending'])
        .not('account_categories', 'is', null);

      if (error) throw error;

      // Get all expense categories with hierarchy
      const { data: categories, error: catError } = await supabase
        .from('account_categories')
        .select('*')
        .eq('type', 'expense')
        .eq('is_active', true)
        .order('account_code');

      if (catError) throw catError;

      // Build hierarchy
      const categoryMap = new Map();
      categories.forEach(cat => categoryMap.set(cat.id, { ...cat, children: [], total: 0 }));

      // Link children to parents
      categories.forEach(cat => {
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
          categoryMap.get(cat.parent_id).children.push(categoryMap.get(cat.id));
        }
      });

      // Calculate totals
      expenseEntries?.forEach((entry: any) => {
        const categoryId = entry.category_id;
        const amount = Math.abs(Number(entry.amount || 0));
        
        if (categoryMap.has(categoryId)) {
          const cat = categoryMap.get(categoryId);
          cat.total += amount;

          // Add to parent totals
          let parentId = cat.parent_id;
          while (parentId && categoryMap.has(parentId)) {
            categoryMap.get(parentId).total += amount;
            parentId = categoryMap.get(parentId).parent_id;
          }
        }
      });

      // Get root categories (no parent)
      const rootCategories = Array.from(categoryMap.values()).filter(cat => !cat.parent_id);

      return { categories: rootCategories, categoryMap };
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
      // Get revenue from room bookings
      const { data: roomBookings } = await supabase
        .from('room_bookings')
        .select('total_amount')
        .eq('payment_status', 'paid');

      // Get revenue from POS orders
      const { data: posOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'paid');

      // Get revenue from game sessions
      const { data: gameSessions } = await supabase
        .from('game_sessions')
        .select('total_amount')
        .eq('payment_status', 'paid');

      // Get expenses from account entries (using new payment status values)
      const { data: expenseEntries } = await supabase
        .from('account_entries')
        .select('amount, account_categories(type)')
        .in('status', ['paid_transfer', 'paid_cash', 'refund_cash', 'refund_transfer', 'posted', 'pending']);

      // Get assets from account entries (using new payment status values)
      const { data: assetEntries } = await supabase
        .from('account_entries')
        .select('amount, account_categories(type)')
        .in('status', ['paid_transfer', 'paid_cash', 'refund_cash', 'refund_transfer', 'posted', 'pending']);

      // Get inventory value (quantity * cost per unit)
      const { data: inventoryItems } = await supabase
        .from('inventory')
        .select('current_quantity, cost_per_unit')
        .gt('current_quantity', 0);

      // Calculate totals
      const roomRevenue = roomBookings?.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;
      const posRevenue = posOrders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
      const gameRevenue = gameSessions?.reduce((sum, g) => sum + Number(g.total_amount || 0), 0) || 0;

      const totalRevenue = roomRevenue + posRevenue + gameRevenue;

      // Calculate inventory value
      const inventoryValue = inventoryItems?.reduce((sum, item) => {
        return sum + (Number(item.current_quantity || 0) * Number(item.cost_per_unit || 0));
      }, 0) || 0;

      // Calculate expenses, assets, liabilities, equity from account entries
      let expenses = 0;
      let assetsFromEntries = 0;
      let liabilities = 0;
      let equity = 0;

      expenseEntries?.forEach((entry: any) => {
        const amount = Math.abs(Number(entry.amount || 0));
        const type = entry.account_categories?.type;
        
        if (type === 'expense') {
          expenses += amount;
        }
      });

      assetEntries?.forEach((entry: any) => {
        const amount = Math.abs(Number(entry.amount || 0));
        const type = entry.account_categories?.type;

        switch (type) {
          case 'asset':
            assetsFromEntries += amount;
            break;
          case 'liability':
            liabilities += amount;
            break;
          case 'equity':
            equity += amount;
            break;
        }
      });

      // Total assets = asset entries + inventory value
      const totalAssets = assetsFromEntries + inventoryValue;

      return {
        revenue: totalRevenue,
        expenses,
        assets: totalAssets,
        liabilities,
        equity,
        netIncome: totalRevenue - expenses,
        inventoryValue
      };
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