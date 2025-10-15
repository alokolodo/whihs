import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccountCategories, useAddAccountEntry } from "@/hooks/useAccounting";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AddAccountEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountEntryModal = ({ isOpen, onClose, defaultType }: AddAccountEntryModalProps & { defaultType?: 'income' | 'expense' }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    entry_date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    reference_number: "",
    category_id: "",
    amount: "",
    debit_amount: "",
    credit_amount: "",
    status: "pending" as const,
    notes: ""
  });
  const [date, setDate] = useState<Date>(new Date());
  const [entryType, setEntryType] = useState<string>(defaultType || "all");

  const { data: categories = [] } = useAccountCategories();
  const addEntryMutation = useAddAccountEntry();

  // Filter categories by entry type
  const filteredCategories = entryType === "all" 
    ? categories 
    : categories.filter(cat => cat.type === entryType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.category_id) {
      toast({
        title: "Error",
        description: "Please select an account category",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive"
      });
      return;
    }
    
    const entryData = {
      ...formData,
      entry_date: format(date, "yyyy-MM-dd"),
      amount: parseFloat(formData.amount) || 0,
      debit_amount: parseFloat(formData.debit_amount) || 0,
      credit_amount: parseFloat(formData.credit_amount) || 0,
      category_id: formData.category_id, // Ensure it's the actual UUID
    };

    try {
      await addEntryMutation.mutateAsync(entryData);
      handleClose();
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      entry_date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      reference_number: "",
      category_id: "",
      amount: "",
      debit_amount: "",
      credit_amount: "",
      status: "pending",
      notes: ""
    });
    setDate(new Date());
    onClose();
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New {defaultType === 'expense' ? 'Expense' : defaultType === 'income' ? 'Income' : 'Journal'} Entry</DialogTitle>
          <DialogDescription>
            {defaultType === 'expense' ? 'Record a new expense transaction.' : defaultType === 'income' ? 'Record a new income transaction.' : 'Create a new accounting entry for the general ledger.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!defaultType && (
            <div className="space-y-2">
              <Label htmlFor="entry_type">Entry Type</Label>
              <Select
                value={entryType}
                onValueChange={setEntryType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_date">Entry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="REF001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Transaction description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Account Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.account_code} - {category.name} ({category.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="debit_amount">Debit</Label>
              <Input
                id="debit_amount"
                type="number"
                step="0.01"
                value={formData.debit_amount}
                onChange={(e) => setFormData({ ...formData, debit_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_amount">Credit</Label>
              <Input
                id="credit_amount"
                type="number"
                step="0.01"
                value={formData.credit_amount}
                onChange={(e) => setFormData({ ...formData, credit_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="reconciled">Reconciled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addEntryMutation.isPending}
              className="flex-1 button-luxury"
            >
              {addEntryMutation.isPending ? "Creating..." : "Create Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};