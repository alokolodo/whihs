import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccountCategories, useUpdateAccountEntry, AccountEntry } from "@/hooks/useAccounting";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditAccountEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: AccountEntry | null;
}

export const EditAccountEntryModal = ({ isOpen, onClose, entry }: EditAccountEntryModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    entry_date: "",
    description: "",
    reference_number: "",
    category_id: "",
    amount: "",
    debit_amount: "",
    credit_amount: "",
    status: "paid_transfer" as "paid_transfer" | "paid_cash" | "refund_cash" | "refund_transfer" | "pending" | "posted" | "reconciled" | "cancelled",
    notes: ""
  });
  const [date, setDate] = useState<Date>(new Date());

  const { data: categories = [], isLoading: categoriesLoading } = useAccountCategories();
  const updateEntryMutation = useUpdateAccountEntry();

  // Populate form when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        entry_date: entry.entry_date || "",
        description: entry.description || "",
        reference_number: entry.reference_number || "",
        category_id: entry.category_id || "",
        amount: entry.amount?.toString() || "",
        debit_amount: entry.debit_amount?.toString() || "",
        credit_amount: entry.credit_amount?.toString() || "",
        status: entry.status || "paid_transfer",
        notes: entry.notes || ""
      });
      setDate(new Date(entry.entry_date));
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entry) return;

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
      id: entry.id,
      ...formData,
      entry_date: format(date, "yyyy-MM-dd"),
      amount: parseFloat(formData.amount) || 0,
      debit_amount: parseFloat(formData.debit_amount) || 0,
      credit_amount: parseFloat(formData.credit_amount) || 0,
    };

    try {
      await updateEntryMutation.mutateAsync(entryData);
      handleClose();
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      entry_date: "",
      description: "",
      reference_number: "",
      category_id: "",
      amount: "",
      debit_amount: "",
      credit_amount: "",
      status: "paid_transfer",
      notes: ""
    });
    setDate(new Date());
    onClose();
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Account Entry</DialogTitle>
          <DialogDescription>
            Update the accounting entry details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No categories available
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.account_code} - {category.name} ({category.type})
                    </SelectItem>
                  ))
                )}
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
            <Label htmlFor="status">Payment Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid_transfer">Paid with Transfer</SelectItem>
                <SelectItem value="paid_cash">Paid with Cash</SelectItem>
                <SelectItem value="refund_cash">Refund to Customer with Cash</SelectItem>
                <SelectItem value="refund_transfer">Refund to Customer with Transfer</SelectItem>
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
              disabled={updateEntryMutation.isPending}
              className="flex-1 button-luxury"
            >
              {updateEntryMutation.isPending ? "Updating..." : "Update Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};