import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/useHR";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, DollarSign } from "lucide-react";

interface LoanRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoanRequestModal = ({ isOpen, onClose }: LoanRequestModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: employees = [] } = useEmployees();
  
  const [formData, setFormData] = useState({
    employee_id: "",
    loan_amount: 0,
    purpose: "",
    monthly_deduction: 0,
    notes: ""
  });

  const addLoanMutation = useMutation({
    mutationFn: async (loanData: any) => {
      const { data, error } = await supabase
        .from('employee_loans')
        .insert([{
          ...loanData,
          remaining_amount: loanData.loan_amount,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans'] });
      toast({
        title: "Loan Request Submitted",
        description: "The loan request has been submitted for approval.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit loan request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.loan_amount || !formData.purpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await addLoanMutation.mutateAsync(formData);
  };

  const handleClose = () => {
    setFormData({
      employee_id: "",
      loan_amount: 0,
      purpose: "",
      monthly_deduction: 0,
      notes: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            New Loan Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employee">Employee</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} - {employee.employee_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="loan_amount">Loan Amount ($)</Label>
            <Input
              id="loan_amount"
              type="number"
              min="100"
              max="50000"
              value={formData.loan_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, loan_amount: Number(e.target.value) }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g., Medical expenses, Home improvement"
              required
            />
          </div>

          <div>
            <Label htmlFor="monthly_deduction">Preferred Monthly Deduction ($)</Label>
            <Input
              id="monthly_deduction"
              type="number"
              min="50"
              value={formData.monthly_deduction}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_deduction: Number(e.target.value) }))}
              required
            />
            {formData.loan_amount > 0 && formData.monthly_deduction > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Estimated duration: {Math.ceil(formData.loan_amount / formData.monthly_deduction)} months
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addLoanMutation.isPending}
              className="button-luxury"
            >
              {addLoanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};