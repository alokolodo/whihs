import { useState } from "react";
import { 
  Utensils, 
  Wine, 
  Coffee, 
  IceCream,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Clock,
  User,
  Table as TableIcon,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RestaurantItem {
  id: string;
  name: string;
  price: number;
  category: string;
  prepTime: number;
  isAvailable: boolean;
  image?: string;
}

interface OrderItem extends RestaurantItem {
  quantity: number;
  specialInstructions?: string;
}

const RestaurantPOS = () => {
  const [activeCategory, setActiveCategory] = useState("mains");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("dine-in");

  const categories = [
    { id: "mains", name: "Main Course", icon: Utensils, color: "bg-green-500" },
    { id: "appetizers", name: "Appetizers", icon: Utensils, color: "bg-blue-500" },
    { id: "beverages", name: "Beverages", icon: Coffee, color: "bg-orange-500" },
    { id: "wine", name: "Wine & Bar", icon: Wine, color: "bg-purple-500" },
    { id: "desserts", name: "Desserts", icon: IceCream, color: "bg-pink-500" },
  ];

  const restaurantItems: RestaurantItem[] = [
    // Main Course
    { id: "1", name: "Grilled Salmon", price: 28.00, category: "mains", prepTime: 25, isAvailable: true },
    { id: "2", name: "Beef Tenderloin", price: 42.00, category: "mains", prepTime: 30, isAvailable: true },
    { id: "3", name: "Chicken Parmesan", price: 24.00, category: "mains", prepTime: 20, isAvailable: true },
    { id: "4", name: "Vegetarian Pasta", price: 18.00, category: "mains", prepTime: 15, isAvailable: true },
    { id: "5", name: "Fish & Chips", price: 22.00, category: "mains", prepTime: 18, isAvailable: true },
    { id: "6", name: "Steak & Fries", price: 35.00, category: "mains", prepTime: 25, isAvailable: true },
    
    // Appetizers
    { id: "7", name: "Caesar Salad", price: 16.00, category: "appetizers", prepTime: 10, isAvailable: true },
    { id: "8", name: "Bruschetta", price: 12.00, category: "appetizers", prepTime: 8, isAvailable: true },
    { id: "9", name: "Calamari Rings", price: 14.00, category: "appetizers", prepTime: 12, isAvailable: true },
    { id: "10", name: "Soup of the Day", price: 8.00, category: "appetizers", prepTime: 5, isAvailable: true },
    { id: "11", name: "Chicken Wings", price: 16.00, category: "appetizers", prepTime: 15, isAvailable: true },
    
    // Beverages (Food & Drinks only)
    { id: "12", name: "Fresh Orange Juice", price: 6.00, category: "beverages", prepTime: 3, isAvailable: true },
    { id: "13", name: "Apple Juice", price: 5.50, category: "beverages", prepTime: 2, isAvailable: true },
    { id: "14", name: "Bottled Water", price: 3.00, category: "beverages", prepTime: 1, isAvailable: true },
    { id: "15", name: "Sparkling Water", price: 4.00, category: "beverages", prepTime: 1, isAvailable: true },
    { id: "16", name: "Fresh Lemonade", price: 5.00, category: "beverages", prepTime: 3, isAvailable: true },
    { id: "17", name: "Iced Tea", price: 4.00, category: "beverages", prepTime: 2, isAvailable: true },
    { id: "18", name: "Hot Tea", price: 3.50, category: "beverages", prepTime: 3, isAvailable: true },
    { id: "19", name: "Coffee", price: 4.50, category: "beverages", prepTime: 4, isAvailable: true },
    
    // Wine & Bar (Alcoholic beverages)
    { id: "20", name: "House Red Wine", price: 15.00, category: "wine", prepTime: 2, isAvailable: true },
    { id: "21", name: "House White Wine", price: 14.00, category: "wine", prepTime: 2, isAvailable: true },
    { id: "22", name: "Champagne", price: 85.00, category: "wine", prepTime: 3, isAvailable: true },
    { id: "23", name: "Local Beer", price: 6.00, category: "wine", prepTime: 2, isAvailable: true },
    { id: "24", name: "Premium Beer", price: 8.00, category: "wine", prepTime: 2, isAvailable: true },
    
    // Desserts
    { id: "25", name: "Chocolate Cake", price: 12.00, category: "desserts", prepTime: 8, isAvailable: true },
    { id: "26", name: "Tiramisu", price: 14.00, category: "desserts", prepTime: 5, isAvailable: true },
    { id: "27", name: "Fresh Fruit Platter", price: 16.00, category: "desserts", prepTime: 10, isAvailable: true },
    { id: "28", name: "Ice Cream Selection", price: 8.00, category: "desserts", prepTime: 3, isAvailable: true },
    { id: "29", name: "Cheesecake", price: 10.00, category: "desserts", prepTime: 5, isAvailable: true },
  ];

  const filteredItems = restaurantItems.filter(item => 
    item.category === activeCategory && item.isAvailable
  );

  const addToCart = (item: RestaurantItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalPrepTime = () => {
    return Math.max(...cart.map(item => item.prepTime));
  };

  const clearCart = () => {
    setCart([]);
  };

  const sendToKitchen = () => {
    // Here you would send the order to kitchen system
    console.log("Order sent to kitchen:", { cart, table: selectedTable, customer: customerName, type: orderType });
  };

  return (
    <div className="h-full flex bg-background">
      {/* Left Panel - Categories and Items */}
      <div className="flex-1 flex flex-col">
        {/* Categories */}
        <div className="p-4 border-b border-border/50">
          <div className="grid grid-cols-5 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={`pos-category-card flex-col gap-2 h-20 ${
                    activeCategory === category.id ? "button-luxury" : ""
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Items Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="pos-item-card cursor-pointer transition-all hover:shadow-lg"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h3>
                  <div className="text-lg font-bold text-accent mb-1">
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.prepTime}min
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Order */}
      <div className="w-80 border-l border-border/50 bg-card flex flex-col">
        {/* Order Header */}
        <div className="p-4 border-b border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Restaurant Order</h2>
            <Badge variant="secondary">{cart.length} items</Badge>
          </div>

          <Tabs value={orderType} onValueChange={setOrderType} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dine-in">Dine In</TabsTrigger>
              <TabsTrigger value="takeout">Takeout</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {orderType === "dine-in" && (
              <div className="space-y-2">
                <Label>Table Number</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        Table {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in order</p>
              <p className="text-sm">Tap items to add them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.prepTime}min
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Order Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border/50 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${getTotalAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8.5%):</span>
                <span>${(getTotalAmount() * 0.085).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Est. Prep Time:</span>
                <span>{getTotalPrepTime()}min</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${(getTotalAmount() * 1.085).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={clearCart}>
                Clear All
              </Button>
              <Button className="button-luxury" onClick={sendToKitchen}>
                <Printer className="h-4 w-4 mr-2" />
                Send to Kitchen
              </Button>
            </div>

            <Button className="w-full" variant="secondary">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPOS;