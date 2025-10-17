import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useClearSalesData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Call the database function to clear all sales data
      const { data, error } = await supabase.rpc('clear_sales_data', {
        data_type: 'all_sales'
      });

      if (error) throw error;

      return data;
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
