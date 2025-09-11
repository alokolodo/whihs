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
        { id: "service1", name: "ROOM SERVICE", price: 15.00, category: "services", color: "bg-purple-600", quantity: 1 },
        { id: "ent1", name: "POOL ACCESS", price: 20.00, category: "entertainment", color: "bg-blue-600", quantity: 1 }
      ]
    },
    { 
      id: "2", 
      name: "GUEST 2", 
      table: "Table 3",
      items: [
        { id: "service2", name: "LAUNDRY SERVICE", price: 25.00, category: "services", color: "bg-purple-500", quantity: 1 },
        { id: "ent2", name: "GYM ACCESS", price: 15.00, category: "entertainment", color: "bg-blue-500", quantity: 1 }
      ]
    },
    { 
      id: "3", 
      name: "GUEST 3", 
      table: "Walk-in",
      items: [
        { id: "service3", name: "SPA MASSAGE", price: 80.00, category: "spa", color: "bg-pink-600", quantity: 1 },
        { id: "upgrade1", name: "SUITE UPGRADE", price: 75.00, category: "upgrades", color: "bg-amber-600", quantity: 1 }
      ]
    }
  ]);

  const categories = [
    { id: "all", name: "ALL", color: "bg-gray-500" },
    { id: "services", name: "SERVICES", color: "bg-purple-600" },
    { id: "spa", name: "SPA & WELLNESS", color: "bg-pink-600" },
    { id: "entertainment", name: "ENTERTAINMENT", color: "bg-blue-600" },
    { id: "transport", name: "TRANSPORT", color: "bg-gray-600" },
    { id: "business", name: "BUSINESS", color: "bg-indigo-600" },
    { id: "retail", name: "RETAIL", color: "bg-teal-600" },
    { id: "upgrades", name: "UPGRADES", color: "bg-amber-600" },
  ];

  // Hotel Services & Amenities (Non-food items only)
  const items: POSItem[] = [
    { id: "service1", name: "ROOM SERVICE", price: 15.00, category: "services", color: "bg-purple-600" },
    { id: "service2", name: "LAUNDRY SERVICE", price: 25.00, category: "services", color: "bg-purple-500" },
    { id: "service3", name: "SPA MASSAGE", price: 80.00, category: "spa", color: "bg-pink-600" },
    { id: "service4", name: "FACIAL TREATMENT", price: 60.00, category: "spa", color: "bg-pink-500" },
    { id: "service5", name: "MANICURE", price: 35.00, category: "spa", color: "bg-pink-400" },
    { id: "service6", name: "PEDICURE", price: 40.00, category: "spa", color: "bg-pink-700" },
    
    // Entertainment & Activities
    { id: "ent1", name: "POOL ACCESS", price: 20.00, category: "entertainment", color: "bg-blue-600" },
    { id: "ent2", name: "GYM ACCESS", price: 15.00, category: "entertainment", color: "bg-blue-500" },
    { id: "ent3", name: "TENNIS COURT", price: 30.00, category: "entertainment", color: "bg-green-600" },
    { id: "ent4", name: "GOLF COURSE", price: 75.00, category: "entertainment", color: "bg-green-700" },
    { id: "ent5", name: "GAME CENTER", price: 10.00, category: "entertainment", color: "bg-yellow-600" },
    { id: "ent6", name: "KARAOKE ROOM", price: 45.00, category: "entertainment", color: "bg-orange-600" },
    
    // Transportation
    { id: "trans1", name: "AIRPORT SHUTTLE", price: 25.00, category: "transport", color: "bg-gray-600" },
    { id: "trans2", name: "TAXI SERVICE", price: 15.00, category: "transport", color: "bg-gray-500" },
    { id: "trans3", name: "CAR RENTAL", price: 65.00, category: "transport", color: "bg-gray-700" },
    { id: "trans4", name: "CITY TOUR", price: 50.00, category: "transport", color: "bg-gray-800" },
    
    // Business Services
    { id: "biz1", name: "CONFERENCE ROOM", price: 100.00, category: "business", color: "bg-indigo-600" },
    { id: "biz2", name: "PRINTING SERVICE", price: 5.00, category: "business", color: "bg-indigo-500" },
    { id: "biz3", name: "FAX SERVICE", price: 3.00, category: "business", color: "bg-indigo-400" },
    { id: "biz4", name: "INTERNET ACCESS", price: 10.00, category: "business", color: "bg-indigo-700" },
    
    // Retail Items
    { id: "retail1", name: "HOTEL ROBE", price: 45.00, category: "retail", color: "bg-teal-600" },
    { id: "retail2", name: "TOWEL SET", price: 25.00, category: "retail", color: "bg-teal-500" },
    { id: "retail3", name: "TOILETRIES KIT", price: 15.00, category: "retail", color: "bg-teal-400" },
    { id: "retail4", name: "SOUVENIR T-SHIRT", price: 20.00, category: "retail", color: "bg-teal-700" },
    { id: "retail5", name: "POSTCARD SET", price: 8.00, category: "retail", color: "bg-teal-300" },
    
    // Room Upgrades
    { id: "upgrade1", name: "SUITE UPGRADE", price: 75.00, category: "upgrades", color: "bg-amber-600" },
    { id: "upgrade2", name: "OCEAN VIEW", price: 45.00, category: "upgrades", color: "bg-amber-500" },
    { id: "upgrade3", name: "BALCONY ACCESS", price: 35.00, category: "upgrades", color: "bg-amber-400" },
    { id: "upgrade4", name: "LATE CHECKOUT", price: 25.00, category: "upgrades", color: "bg-amber-700" },
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
    
    // Simulate payment processing with different methods
    const processingTime = method === "MOBILE_MONEY" ? 3000 : method === "BANK" ? 4000 : 2000;
    
    setTimeout(() => {
      setPaymentState(prev => ({ ...prev, processing: false, completed: true }));
      
      const total = getGuestTotal(currentGuest) + getTotalTax(getGuestTotal(currentGuest));
      const currency = method === "MOBILE_MONEY" || method === "BANK" ? "₦" : "$";
      
      toast({
        title: "Payment Successful",
        description: `Payment of ${currency}${total.toFixed(2)} processed via ${method}`,
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
    }, processingTime);
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
                onClick={() => handlePayment("BANK_TRANSFER")}
                className="bg-orange-600 hover:bg-orange-700 text-white"
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
            
            <div className="grid grid-cols-4 gap-2 mt-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancel}
              >
                <span className="text-xs">CANCEL</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("CASH")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Banknote className="h-4 w-4" />
                <span className="text-xs">CASH</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("MOBILE_MONEY")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">MOBILE</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("PAYSTACK")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">PAYSTACK</span>
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