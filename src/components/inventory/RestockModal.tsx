import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onItemRestocked?: () => void;
}

interface RestockFormData {
  quantity: number;
  cost_per_unit?: number;
  supplier?: string;
  notes?: string;
}

const RestockModal = ({ isOpen, onClose, item, onItemRestocked }: RestockModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<RestockFormData>();

  const watchedQuantity = watch("quantity");
  const watchedCost = watch("cost_per_unit");

  const onSubmit = async (data: RestockFormData) => {
    if (!item) return;

    setIsLoading(true);
    try {
      const currentStock = item.current_quantity || item.currentStock;
      const newQuantity = currentStock + data.quantity;
      
      const updateData: any = {
        current_quantity: newQuantity,
        last_restocked: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update cost per unit if provided
      if (data.cost_per_unit && data.cost_per_unit > 0) {
        updateData.cost_per_unit = data.cost_per_unit;
      }

      // Update supplier if provided
      if (data.supplier?.trim()) {
        updateData.supplier = data.supplier;
      }

      const { error } = await supabase
        .from('inventory')
        .update(updateData)
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Items Restocked Successfully",
        description: `Added ${data.quantity} ${item.unit} to ${item.item_name || item.name}. New stock: ${newQuantity} ${item.unit}`,
      });
      
      reset();
      onItemRestocked?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restock items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  const currentStock = item.current_quantity || item.currentStock;
  const suggestedQuantity = Math.max(0, (item.max_threshold || item.minimumStock * 2) - currentStock);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Restock Inventory Item</DialogTitle>
          <DialogDescription>
            Add stock for {item.item_name || item.name} to your inventory.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Stock:</span>
              <p className="font-medium">{currentStock} {item.unit}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Minimum Threshold:</span>
              <p className="font-medium">{item.min_threshold || item.minimumStock} {item.unit}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Suggested Restock:</span>
              <p className="font-medium text-primary">{suggestedQuantity} {item.unit}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Current Supplier:</span>
              <p className="font-medium">{item.supplier || "Not specified"}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Add</Label>
            <Input 
              id="quantity"
              type="number"
              min="1"
              {...register("quantity", { 
                required: "Quantity is required", 
                min: { value: 1, message: "Minimum quantity is 1" }
              })}
              placeholder={`Suggested: ${suggestedQuantity}`}
            />
            {errors.quantity && <span className="text-sm text-destructive">{errors.quantity.message}</span>}
            {watchedQuantity && (
              <p className="text-sm text-muted-foreground">
                New stock level: {currentStock + Number(watchedQuantity)} {item.unit}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
              <Input 
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                {...register("cost_per_unit")}
                placeholder={`Current: $${item.cost_per_unit || item.unitPrice || '0.00'}`}
              />
              <p className="text-xs text-muted-foreground">Leave empty to keep current price</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input 
                id="supplier"
                {...register("supplier")}
                placeholder={item.supplier || "Enter supplier name"}
              />
            </div>
          </div>

          {watchedQuantity && watchedCost && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">Total Cost: </span>
                <span className="font-bold text-primary">${(Number(watchedQuantity) * Number(watchedCost)).toFixed(2)}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes"
              {...register("notes")}
              placeholder="Purchase order number, delivery date, etc."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Restocking..." : "Restock Items"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestockModal;