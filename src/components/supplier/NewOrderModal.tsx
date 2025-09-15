import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Minus, Package } from "lucide-react";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
  selectedSupplierId?: string;
}

interface OrderItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  unit: string;
  description?: string;
  total_price: number;
}

interface OrderFormData {
  supplier_id: string;
  expected_delivery_date: string;
  notes: string;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
}

const NewOrderModal = ({ isOpen, onClose, onOrderCreated, selectedSupplierId }: NewOrderModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { item_name: "", quantity: 1, unit_price: 0, unit: "units", description: "", total_price: 0 }
  ]);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<OrderFormData>({
    defaultValues: {
      supplier_id: selectedSupplierId || ""
    }
  });

  useEffect(() => {
    if (selectedSupplierId) {
      setValue("supplier_id", selectedSupplierId);
    }
  }, [selectedSupplierId, setValue]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, category')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${year}${month}${day}-${random}`;
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      item_name: "",
      quantity: 1,
      unit_price: 0,
      unit: "units",
      description: "",
      total_price: 0
    }]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      const newItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newItems);
    }
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setOrderItems(newItems);
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => total + item.total_price, 0);
  };

  const onSubmit = async (data: OrderFormData) => {
    // Validate that we have at least one valid item
    const validItems = orderItems.filter(item => 
      item.item_name.trim() && item.quantity > 0 && item.unit_price >= 0
    );

    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid item to the order.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('supplier_orders')
        .insert([{
          supplier_id: data.supplier_id,
          order_number: orderNumber,
          expected_delivery_date: data.expected_delivery_date || null,
          notes: data.notes,
          created_by: "Admin User", // This would come from auth context
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItemsToInsert = validItems.map(item => ({
        order_id: order.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        unit: item.unit,
        description: item.description
      }));

      const { error: itemsError } = await supabase
        .from('supplier_order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Created",
        description: `Order ${orderNumber} has been successfully created.`,
      });

      reset();
      setOrderItems([{ item_name: "", quantity: 1, unit_price: 0, unit: "units", description: "", total_price: 0 }]);
      onOrderCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setOrderItems([{ item_name: "", quantity: 1, unit_price: 0, unit: "units", description: "", total_price: 0 }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Purchase Order
          </DialogTitle>
          <DialogDescription>
            Create a new purchase order for supplier inventory and services.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Select 
                value={watch("supplier_id")}
                onValueChange={(value) => setValue("supplier_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier_id && (
                <p className="text-sm text-destructive">Please select a supplier</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
              <Input
                id="expected_delivery_date"
                type="date"
                {...register("expected_delivery_date")}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Order Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div className="space-y-2">
                      <Label>Item Name *</Label>
                      <Input
                        value={item.item_name}
                        onChange={(e) => updateOrderItem(index, 'item_name', e.target.value)}
                        placeholder="e.g., Coffee Beans"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select 
                        value={item.unit}
                        onValueChange={(value) => updateOrderItem(index, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="units">Units</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="lbs">Pounds</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="boxes">Boxes</SelectItem>
                          <SelectItem value="bottles">Bottles</SelectItem>
                          <SelectItem value="rolls">Rolls</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>Total</Label>
                        <Input
                          value={`$${item.total_price.toFixed(2)}`}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      {orderItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateOrderItem(index, 'description', e.target.value)}
                      placeholder="Additional details about this item..."
                    />
                  </div>
                </Card>
              ))}

              <div className="flex justify-end border-t pt-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="text-2xl font-bold">${calculateOrderTotal().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Special instructions, delivery preferences, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderModal;