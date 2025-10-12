import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useClearSalesData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // First, get all paid order IDs
      const { data: paidOrders, error: fetchError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'paid');

      if (fetchError) throw fetchError;

      const paidOrderIds = paidOrders?.map(o => o.id) || [];

      // Delete only order items belonging to paid orders
      if (paidOrderIds.length > 0) {
        const { error: orderItemsError } = await supabase
          .from('order_items')
          .delete()
          .in('order_id', paidOrderIds);

        if (orderItemsError) throw orderItemsError;
      }

      // Delete paid orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('status', 'paid');

      if (ordersError) throw ordersError;

      // Delete paid game sessions (only if table exists)
      const { error: gymError } = await supabase
        .from('game_sessions')
        .delete()
        .eq('payment_status', 'paid');

      // Ignore 404 errors (table might not exist)
      if (gymError && gymError.code !== 'PGRST116') throw gymError;

      // Update paid room bookings to cancelled (preserve history)
      const { error: bookingsError } = await supabase
        .from('room_bookings')
        .update({ booking_status: 'cancelled' })
        .eq('payment_status', 'paid');

      if (bookingsError) throw bookingsError;

      // Delete all account entries (accounting transactions only)
      const { error: accountEntriesError } = await supabase
        .from('account_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (accountEntriesError) throw accountEntriesError;

      // NOTE: This does NOT delete:
      // - Rooms (physical hotel rooms)
      // - Menu items (food/drink offerings)
      // - Inventory items
      // - Account categories or budgets
      // Only transactional sales data is cleared

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-stats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['room-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['game-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['account-entries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      
      toast({
        title: "Sales Data Cleared",
        description: "All sales data has been successfully cleared from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear sales data. Please try again.",
        variant: "destructive",
      });
      console.error("Error clearing sales data:", error);
    },
  });
};
