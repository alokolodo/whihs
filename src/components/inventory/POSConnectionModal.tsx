import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Link, Unlink, Package, Utensils } from "lucide-react";

interface POSConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POSConnectionModal = ({ isOpen, onClose }: POSConnectionModalProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for inventory items and menu items
  const inventoryItems = [
    { id: "INV001", name: "Premium Coffee Beans", category: "food", unit: "kg", currentStock: 25 },
    { id: "INV002", name: "Fresh Towels", category: "housekeeping", unit: "pieces", currentStock: 150 },
    { id: "INV003", name: "Red Wine", category: "beverages", unit: "bottles", currentStock: 48 },
    { id: "INV004", name: "Eggs", category: "food", unit: "dozen", currentStock: 20 },
    { id: "INV005", name: "Milk", category: "beverages", unit: "liters", currentStock: 30 }
  ];

  const menuItems = [
    { id: "MENU001", name: "Espresso", category: "beverages", price: 3.50 },
    { id: "MENU002", name: "Cappuccino", category: "beverages", price: 4.50 },
    { id: "MENU003", name: "House Red Wine", category: "beverages", price: 8.00 },
    { id: "MENU004", name: "Scrambled Eggs", category: "breakfast", price: 12.00 },
    { id: "MENU005", name: "Coffee Latte", category: "beverages", price: 5.00 }
  ];

  const [connections] = useState([
    { inventoryId: "INV001", menuId: "MENU001", quantityUsed: 0.05, inventoryName: "Premium Coffee Beans", menuName: "Espresso" },
    { inventoryId: "INV001", menuId: "MENU002", quantityUsed: 0.08, inventoryName: "Premium Coffee Beans", menuName: "Cappuccino" },
    { inventoryId: "INV003", menuId: "MENU003", quantityUsed: 0.15, inventoryName: "Red Wine", menuName: "House Red Wine" },
    { inventoryId: "INV004", menuId: "MENU004", quantityUsed: 2, inventoryName: "Eggs", menuName: "Scrambled Eggs" }
  ]);

  const filteredInventory = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = (inventoryItem: any, menuItem: any) => {
    toast({
      title: "Items Connected",
      description: `${inventoryItem.name} is now connected to ${menuItem.name}`,
    });
  };

  const handleDisconnect = (connection: any) => {
    toast({
      title: "Items Disconnected",
      description: `${connection.inventoryName} disconnected from ${connection.menuName}`,
      variant: "destructive"
    });
  };

  const isConnected = (inventoryId: string, menuId: string) => {
    return connections.some(conn => conn.inventoryId === inventoryId && conn.menuId === menuId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>POS Integration Settings</DialogTitle>
          <DialogDescription>
            Connect inventory items to menu items for automatic stock deduction when orders are placed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory or menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Current Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Connections</CardTitle>
              <CardDescription>Currently connected inventory and menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {connections.map((connection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">{connection.inventoryName}</span>
                      </div>
                      <Link className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-accent" />
                        <span className="font-medium">{connection.menuName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{connection.quantityUsed} per order</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDisconnect(connection)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connection Interface */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inventory Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inventory Items</CardTitle>
                <CardDescription>Available inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.category} • {item.currentStock} {item.unit}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        {item.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Menu Items</CardTitle>
                <CardDescription>Restaurant menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredMenu.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.category} • ${item.price}
                        </p>
                      </div>
                      <Badge variant="outline">
                        ${item.price}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Guide */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How to Connect Items</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              To connect items, select an inventory item and a menu item, then specify how much inventory is used per order.
              When orders are placed through the POS system, the connected inventory will be automatically deducted.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Save Connections
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default POSConnectionModal;