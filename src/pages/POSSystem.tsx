import { useState } from "react";
import { 
  Coffee, 
  Utensils, 
  Wine, 
  IceCream, 
  ShoppingBag, 
  Dumbbell,
  Waves,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface POSItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

interface CartItem extends POSItem {
  quantity: number;
}

const POSSystem = () => {
  const [activeCategory, setActiveCategory] = useState("drinks");
  const [cart, setCart] = useState<CartItem[]>([]);

  const categories = [
    { id: "drinks", name: "Drinks", icon: Coffee, color: "bg-blue-500" },
    { id: "meals", name: "Meals", icon: Utensils, color: "bg-green-500" },
    { id: "wine", name: "Wine & Bar", icon: Wine, color: "bg-purple-500" },
    { id: "desserts", name: "Desserts", icon: IceCream, color: "bg-pink-500" },
    { id: "retail", name: "Retail", icon: ShoppingBag, color: "bg-orange-500" },
    { id: "spa", name: "Spa", icon: Waves, color: "bg-teal-500" },
    { id: "gym", name: "Gym", icon: Dumbbell, color: "bg-red-500" },
  ];

  const items: POSItem[] = [
    // Drinks
    { id: "1", name: "Espresso", price: 4.50, category: "drinks" },
    { id: "2", name: "Cappuccino", price: 5.50, category: "drinks" },
    { id: "3", name: "Fresh Orange Juice", price: 6.00, category: "drinks" },
    { id: "4", name: "Smoothie Bowl", price: 12.00, category: "drinks" },
    
    // Meals
    { id: "5", name: "Grilled Salmon", price: 28.00, category: "meals" },
    { id: "6", name: "Caesar Salad", price: 16.00, category: "meals" },
    { id: "7", name: "Beef Tenderloin", price: 42.00, category: "meals" },
    { id: "8", name: "Vegetarian Pasta", price: 18.00, category: "meals" },
    
    // Wine & Bar
    { id: "9", name: "House Red Wine", price: 15.00, category: "wine" },
    { id: "10", name: "Champagne", price: 85.00, category: "wine" },
    { id: "11", name: "Craft Cocktail", price: 18.00, category: "wine" },
    { id: "12", name: "Premium Whiskey", price: 25.00, category: "wine" },
    
    // Desserts
    { id: "13", name: "Chocolate Cake", price: 12.00, category: "desserts" },
    { id: "14", name: "Tiramisu", price: 14.00, category: "desserts" },
    { id: "15", name: "Fresh Fruit Platter", price: 16.00, category: "desserts" },
    
    // Retail
    { id: "16", name: "Hotel T-Shirt", price: 35.00, category: "retail" },
    { id: "17", name: "Luxury Towel Set", price: 120.00, category: "retail" },
    { id: "18", name: "Souvenir Mug", price: 18.00, category: "retail" },
    
    // Spa
    { id: "19", name: "60min Massage", price: 150.00, category: "spa" },
    { id: "20", name: "Facial Treatment", price: 120.00, category: "spa" },
    { id: "21", name: "Sauna Session", price: 45.00, category: "spa" },
    
    // Gym
    { id: "22", name: "Day Pass", price: 25.00, category: "gym" },
    { id: "23", name: "Personal Training", price: 80.00, category: "gym" },
    { id: "24", name: "Protein Shake", price: 8.00, category: "gym" },
  ];

  const filteredItems = items.filter(item => item.category === activeCategory);

  const addToCart = (item: POSItem) => {
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

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="h-full flex bg-background">
      {/* Left Panel - Categories and Items */}
      <div className="flex-1 flex flex-col">
        {/* Categories */}
        <div className="p-4 border-b border-border/50">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
                  <div className="text-lg font-bold text-accent">
                    ${item.price.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-80 border-l border-border/50 bg-card flex flex-col">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Current Order</h2>
            <Badge variant="secondary">{cart.length} items</Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in cart</p>
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
                      <div className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Cart Footer */}
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
              <Button className="button-luxury">
                <CreditCard className="h-4 w-4 mr-2" />
                Charge
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSystem;