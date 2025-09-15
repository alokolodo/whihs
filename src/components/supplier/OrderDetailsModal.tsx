import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  Calendar, 
  User, 
  FileText, 
  DollarSign, 
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Edit
} from "lucide-react";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onOrderUpdated?: () => void;
}

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit: string;
  description: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  order_date: string;
  delivery_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  created_by: string;
  supplier: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
  };
}

const OrderDetailsModal = ({ isOpen, onClose, orderId, onOrderUpdated }: OrderDetailsModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrderDetails();
    }
  }, [orderId, isOpen]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      // Fetch order with supplier info
      const { data: orderData, error: orderError } = await supabase
        .from('supplier_orders')
        .select(`
          *,
          suppliers (
            name,
            contact_person,
            email,
            phone
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('supplier_order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at');

      if (itemsError) throw itemsError;

      setOrder({
        ...orderData,
        supplier: orderData.suppliers
      });
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      const updateData: any = { status: newStatus };
      
      // If marking as delivered, set delivery date
      if (newStatus === 'delivered') {
        updateData.delivery_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('supplier_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: `Order status updated to ${newStatus}.`,
      });

      onOrderUpdated?.();
      fetchOrderDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500 text-white',
      confirmed: 'bg-blue-500 text-white',
      delivered: 'bg-green-500 text-white',
      cancelled: 'bg-red-500 text-white'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      delivered: Truck,
      cancelled: XCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) {
    return null;
  }

  const StatusIcon = getStatusIcon(order.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details - {order.order_number}
              </DialogTitle>
              <DialogDescription>
                Complete order information and tracking details
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(order.status)}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {order.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Date:</span>
                  <span className="text-sm font-medium">{order.order_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created By:</span>
                  <span className="text-sm font-medium">{order.created_by}</span>
                </div>
                {order.expected_delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expected:</span>
                    <span className="text-sm font-medium">{order.expected_delivery_date}</span>
                  </div>
                )}
                {order.delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Delivered:</span>
                    <span className="text-sm font-medium">{order.delivery_date}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Supplier Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium">{order.supplier.name}</p>
                  <p className="text-sm text-muted-foreground">{order.supplier.contact_person}</p>
                </div>
                <div className="text-sm">
                  <p>{order.supplier.email}</p>
                  <p>{order.supplier.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Order Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${order.total_amount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items ({orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.item_name}</h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.quantity} {item.unit} × ${item.unit_price.toFixed(2)}
                      </p>
                      <p className="text-sm font-bold">${item.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {order.status === 'pending' && (
            <>
              <Button 
                variant="outline"
                onClick={() => updateOrderStatus('cancelled')}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
              <Button 
                onClick={() => updateOrderStatus('confirmed')}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Order
              </Button>
            </>
          )}
          
          {order.status === 'confirmed' && (
            <Button 
              onClick={() => updateOrderStatus('delivered')}
              disabled={isLoading}
            >
              <Truck className="h-4 w-4 mr-2" />
              Mark as Delivered
            </Button>
          )}
          
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;