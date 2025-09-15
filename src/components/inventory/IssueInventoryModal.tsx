import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IssueInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onItemIssued?: () => void;
}

interface IssueFormData {
  quantity: number;
  department: string;
  requestedBy: string;
  purpose: string;
}

const IssueInventoryModal = ({ isOpen, onClose, item, onItemIssued }: IssueInventoryModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<IssueFormData>();

  const watchedQuantity = watch("quantity");

  const departments = [
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'frontdesk', label: 'Front Desk' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'bar', label: 'Bar' },
    { value: 'events', label: 'Events' }
  ];

  const onSubmit = async (data: IssueFormData) => {
    if (!item) return;

    const currentStock = item.current_quantity || item.currentStock;
    
    if (data.quantity > currentStock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${currentStock} ${item.unit} available in stock.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update inventory quantity
      const newQuantity = currentStock - data.quantity;
      await supabase
        .from('inventory')
        .update({ 
          current_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      toast({
        title: "Items Issued Successfully",
        description: `${data.quantity} ${item.unit} of ${item.item_name || item.name} issued to ${data.department}.`,
      });
      
      reset();
      onItemIssued?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  const currentStock = item.current_quantity || item.currentStock;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Issue Inventory Items</DialogTitle>
          <DialogDescription>
            Issue {item.item_name || item.name} from inventory to a department.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Item:</span>
              <p className="font-medium">{item.item_name || item.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Available Stock:</span>
              <p className="font-medium">{currentStock} {item.unit}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Issue</Label>
              <Input 
                id="quantity"
                type="number"
                min="1"
                max={currentStock}
                {...register("quantity", { 
                  required: "Quantity is required", 
                  min: { value: 1, message: "Minimum quantity is 1" },
                  max: { value: currentStock, message: `Maximum available is ${currentStock}` }
                })}
                placeholder="Enter quantity"
              />
              {errors.quantity && <span className="text-sm text-destructive">{errors.quantity.message}</span>}
              {watchedQuantity && (
                <p className="text-sm text-muted-foreground">
                  Remaining after issue: {currentStock - watchedQuantity} {item.unit}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select onValueChange={(value) => setValue("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestedBy">Requested By</Label>
            <Input 
              id="requestedBy"
              {...register("requestedBy", { required: "Requester name is required" })}
              placeholder="Enter name of person requesting"
            />
            {errors.requestedBy && <span className="text-sm text-destructive">{errors.requestedBy.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea 
              id="purpose"
              {...register("purpose", { required: "Purpose is required" })}
              placeholder="Enter reason for issuing items"
              rows={3}
            />
            {errors.purpose && <span className="text-sm text-destructive">{errors.purpose.message}</span>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !watchedQuantity || watchedQuantity > currentStock}>
              {isLoading ? "Issuing..." : "Issue Items"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueInventoryModal;