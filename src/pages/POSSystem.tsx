import { useState } from "react";
import { 
  Coffee, 
  Wine, 
  IceCream, 
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Search,
  User,
  Receipt,
  Banknote,
  Users,
  DollarSign,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface POSItem {
  id: string;
  name: string;
  price: number;
  category: string;
  color: string;
}

interface Guest {
  id: string;
  name: string;
  table?: string;
  items: Array<POSItem & { quantity: number }>;
}

interface PaymentState {
  method: string;
  processing: boolean;
  completed: boolean;
  printReceipt: boolean;
}

const POSSystem = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedGuest, setSelectedGuest] = useState("1");
  const [paymentState, setPaymentState] = useState<PaymentState>({
    method: "",
    processing: false,
    completed: false,
    printReceipt: true,
  });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([
    { 
      id: "1", 
      name: "GUEST 1", 
      table: "Table 5",
      items: [
        { id: "1", name: "SM PIZZA", price: 5.75, category: "food", color: "bg-amber-500", quantity: 1 },
        { id: "9", name: "ROOT BEER", price: 1.25, category: "drinks", color: "bg-blue-500", quantity: 1 }
      ]
    },
    { 
      id: "2", 
      name: "GUEST 2", 
      table: "Table 3",
      items: [
        { id: "3", name: "CHILI TACO", price: 2.05, category: "food", color: "bg-red-500", quantity: 1 },
        { id: "4", name: "BOT WATER", price: 1.50, category: "drinks", color: "bg-blue-400", quantity: 1 }
      ]
    },
    { 
      id: "3", 
      name: "GUEST 3", 
      table: "Walk-in",
      items: [
        { id: "5", name: "SIMPLE WINGS", price: 9.00, category: "food", color: "bg-orange-500", quantity: 1 },
        { id: "6", name: "COORS LIGHT", price: 7.00, category: "drinks", color: "bg-yellow-500", quantity: 1 }
      ]
    }
  ]);

  const categories = [
    { id: "all", name: "ALL", color: "bg-gray-500" },
    { id: "beer", name: "BEER BASKET", color: "bg-amber-600" },
    { id: "wine", name: "WINE", color: "bg-red-700" },
    { id: "cocktail-short", name: "COCKTAIL SHORT", color: "bg-red-500" },
    { id: "cocktail", name: "COCKTAIL", color: "bg-red-600" },
    { id: "drinks", name: "DRINKS", color: "bg-green-600" },
    { id: "desserts", name: "DESSERTS", color: "bg-blue-400" },
    { id: "clubs", name: "CLUBS", color: "bg-blue-800" },
    { id: "sandwiches", name: "SANDWICHES", color: "bg-purple-600" },
    { id: "burgers", name: "BURGERS", color: "bg-green-700" },
    { id: "platters", name: "PLATTERS", color: "bg-amber-700" },
    { id: "seafood", name: "SEAFOOD", color: "bg-teal-600" },
  ];

  const items: POSItem[] = [
    // Subs & Sandwiches
    { id: "sub1", name: "MEATBALL SUB", price: 8.50, category: "sandwiches", color: "bg-red-500" },
    { id: "sub2", name: "STEAK SUB", price: 9.75, category: "sandwiches", color: "bg-red-600" },
    { id: "sub3", name: "STEAK HOGIE", price: 10.25, category: "sandwiches", color: "bg-red-700" },
    { id: "sub4", name: "ITALIAN SAUSAGE SUB", price: 8.75, category: "sandwiches", color: "bg-red-500" },
    { id: "sub5", name: "PIZZA SUB", price: 7.50, category: "sandwiches", color: "bg-red-600" },
    { id: "sub6", name: "CHICKEN BREAST", price: 9.25, category: "sandwiches", color: "bg-amber-600" },
    { id: "sub7", name: "ROAST BBQ CHICKEN", price: 9.50, category: "sandwiches", color: "bg-amber-700" },
    { id: "sub8", name: "HAM SUB", price: 7.75, category: "sandwiches", color: "bg-blue-600" },
    { id: "sub9", name: "TUNA SUB", price: 8.25, category: "sandwiches", color: "bg-blue-700" },
    { id: "sub10", name: "TURKEY SUB", price: 8.00, category: "sandwiches", color: "bg-blue-600" },
    { id: "sub11", name: "BLT SUB", price: 7.25, category: "sandwiches", color: "bg-blue-700" },
    
    // Drinks
    { id: "drink1", name: "COKE", price: 2.50, category: "drinks", color: "bg-green-600" },
    { id: "drink2", name: "SPRITE", price: 2.50, category: "drinks", color: "bg-green-500" },
    { id: "drink3", name: "ORANGE JUICE", price: 3.25, category: "drinks", color: "bg-green-400" },
    { id: "drink4", name: "COFFEE", price: 2.75, category: "drinks", color: "bg-green-700" },
    
    // Beer
    { id: "beer1", name: "BUDWEISER", price: 4.50, category: "beer", color: "bg-amber-600" },
    { id: "beer2", name: "COORS LIGHT", price: 4.25, category: "beer", color: "bg-amber-500" },
    { id: "beer3", name: "CORONA", price: 5.00, category: "beer", color: "bg-amber-700" },
    
    // Wine
    { id: "wine1", name: "RED WINE", price: 8.00, category: "wine", color: "bg-red-700" },
    { id: "wine2", name: "WHITE WINE", price: 7.50, category: "wine", color: "bg-red-600" },
    { id: "wine3", name: "CHAMPAGNE", price: 25.00, category: "wine", color: "bg-red-800" },
    
    // Cocktails
    { id: "cocktail1", name: "MARTINI", price: 12.00, category: "cocktail", color: "bg-red-600" },
    { id: "cocktail2", name: "MOJITO", price: 10.50, category: "cocktail", color: "bg-red-500" },
    { id: "cocktail3", name: "OLD FASHIONED", price: 13.00, category: "cocktail-short", color: "bg-red-500" },
    
    // Burgers
    { id: "burger1", name: "CLASSIC BURGER", price: 12.50, category: "burgers", color: "bg-green-700" },
    { id: "burger2", name: "CHEESE BURGER", price: 13.25, category: "burgers", color: "bg-green-600" },
    { id: "burger3", name: "BACON BURGER", price: 14.75, category: "burgers", color: "bg-green-800" },
    
    // Platters
    { id: "platter1", name: "WINGS PLATTER", price: 16.50, category: "platters", color: "bg-amber-700" },
    { id: "platter2", name: "NACHOS PLATTER", price: 14.25, category: "platters", color: "bg-amber-600" },
    
    // Seafood
    { id: "seafood1", name: "GRILLED SALMON", price: 22.00, category: "seafood", color: "bg-teal-600" },
    { id: "seafood2", name: "FISH & CHIPS", price: 18.50, category: "seafood", color: "bg-teal-500" },
    
    // Desserts
    { id: "dessert1", name: "CHOCOLATE CAKE", price: 6.50, category: "desserts", color: "bg-blue-400" },
    { id: "dessert2", name: "ICE CREAM", price: 4.75, category: "desserts", color: "bg-blue-300" },
  ];

  const filteredItems = activeCategory === "all" 
    ? items 
    : items.filter(item => item.category === activeCategory);

  const currentGuest = guests.find(g => g.id === selectedGuest);

  const addItemToGuest = (item: POSItem) => {
    if (!currentGuest) return;
    
    setGuests(prev => prev.map(guest => {
      if (guest.id === selectedGuest) {
        const existingItem = guest.items.find(i => i.id === item.id);
        if (existingItem) {
          return {
            ...guest,
            items: guest.items.map(i => 
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          };
        } else {
          return {
            ...guest,
            items: [...guest.items, { ...item, quantity: 1 }]
          };
        }
      }
      return guest;
    }));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!currentGuest) return;
    
    setGuests(prev => prev.map(guest => {
      if (guest.id === selectedGuest) {
        if (quantity <= 0) {
          return {
            ...guest,
            items: guest.items.filter(i => i.id !== itemId)
          };
        }
        return {
          ...guest,
          items: guest.items.map(i => 
            i.id === itemId ? { ...i, quantity } : i
          )
        };
      }
      return guest;
    }));
  };

  const getGuestTotal = (guest: Guest) => {
    return guest.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalTax = (subtotal: number) => {
    return subtotal * 0.0825; // 8.25% tax
  };

  // Payment Functions
  const handlePayment = (method: string) => {
    if (!currentGuest || currentGuest.items.length === 0) return;
    
    setPaymentState(prev => ({ ...prev, method, processing: true }));
    setShowPaymentDialog(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentState(prev => ({ ...prev, processing: false, completed: true }));
      
      toast({
        title: "Payment Successful",
        description: `Payment of $${(getGuestTotal(currentGuest) + getTotalTax(getGuestTotal(currentGuest))).toFixed(2)} processed via ${method}`,
      });
      
      // Clear the guest's order
      setGuests(prev => prev.map(guest => 
        guest.id === selectedGuest 
          ? { ...guest, items: [] }
          : guest
      ));
      
      setTimeout(() => {
        setShowPaymentDialog(false);
        setPaymentState({ method: "", processing: false, completed: false, printReceipt: true });
      }, 2000);
    }, 2000);
  };

  const handleCancel = () => {
    if (currentGuest && currentGuest.items.length > 0) {
      setGuests(prev => prev.map(guest => 
        guest.id === selectedGuest 
          ? { ...guest, items: [] }
          : guest
      ));
      
      toast({
        title: "Order Cancelled",
        description: "The current order has been cancelled.",
        variant: "destructive",
      });
    }
  };

  const handleSettle = () => {
    if (!currentGuest || currentGuest.items.length === 0) return;
    
    toast({
      title: "Order Settled",
      description: "Order has been settled and moved to pending payment.",
    });
  };

  const toggleReceipt = () => {
    setPaymentState(prev => ({ ...prev, printReceipt: !prev.printReceipt }));
    toast({
      title: paymentState.printReceipt ? "Receipt Disabled" : "Receipt Enabled",
      description: paymentState.printReceipt ? "No receipt will be printed" : "Receipt will be printed",
    });
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Guest Orders */}
      <div className="w-80 bg-card border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">foodiv</h2>
            <Badge variant="outline">NEW DINE-IN ORDER</Badge>
          </div>
          <div className="text-sm text-muted-foreground mb-2">SERVER: WALDO T</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="SEARCH" className="pl-10" />
          </div>
        </div>

        {/* Guest Selection */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            <span className="font-medium">GUEST {guests.length} OF 3</span>
          </div>
          <div className="space-y-2">
            {guests.map((guest, index) => (
              <Button
                key={guest.id}
                variant={selectedGuest === guest.id ? "default" : "outline"}
                className={`w-full justify-start ${
                  selectedGuest === guest.id ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => setSelectedGuest(guest.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{guest.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Guest Order */}
        <ScrollArea className="flex-1">
          {currentGuest && (
            <div className="p-4">
              <h3 className="font-medium mb-4 text-accent">{currentGuest.name}</h3>
              <div className="space-y-3">
                {currentGuest.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center justify-between py-2 border-b border-border/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{index + 1}.</span>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <div className="font-bold text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Total & Payment */}
        {currentGuest && currentGuest.items.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-2xl font-bold">
                <span>${getGuestTotal(currentGuest).toFixed(2)}</span>
                <span className="text-sm font-normal">
                  TAX ${getTotalTax(getGuestTotal(currentGuest)).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant={paymentState.printReceipt ? "outline" : "default"} 
                size="sm"
                onClick={toggleReceipt}
              >
                <Receipt className="h-4 w-4" />
                <span className="text-xs">
                  {paymentState.printReceipt ? "RECEIPT" : "NO RECEIPT"}
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("BANK")}
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">BANK</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handlePayment("CARD")}
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">CARD</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSettle}
              >
                <span className="text-xs">SETTLE</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button 
                variant="destructive" 
                size="sm" 
                className="col-span-1"
                onClick={handleCancel}
              >
                <span className="text-xs">CANCEL</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("CASH")}
              >
                <Banknote className="h-4 w-4" />
                <span className="text-xs">CASH</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("CREDIT")}
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">CREDIT</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Categories & Items */}
      <div className="flex-1 flex flex-col">
        {/* Categories */}
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-6 gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className={`h-16 text-white font-bold text-xs ${category.color} ${
                  activeCategory === category.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-6 gap-3">
            {filteredItems.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className={`h-20 text-white font-bold text-xs ${item.color} hover:opacity-90 transition-opacity flex flex-col justify-center p-2`}
                onClick={() => addItemToGuest(item)}
              >
                <div className="text-center">
                  <div className="text-xs leading-tight mb-1">{item.name}</div>
                  <div className="text-xs opacity-90">${item.price.toFixed(2)}</div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Payment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {paymentState.processing ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p>Processing {paymentState.method} payment...</p>
              </>
            ) : paymentState.completed ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-green-600 font-semibold">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">
                  ${currentGuest ? (getGuestTotal(currentGuest) + getTotalTax(getGuestTotal(currentGuest))).toFixed(2) : '0.00'} paid via {paymentState.method}
                </p>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSSystem;