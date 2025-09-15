import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee as EmployeeType } from "@/hooks/useHR";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Calculator, FileText, Download, Loader2 } from "lucide-react";

interface EmployeePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeType | null;
}

export const EmployeePayrollModal = ({ isOpen, onClose, employee }: EmployeePayrollModalProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [payrollData, setPayrollData] = useState({
    overtimeHours: 0,
    overtimeRate: 25,
    bonus: 0,
    loanDeduction: 0,
    taxDeduction: 0,
    otherDeductions: 0
  });

  if (!employee) return null;

  const monthlySalary = employee.salary / 12;
  const overtimePay = payrollData.overtimeHours * payrollData.overtimeRate;
  const grossPay = monthlySalary + overtimePay + payrollData.bonus;
  const totalDeductions = payrollData.loanDeduction + payrollData.taxDeduction + payrollData.otherDeductions;
  const netPay = grossPay - totalDeductions;

  const handleProcessPayroll = async () => {
    setIsProcessing(true);
    try {
      // Simulate payroll processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Payroll Processed",
        description: `Payroll for ${employee.first_name} ${employee.last_name} has been processed successfully.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payroll",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePayslip = () => {
    toast({
      title: "Payslip Generated",
      description: `Payslip for ${employee.first_name} ${employee.last_name} has been generated and sent via email.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <DollarSign className="h-6 w-6" />
            Payroll Management - {employee.first_name} {employee.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employee Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID</span>
                  <span className="font-medium">{employee.employee_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <Badge variant="outline">{employee.departments?.name}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span className="font-medium">{employee.employee_positions?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Salary</span>
                  <span className="font-bold">${employee.salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Base</span>
                  <span className="font-bold">${monthlySalary.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Earnings & Deductions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="overtimeHours">Overtime Hours</Label>
                    <Input
                      id="overtimeHours"
                      type="number"
                      value={payrollData.overtimeHours}
                      onChange={(e) => setPayrollData(prev => ({ ...prev, overtimeHours: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="overtimeRate">Overtime Rate ($)</Label>
                    <Input
                      id="overtimeRate"
                      type="number"
                      value={payrollData.overtimeRate}
                      onChange={(e) => setPayrollData(prev => ({ ...prev, overtimeRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bonus">Bonus ($)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={payrollData.bonus}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, bonus: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="loanDeduction">Loan Deduction ($)</Label>
                  <Input
                    id="loanDeduction"
                    type="number"
                    value={payrollData.loanDeduction}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, loanDeduction: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="taxDeduction">Tax Deduction ($)</Label>
                  <Input
                    id="taxDeduction"
                    type="number"
                    value={payrollData.taxDeduction}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, taxDeduction: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="otherDeductions">Other Deductions ($)</Label>
                  <Input
                    id="otherDeductions"
                    type="number"
                    value={payrollData.otherDeductions}
                    onChange={(e) => setPayrollData(prev => ({ ...prev, otherDeductions: Number(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Payroll Calculation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-success">Earnings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Salary</span>
                        <span>${monthlySalary.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Overtime Pay</span>
                        <span>${overtimePay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bonus</span>
                        <span>${payrollData.bonus.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Gross Pay</span>
                        <span className="text-success">${grossPay.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-destructive">Deductions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loan Deduction</span>
                        <span>${payrollData.loanDeduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Deduction</span>
                        <span>${payrollData.taxDeduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Other Deductions</span>
                        <span>${payrollData.otherDeductions.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Deductions</span>
                        <span className="text-destructive">${totalDeductions.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Net Pay</h4>
                    <div className="p-4 bg-gradient-primary rounded-lg text-center">
                      <p className="text-primary-foreground text-2xl font-bold">
                        ${netPay.toFixed(2)}
                      </p>
                      <p className="text-primary-foreground/80 text-sm">Final Amount</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGeneratePayslip}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Payslip
            </Button>
            <Button 
              onClick={handleProcessPayroll}
              disabled={isProcessing}
              className="button-luxury flex items-center gap-2"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              <DollarSign className="h-4 w-4" />
              Process Payroll
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};