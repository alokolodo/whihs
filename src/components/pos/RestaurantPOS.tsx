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
  Users,
  Receipt,
  Banknote,
  DollarSign,
  Sandwich,
  Fish
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMenuItems, MenuItem } from "@/hooks/useMenuItems";

interface OrderItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
}

interface Guest {
  id: string;
  name: string;
  tableNumber?: string;
  roomNumber?: string;
  guestType: 'room' | 'table' | 'standalone';
  items: OrderItem[];
}

interface Table {
  id: string;
  number: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  guest?: Guest;
}

const RestaurantPOS = () => {
  const { getFoodAndBeverageItems } = useMenuItems();
  const [activeCategory, setActiveCategory] = useState("");
  const [showTableView, setShowTableView] = useState(false);
  const [showGuestTypeModal, setShowGuestTypeModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  // Initialize tables
  const [tables, setTables] = useState<Table[]>([
    { id: "1", number: "1", seats: 4, status: "available" },
    { id: "2", number: "2", seats: 2, status: "available" },
    { id: "3", number: "3", seats: 6, status: "available" },
    { id: "4", number: "4", seats: 4, status: "available" },
    { id: "5", number: "5", seats: 8, status: "available" },
    { id: "6", number: "6", seats: 2, status: "available" },
    { id: "7", number: "7", seats: 4, status: "available" },
    { id: "8", number: "8", seats: 6, status: "available" },
  ]);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");

  const restaurantItems = getFoodAndBeverageItems();

  // Map menu categories to display categories
  const categoryMap = {
    "Main Course": { name: "MAINS", icon: Utensils, color: "bg-red-700 hover:bg-red-800" },
    "Appetizers": { name: "APPETIZERS", icon: Utensils, color: "bg-orange-500 hover:bg-orange-600" },
    "Desserts": { name: "DESSERTS", icon: IceCream, color: "bg-blue-400 hover:bg-blue-500" },
    "Salads": { name: "SALADS", icon: Utensils, color: "bg-purple-500 hover:bg-purple-600" },
    "Soups": { name: "SOUPS", icon: Utensils, color: "bg-teal-500 hover:bg-teal-600" },
    "Sides": { name: "SIDES", icon: Utensils, color: "bg-amber-500 hover:bg-amber-600" },
    "Red Wine": { name: "RED WINE", icon: Wine, color: "bg-red-600 hover:bg-red-700" },
    "White Wine": { name: "WHITE WINE", icon: Wine, color: "bg-yellow-600 hover:bg-yellow-700" },
    "Rosé Wine": { name: "ROSÉ WINE", icon: Wine, color: "bg-pink-500 hover:bg-pink-600" },
    "Sparkling Wine": { name: "SPARKLING", icon: Wine, color: "bg-indigo-500 hover:bg-indigo-600" },
    "Cocktails": { name: "COCKTAILS", icon: Wine, color: "bg-red-500 hover:bg-red-600" },
    "Spirits": { name: "SPIRITS", icon: Wine, color: "bg-amber-700 hover:bg-amber-800" },
    "Beer": { name: "BEER", icon: Coffee, color: "bg-yellow-500 hover:bg-yellow-600" },
    "Non-Alcoholic Beverages": { name: "SOFT DRINKS", icon: Coffee, color: "bg-green-500 hover:bg-green-600" },
    "Hot Beverages": { name: "HOT DRINKS", icon: Coffee, color: "bg-brown-500 hover:bg-brown-600" },
  };

  // Get unique categories from menu items
  const availableCategories = [...new Set(restaurantItems.map(item => item.category))]
    .filter(category => categoryMap[category as keyof typeof categoryMap])
    .map(category => ({
      id: category,
      ...categoryMap[category as keyof typeof categoryMap]
    }));

  const filteredItems = restaurantItems.filter(item => 
    item.category === activeCategory
  );

  const selectedGuest = guests.find(g => g.id === selectedGuestId);

  const addToGuestOrder = (item: MenuItem) => {
    setGuests(prev => prev.map(guest => {
      if (guest.id === selectedGuestId) {
        const existing = guest.items.find(orderItem => orderItem.id === item.id);
        if (existing) {
          return {
            ...guest,
            items: guest.items.map(orderItem =>
              orderItem.id === item.id 
                ? { ...orderItem, quantity: orderItem.quantity + 1 }
                : orderItem
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

  const updateGuestItemQuantity = (guestId: string, itemId: string, quantity: number) => {
    setGuests(prev => prev.map(guest => {
      if (guest.id === guestId) {
        if (quantity <= 0) {
          return {
            ...guest,
            items: guest.items.filter(item => item.id !== itemId)
          };
        } else {
          return {
            ...guest,
            items: guest.items.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            )
          };
        }
      }
      return guest;
    }));
  };

  const getGuestTotal = (guest: Guest) => {
    return guest.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getGrandTotal = () => {
    return guests.reduce((total, guest) => total + getGuestTotal(guest), 0);
  };

  const clearGuestOrder = (guestId: string) => {
    setGuests(prev => prev.map(guest =>
      guest.id === guestId ? { ...guest, items: [] } : guest
    ));
  };

  const createGuest = (type: 'room' | 'table' | 'standalone', tableId?: string, roomNumber?: string) => {
    const newGuestId = Date.now().toString();
    const newGuest: Guest = {
      id: newGuestId,
      name: type === 'room' ? `Room ${roomNumber}` : 
            type === 'table' ? `Table ${tables.find(t => t.id === tableId)?.number}` :
            `Guest ${guests.length + 1}`,
      guestType: type,
      tableNumber: type === 'table' ? tables.find(t => t.id === tableId)?.number : undefined,
      roomNumber: type === 'room' ? roomNumber : undefined,
      items: []
    };

    setGuests(prev => [...prev, newGuest]);
    
    if (type === 'table' && tableId) {
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { ...table, status: 'occupied', guest: newGuest }
          : table
      ));
    }
    
    setSelectedGuestId(newGuestId);
    setShowGuestTypeModal(false);
    setShowTableView(false);
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Table Selection Modal */}
      {showTableView && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
          <Card className="w-4/5 h-4/5 bg-white">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Select Table</h3>
                <Button variant="ghost" onClick={() => setShowTableView(false)}>✕</Button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 flex-1">
                {tables.map((table) => (
                  <Card
                    key={table.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      table.status === 'available' ? 'border-green-500 hover:bg-green-50' :
                      table.status === 'occupied' ? 'border-red-500 bg-red-50' :
                      table.status === 'reserved' ? 'border-yellow-500 bg-yellow-50' :
                      'border-gray-400 bg-gray-100'
                    }`}
                    onClick={() => {
                      if (table.status === 'available') {
                        setSelectedTable(table.id);
                        setShowGuestTypeModal(true);
                      }
                    }}
                  >
                    <CardContent className="p-4 text-center h-24 flex flex-col justify-center">
                      <h4 className="font-bold text-lg">Table {table.number}</h4>
                      <p className="text-sm text-gray-600">{table.seats} seats</p>
                      <Badge 
                        className={`mt-1 ${
                          table.status === 'available' ? 'bg-green-500' :
                          table.status === 'occupied' ? 'bg-red-500' :
                          table.status === 'reserved' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}
                      >
                        {table.status.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Guest Type Selection Modal */}
      {showGuestTypeModal && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
          <Card className="w-96 bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Select Guest Type</h3>
                <Button variant="ghost" onClick={() => setShowGuestTypeModal(false)}>✕</Button>
              </div>
              
              <div className="space-y-3">
                <Button
                  className="w-full h-16 flex items-center justify-center bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    const roomNumber = prompt("Enter room number:");
                    if (roomNumber) {
                      createGuest('room', undefined, roomNumber);
                    }
                  }}
                >
                  <div className="text-center">
                    <div className="font-bold">Charge to Room</div>
                    <div className="text-xs">Hotel guest room charge</div>
                  </div>
                </Button>
                
                <Button
                  className="w-full h-16 flex items-center justify-center bg-green-600 hover:bg-green-700"
                  onClick={() => createGuest('table', selectedTable || undefined)}
                >
                  <div className="text-center">
                    <div className="font-bold">Charge to Table</div>
                    <div className="text-xs">Restaurant table service</div>
                  </div>
                </Button>
                
                <Button
                  className="w-full h-16 flex items-center justify-center bg-purple-600 hover:bg-purple-700"
                  onClick={() => createGuest('standalone')}
                >
                  <div className="text-center">
                    <div className="font-bold">Standalone Guest</div>
                    <div className="text-xs">Walk-in customer</div>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Left Panel - Guest Orders */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gray-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">ORDERS</h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowTableView(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button size="sm" onClick={() => setShowGuestTypeModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Guest
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-300">
            SERVER: WAITER 1 • {selectedGuest ? 
              selectedGuest.guestType === 'room' ? `ROOM: ${selectedGuest.roomNumber}` :
              selectedGuest.guestType === 'table' ? `TABLE: ${selectedGuest.tableNumber}` :
              'STANDALONE'
              : 'NO GUEST SELECTED'}
          </div>
        </div>

        {/* Guest List */}
        <ScrollArea className="flex-1">
          {guests.map((guest, index) => (
            <div key={guest.id} className="border-b">
              <div 
                className={`p-3 cursor-pointer transition-colors ${
                  selectedGuestId === guest.id ? 'bg-teal-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedGuestId(guest.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 text-white rounded text-xs flex items-center justify-center font-bold ${
                      guest.guestType === 'room' ? 'bg-blue-500' :
                      guest.guestType === 'table' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}>
                      {guest.guestType === 'room' ? 'R' : guest.guestType === 'table' ? 'T' : 'S'}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{guest.name}</h3>
                      <p className="text-xs text-gray-500">
                        {guest.guestType === 'room' ? 'Room Service' :
                         guest.guestType === 'table' ? 'Table Service' :
                         'Walk-in'}
                      </p>
                    </div>
                  </div>
                  {guest.items.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {guest.items.length} items
                    </Badge>
                  )}
                </div>

                {/* Guest Items */}
                {guest.items.length > 0 && (
                  <div className="space-y-1 text-xs">
                    {guest.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center font-medium">{item.quantity}</span>
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateGuestItemQuantity(guest.id, item.id, 0);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedGuestId === guest.id && guest.items.length > 0 && (
                  <div className="mt-3 pt-2 border-t">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span>Subtotal:</span>
                      <span>${getGuestTotal(guest).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Right Panel - Categories and Items */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3">
              <div className="text-sm text-gray-600">SEARCH</div>
            </div>
            <Badge className="bg-teal-500">{selectedGuest?.name || 'SELECT GUEST'}</Badge>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-4 gap-4 h-full">
            {availableCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  className={`${category.color} text-white border-0 rounded-lg h-24 flex flex-col items-center justify-center text-lg font-bold shadow-lg transition-all duration-200 hover:scale-105`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <Icon className="h-8 w-8 mb-2" />
                  <span className="text-sm">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Items Display (Modal-like overlay when category selected) */}
        {activeCategory && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <Card className="w-4/5 h-4/5 bg-white">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    {availableCategories.find(c => c.id === activeCategory)?.name || activeCategory.toUpperCase()}
                  </h3>
                  <Button 
                    variant="ghost"
                    onClick={() => setActiveCategory("")}
                    className="text-gray-500"
                  >
                    ✕
                  </Button>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="grid grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                        onClick={() => {
                          addToGuestOrder(item);
                          setActiveCategory("");
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <h4 className="font-bold text-sm mb-2">{item.name}</h4>
                          <div className="text-lg font-bold text-green-600 mb-1">
                            ${item.price.toFixed(2)}
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {item.preparationTime}min
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </div>
        )}

        {/* Bottom Payment Section */}
        <div className="bg-white border-t p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">
              ${getGrandTotal().toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              TAX ${(getGrandTotal() * 0.085).toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col items-center bg-green-600 hover:bg-green-700">
              <CreditCard className="h-6 w-6 mb-1" />
              <span className="text-xs">CREDIT</span>
            </Button>
            <Button className="h-16 flex flex-col items-center bg-blue-600 hover:bg-blue-700">
              <DollarSign className="h-6 w-6 mb-1" />
              <span className="text-xs">CASH</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center">
              <Banknote className="h-6 w-6 mb-1" />
              <span className="text-xs">BANK TRANSFER</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center">
              <Receipt className="h-6 w-6 mb-1" />
              <span className="text-xs">NO RECEIPT</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPOS;