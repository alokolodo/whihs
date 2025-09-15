import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, DollarSign, Loader2 } from "lucide-react";

interface LoanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
}

export const LoanApprovalModal = ({ isOpen, onClose, loan }: LoanApprovalModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState("");
  const [adjustedAmount, setAdjustedAmount] = useState(loan?.loan_amount || 0);
  const [adjustedMonthlyDeduction, setAdjustedMonthlyDeduction] = useState(loan?.monthly_deduction || 0);

  const processLoanMutation = useMutation({
    mutationFn: async ({ action, loanId, data }: { action: 'approve' | 'reject'; loanId: string; data: any }) => {
      const updateData = action === 'approve' 
        ? {
            status: 'active',
            loan_amount: data.adjustedAmount,
            monthly_deduction: data.adjustedMonthlyDeduction,
            remaining_amount: data.adjustedAmount,
            approved_at: new Date().toISOString(),
            notes: data.notes
          }
        : {
            status: 'cancelled',
            notes: data.notes
          };

      const { data: result, error } = await supabase
        .from('employee_loans')
        .update(updateData)
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans'] });
      toast({
        title: variables.action === 'approve' ? "Loan Approved" : "Loan Rejected",
        description: `The loan request has been ${variables.action === 'approve' ? 'approved' : 'rejected'}.`,
        variant: variables.action === 'approve' ? "default" : "destructive"
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process loan request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || !loan) return;

    await processLoanMutation.mutateAsync({
      action,
      loanId: loan.id,
      data: {
        adjustedAmount,
        adjustedMonthlyDeduction,
        notes
      }
    });
  };

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Loan Approval - {loan.employees?.first_name} {loan.employees?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Loan Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID</span>
                  <span className="font-medium">{loan.employees?.employee_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requested Amount</span>
                  <span className="font-bold">${loan.loan_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Deduction</span>
                  <span className="font-medium">${loan.monthly_deduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{Math.ceil(loan.loan_amount / loan.monthly_deduction)} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="font-medium">{loan.purpose}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Employee Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{loan.employees?.first_name} {loan.employees?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-success text-success-foreground">
                    {loan.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {action === 'approve' && (
              <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="adjustedAmount">Final Loan Amount ($)</Label>
                  <Input
                    id="adjustedAmount"
                    type="number"
                    value={adjustedAmount}
                    onChange={(e) => setAdjustedAmount(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adjustedMonthlyDeduction">Monthly Deduction ($)</Label>
                  <Input
                    id="adjustedMonthlyDeduction"
                    type="number"
                    value={adjustedMonthlyDeduction}
                    onChange={(e) => setAdjustedMonthlyDeduction(Number(e.target.value))}
                    required
                  />
                </div>
                {adjustedAmount > 0 && adjustedMonthlyDeduction > 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Final duration: {Math.ceil(adjustedAmount / adjustedMonthlyDeduction)} months
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="notes">
                {action === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={action === 'approve' 
                  ? "Any conditions or notes for the approval..."
                  : "Please provide a reason for rejection..."
                }
                required={action === 'reject'}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-success hover:bg-success hover:text-success-foreground"
                onClick={() => setAction('approve')}
                disabled={processLoanMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setAction('reject')}
                disabled={processLoanMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              {action && (
                <Button 
                  type="submit" 
                  disabled={processLoanMutation.isPending}
                  className="button-luxury"
                >
                  {processLoanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};