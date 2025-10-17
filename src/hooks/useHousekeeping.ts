import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface HousekeepingTask {
  id: string;
  room_id: string | null;
  assigned_to: string | null;
  task_type: string;
  priority: string;
  status: string;
  description: string | null;
  notes: string | null;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  created_at: string;
  updated_at: string;
}

export const useHousekeeping = () => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch housekeeping tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('housekeeping_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'housekeeping_tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createTask = async (taskData: {
    room_id: string | null;
    assigned_to: string | null;
    task_type: string;
    priority: string;
    description: string;
    estimated_duration?: number;
    due_date?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert([{
          ...taskData,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Task Created",
        description: "New housekeeping task has been added"
      });

      return data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<HousekeepingTask>) => {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Updated",
        description: "Task has been updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const startTask = async (taskId: string) => {
    await updateTask(taskId, {
      status: 'in_progress',
      started_at: new Date().toISOString()
    });
  };

  const completeTask = async (taskId: string, roomId: string | null, notes?: string) => {
    try {
      const startTime = tasks.find(t => t.id === taskId)?.started_at;
      const actualDuration = startTime 
        ? Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 60000)
        : null;

      await updateTask(taskId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        actual_duration: actualDuration,
        notes
      });

      // Update room status if it's a cleaning task
      if (roomId) {
        const task = tasks.find(t => t.id === taskId);
        if (task?.task_type === 'cleaning') {
          await supabase
            .from('rooms')
            .update({ status: 'available' })
            .eq('id', roomId);
          
          toast({
            title: "Room Status Updated",
            description: "Room is now available for booking"
          });
        }
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Deleted",
        description: "Task has been removed"
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const issueSupplies = async (supplies: { item_id: string; quantity: number; room_number?: string }[]) => {
    try {
      const issuanceData = supplies.map(supply => ({
        inventory_item_id: supply.item_id,
        quantity_issued: supply.quantity,
        issued_to: 'Housekeeping',
        department: 'housekeeping',
        room_number: supply.room_number,
        purpose: 'Room servicing',
        status: 'issued'
      }));

      const { error } = await supabase
        .from('inventory_issuances')
        .insert(issuanceData);

      if (error) throw error;

      toast({
        title: "Supplies Issued",
        description: `${supplies.length} items issued successfully`
      });
    } catch (error: any) {
      console.error('Error issuing supplies:', error);
      toast({
        title: "Error",
        description: "Failed to issue supplies",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    startTask,
    completeTask,
    deleteTask,
    issueSupplies,
    refetch: fetchTasks
  };
};
