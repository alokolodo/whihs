import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onItemUpdated?: () => void;
}

interface InventoryFormData {
  item_name: string;
  category: string;
  current_quantity: number;
  min_threshold: number;
  max_threshold: number;
  unit: string;
  cost_per_unit: number;
  supplier: string;
}

const EditInventoryItemModal = ({ isOpen, onClose, item, onItemUpdated }: EditInventoryItemModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<InventoryFormData>();

  const categories = [
    { value: 'food', label: 'Food Items' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'amenities', label: 'Guest Amenities' }
  ];

  const units = [
    'pieces', 'kg', 'liters', 'bottles', 'boxes', 'rolls', 'packets', 'units'
  ];

  useEffect(() => {
    if (item && isOpen) {
      setValue("item_name", item.item_name || item.name);
      setValue("category", item.category);
      setValue("current_quantity", item.current_quantity || item.currentStock);
      setValue("min_threshold", item.min_threshold || item.minimumStock);
      setValue("max_threshold", item.max_threshold || 100);
      setValue("unit", item.unit);
      setValue("cost_per_unit", item.cost_per_unit || item.unitPrice);
      setValue("supplier", item.supplier || "");
    }
  }, [item, isOpen, setValue]);

  const onSubmit = async (data: InventoryFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .update(data)
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Inventory item updated",
        description: `${data.item_name} has been updated successfully.`,
      });
      
      onItemUpdated?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Update the details of this inventory item.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name</Label>
              <Input 
                id="item_name"
                {...register("item_name", { required: "Item name is required" })}
                placeholder="Enter item name"
              />
              {errors.item_name && <span className="text-sm text-destructive">{errors.item_name.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue={item.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_quantity">Current Stock</Label>
              <Input 
                id="current_quantity"
                type="number"
                min="0"
                {...register("current_quantity", { required: "Current quantity is required", min: 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_threshold">Minimum Stock</Label>
              <Input 
                id="min_threshold"
                type="number"
                min="0"
                {...register("min_threshold", { required: "Minimum threshold is required", min: 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_threshold">Maximum Stock</Label>
              <Input 
                id="max_threshold"
                type="number"
                min="0"
                {...register("max_threshold", { required: "Maximum threshold is required", min: 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measurement</Label>
              <Select onValueChange={(value) => setValue("unit", value)} defaultValue={item.unit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
              <Input 
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                {...register("cost_per_unit", { required: "Cost per unit is required", min: 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input 
              id="supplier"
              {...register("supplier")}
              placeholder="Enter supplier name"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryItemModal;