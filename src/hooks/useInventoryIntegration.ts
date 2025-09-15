import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  current_quantity: number;
  min_threshold: number;
  unit: string;
  cost_per_unit: number;
}

interface MenuItemConnection {
  menuItemId: string;
  inventoryItemId: string;
  quantityUsed: number;
}

export const useInventoryIntegration = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [connections, setConnections] = useState<MenuItemConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch inventory items
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('item_name');

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update inventory quantity when items are sold
  const updateInventoryFromSale = async (menuItemId: string, quantity: number) => {
    try {
      // Find connected inventory items for this menu item
      const connectedItems = connections.filter(conn => conn.menuItemId === menuItemId);
      
      for (const connection of connectedItems) {
        const inventoryItem = inventory.find(item => item.id === connection.inventoryItemId);
        if (inventoryItem) {
          const deductQuantity = connection.quantityUsed * quantity;
          const newQuantity = Math.max(0, inventoryItem.current_quantity - deductQuantity);
          
          await supabase
            .from('inventory')
            .update({ 
              current_quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', inventoryItem.id);

          // Show warning if stock is low
          if (newQuantity <= inventoryItem.min_threshold) {
            toast({
              title: "Low Stock Alert",
              description: `${inventoryItem.item_name} is running low (${newQuantity} ${inventoryItem.unit} remaining)`,
              variant: "destructive"
            });
          }
        }
      }
      
      // Refresh inventory after update
      await fetchInventory();
    } catch (error) {
      console.error('Error updating inventory from sale:', error);
      toast({
        title: "Inventory Update Error",
        description: "Failed to update inventory levels from sale.",
        variant: "destructive"
      });
    }
  };

  // Check ingredient availability for recipes
  const checkRecipeIngredients = (recipeIngredients: { inventoryItemId: string; quantityNeeded: number }[]) => {
    const availability = recipeIngredients.map(ingredient => {
      const inventoryItem = inventory.find(item => item.id === ingredient.inventoryItemId);
      return {
        ...ingredient,
        available: inventoryItem ? inventoryItem.current_quantity >= ingredient.quantityNeeded : false,
        currentStock: inventoryItem?.current_quantity || 0,
        itemName: inventoryItem?.item_name || 'Unknown Item'
      };
    });

    const allAvailable = availability.every(item => item.available);
    const missingItems = availability.filter(item => !item.available);

    return {
      canMake: allAvailable,
      availability,
      missingItems
    };
  };

  // Deduct ingredients for recipe production
  const deductRecipeIngredients = async (recipeIngredients: { inventoryItemId: string; quantityNeeded: number }[], recipeQuantity: number = 1) => {
    try {
      const check = checkRecipeIngredients(recipeIngredients);
      if (!check.canMake) {
        toast({
          title: "Insufficient Ingredients",
          description: `Cannot make recipe. Missing: ${check.missingItems.map(item => item.itemName).join(', ')}`,
          variant: "destructive"
        });
        return false;
      }

      // Deduct ingredients
      for (const ingredient of recipeIngredients) {
        const inventoryItem = inventory.find(item => item.id === ingredient.inventoryItemId);
        if (inventoryItem) {
          const deductQuantity = ingredient.quantityNeeded * recipeQuantity;
          const newQuantity = inventoryItem.current_quantity - deductQuantity;
          
          await supabase
            .from('inventory')
            .update({ 
              current_quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', inventoryItem.id);
        }
      }

      await fetchInventory();
      return true;
    } catch (error) {
      console.error('Error deducting recipe ingredients:', error);
      toast({
        title: "Ingredient Deduction Error",
        description: "Failed to deduct ingredients from inventory.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get low stock items for housekeeping alerts
  const getLowStockAlerts = () => {
    return inventory.filter(item => 
      item.current_quantity <= item.min_threshold &&
      (item.category === 'housekeeping' || item.category === 'amenities')
    );
  };

  // Request items for housekeeping
  const requestHousekeepingItems = async (itemId: string, quantity: number, roomNumber?: string) => {
    try {
      const item = inventory.find(inv => inv.id === itemId);
      if (!item) {
        toast({
          title: "Item Not Found",
          description: "The requested inventory item was not found.",
          variant: "destructive"
        });
        return false;
      }

      if (item.current_quantity < quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${item.current_quantity} ${item.unit} available.`,
          variant: "destructive"
        });
        return false;
      }

      // Update inventory
      const newQuantity = item.current_quantity - quantity;
      await supabase
        .from('inventory')
        .update({ 
          current_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      toast({
        title: "Items Issued",
        description: `${quantity} ${item.unit} of ${item.item_name} issued${roomNumber ? ` for Room ${roomNumber}` : ''}.`,
      });

      await fetchInventory();
      return true;
    } catch (error) {
      console.error('Error requesting housekeeping items:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    connections,
    isLoading,
    fetchInventory,
    updateInventoryFromSale,
    checkRecipeIngredients,
    deductRecipeIngredients,
    getLowStockAlerts,
    requestHousekeepingItems,
    setConnections
  };
};

export default useInventoryIntegration;
