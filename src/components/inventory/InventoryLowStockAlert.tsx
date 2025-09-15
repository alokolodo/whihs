import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, ShoppingCart } from "lucide-react";
import { useInventoryIntegration } from "@/hooks/useInventoryIntegration";

interface InventoryLowStockAlertProps {
  onRestockRequest?: (itemId: string) => void;
}

const InventoryLowStockAlert = ({ onRestockRequest }: InventoryLowStockAlertProps) => {
  const { inventory } = useInventoryIntegration();

  const lowStockItems = inventory.filter(item => 
    item.current_quantity <= item.min_threshold
  );

  const outOfStockItems = inventory.filter(item => 
    item.current_quantity === 0
  );

  if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {outOfStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Out of Stock Items</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {outOfStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">{item.item_name}</span>
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onRestockRequest?.(item.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Reorder
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {lowStockItems.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Items</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">{item.item_name}</span>
                    <Badge variant="secondary">
                      {item.current_quantity} {item.unit} left
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onRestockRequest?.(item.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InventoryLowStockAlert;