import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddInventoryItemModal from "@/components/inventory/AddInventoryItemModal";
import EditInventoryItemModal from "@/components/inventory/EditInventoryItemModal";
import IssueInventoryModal from "@/components/inventory/IssueInventoryModal";
import RestockModal from "@/components/inventory/RestockModal";
import InventoryTemplateModal from "@/components/inventory/InventoryTemplateModal";
import POSConnectionModal from "@/components/inventory/POSConnectionModal";
import InventoryReportModal from "@/components/inventory/InventoryReportModal";
import SupplierIntegrationModal from "@/components/inventory/SupplierIntegrationModal";
import LowStockNotificationSystem from "@/components/inventory/LowStockNotificationSystem";
import InventoryActionButtons from "@/components/inventory/InventoryActionButtons";
import InventoryAnalyticsDashboard from "@/components/inventory/InventoryAnalyticsDashboard";
import {
  Package,
  Search,
  Plus,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  Users,
  Utensils,
  ClipboardList,
  BarChart3,
  Download,
  Upload,
  FileText,
  Settings,
  Edit,
  Package2,
  Truck,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: 'food' | 'beverages' | 'housekeeping' | 'maintenance' | 'office';
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  location: string;
}

interface IssuanceRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  department: 'kitchen' | 'housekeeping' | 'maintenance' | 'frontdesk';
  requestedBy: string;
  issuedAt: string;
  purpose: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface POSConnection {
  itemId: string;
  menuItemId: string;
  quantityUsed: number;
  lastSync: string;
}

const InventoryManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole] = useState<'admin' | 'storekeeper' | 'manager' | 'staff'>('admin'); // This would come from auth context
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Initialize with mock data and fetch from Supabase
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert database format to component format
      const formattedData = data?.map(item => ({
        id: item.id,
        name: item.item_name,
        category: item.category as 'food' | 'beverages' | 'housekeeping' | 'maintenance' | 'office',
        currentStock: item.current_quantity,
        minimumStock: item.min_threshold,
        unit: item.unit,
        unitPrice: item.cost_per_unit,
        supplier: item.supplier || '',
        lastRestocked: item.last_restocked || new Date().toISOString().split('T')[0],
        location: `Storage ${item.category}` // Mock location based on category
      })) || [];

      setInventory(formattedData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      // Fallback to mock data
      setInventory([
    {
      id: "INV001",
      name: "Premium Coffee Beans",
      category: 'food',
      currentStock: 25,
      minimumStock: 10,
      unit: 'kg',
      unitPrice: 45.00,
      supplier: "Global Coffee Co.",
      lastRestocked: "2024-01-10",
      expiryDate: "2024-06-15",
      location: "Kitchen Storage A"
    },
    {
      id: "INV002", 
      name: "Fresh Towels",
      category: 'housekeeping',
      currentStock: 150,
      minimumStock: 50,
      unit: 'pieces',
      unitPrice: 12.50,
      supplier: "Linen Supply Ltd.",
      lastRestocked: "2024-01-08",
      location: "Housekeeping Store"
    },
    {
      id: "INV003",
      name: "Toilet Paper",
      category: 'housekeeping',
      currentStock: 8,
      minimumStock: 20,
      unit: 'rolls',
      unitPrice: 2.50,
      supplier: "Hygiene Solutions",
      lastRestocked: "2024-01-05",
      location: "Housekeeping Store B"
    },
    {
      id: "INV004",
      name: "Red Wine",
      category: 'beverages',
      currentStock: 48,
      minimumStock: 24,
      unit: 'bottles',
      unitPrice: 35.00,
      supplier: "Fine Wine Imports",
      lastRestocked: "2024-01-12",
      expiryDate: "2026-12-31",
      location: "Bar Storage"
    }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async (items: any[]) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .insert(items);

      if (error) throw error;

      toast({
        title: "Items Imported",
        description: `${items.length} inventory items imported successfully.`,
      });

      fetchInventory(); // Refresh the list
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [issuances] = useState<IssuanceRecord[]>([
    {
      id: "ISS001",
      itemId: "INV001",
      itemName: "Premium Coffee Beans",
      quantity: 5,
      department: 'kitchen',
      requestedBy: "Chef Martinez",
      issuedAt: "2024-01-15 08:30",
      purpose: "Morning coffee service",
      status: 'approved'
    },
    {
      id: "ISS002",
      itemId: "INV002", 
      itemName: "Fresh Towels",
      quantity: 25,
      department: 'housekeeping',
      requestedBy: "Maria Santos",
      issuedAt: "2024-01-15 09:15",
      purpose: "Daily room service",
      status: 'approved'
    },
    {
      id: "ISS003",
      itemId: "INV003",
      itemName: "Toilet Paper",
      quantity: 10,
      department: 'housekeeping',
      requestedBy: "James Wilson",
      issuedAt: "2024-01-15 10:00",
      purpose: "Restocking guest rooms",
      status: 'pending'
    }
  ]);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      food: 'bg-green-500 text-white',
      beverages: 'bg-blue-500 text-white',
      housekeeping: 'bg-purple-500 text-white',
      maintenance: 'bg-orange-500 text-white',
      office: 'bg-gray-500 text-white'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { status: 'out-of-stock', color: 'bg-destructive text-destructive-foreground', label: 'Out of Stock' };
    if (current <= minimum) return { status: 'low-stock', color: 'bg-warning text-warning-foreground', label: 'Low Stock' };
    if (current <= minimum * 1.5) return { status: 'reorder', color: 'bg-orange-500 text-white', label: 'Reorder Soon' };
    return { status: 'in-stock', color: 'bg-success text-success-foreground', label: 'In Stock' };
  };

  const getDepartmentIcon = (dept: string) => {
    const icons = {
      kitchen: Utensils,
      housekeeping: Users,
      maintenance: Package,
      frontdesk: ClipboardList
    };
    return icons[dept as keyof typeof icons] || Package;
  };

  const getInventoryStats = () => {
    const total = inventory.length;
    const lowStock = inventory.filter(item => item.currentStock <= item.minimumStock).length;
    const outOfStock = inventory.filter(item => item.currentStock === 0).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

    return { total, lowStock, outOfStock, totalValue };
  };

  const stats = getInventoryStats();

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleIssueItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowIssueModal(true);
  };

  const handleRestockItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowRestockModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels and manage supply chain operations</p>
        </div>
        <InventoryActionButtons
          userRole={userRole}
          onAddItem={() => setShowAddModal(true)}
          onShowTemplate={() => setShowTemplateModal(true)}
          onShowReports={() => setShowReportModal(true)}
          onShowPOSIntegration={() => setShowPOSModal(true)}
          onShowSupplierIntegration={() => setShowSupplierModal(true)}
        />
      </div>

      {/* Low Stock Notification System */}
      <LowStockNotificationSystem
        userRole={userRole}
        onRestockRequest={(itemId) => {
          const item = inventory.find(i => i.id === itemId);
          if (item) {
            setSelectedItem(item);
            setShowRestockModal(true);
          }
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="issuances">Issuances</TabsTrigger>
          <TabsTrigger value="pos-sync">POS Integration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
              
              return (
                <Card key={item.id} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{item.name}</h3>
                          <p className="text-muted-foreground">ID: {item.id} • {item.supplier}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.toUpperCase()}
                        </Badge>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Stock Information</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Stock</span>
                            <span className="font-bold">{item.currentStock} {item.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Minimum Stock</span>
                            <span>{item.minimumStock} {item.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Unit Price</span>
                            <span>${item.unitPrice}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Location & Dates</h4>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <p className="font-medium">{item.location}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Last Restocked:</span>
                            <p>{item.lastRestocked}</p>
                          </div>
                          {item.expiryDate && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Expiry:</span>
                              <p>{item.expiryDate}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Value Information</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Value</span>
                            <span className="font-bold">${(item.currentStock * item.unitPrice).toFixed(2)}</span>
                          </div>
                          {item.currentStock <= item.minimumStock && (
                            <div className="text-warning flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Needs Restock</span>
                            </div>
                          )}
                        </div>
                      </div>

                        <div className="space-y-2">
                        <h4 className="font-semibold">Actions</h4>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleIssueItem(item)}
                          >
                            <Package2 className="h-4 w-4 mr-2" />
                            Issue Items
                          </Button>
                          {item.currentStock <= item.minimumStock && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRestockItem(item)}
                            >
                              <TrendingDown className="h-4 w-4 mr-2" />
                              Restock
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Item
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="issuances" className="space-y-6">
          <div className="grid gap-4">
            {issuances.map((issuance) => {
              const DeptIcon = getDepartmentIcon(issuance.department);
              
              return (
                <Card key={issuance.id} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                          <DeptIcon className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{issuance.itemName}</h3>
                          <p className="text-muted-foreground">Requested by {issuance.requestedBy}</p>
                        </div>
                      </div>
                      <Badge className={issuance.status === 'approved' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                        {issuance.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-bold text-lg">{issuance.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium capitalize">{issuance.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Issued At</p>
                        <p className="font-medium">{issuance.issuedAt}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Purpose</p>
                        <p className="font-medium">{issuance.purpose}</p>
                      </div>
                    </div>

                    {issuance.status === 'pending' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button 
                          size="sm" 
                          onClick={() => toast({
                            title: "Request Approved",
                            description: "Issuance request has been approved.",
                          })}
                        >
                          Approve
                        </Button>
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pos-sync" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Hotel Services Integration</CardTitle>
              <CardDescription>
                Automatic inventory deduction based on service sales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Connected Items</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Premium Coffee Beans</p>
                        <p className="text-sm text-muted-foreground">Connected to: Espresso, Cappuccino</p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Red Wine</p>
                        <p className="text-sm text-muted-foreground">Connected to: House Red Wine</p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Deductions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div>
                        <p className="font-medium">Coffee Beans</p>
                        <p className="text-sm text-muted-foreground">2 drinks sold • -0.1kg</p>
                      </div>
                      <span className="text-sm text-muted-foreground">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div>
                        <p className="font-medium">Red Wine</p>
                        <p className="text-sm text-muted-foreground">1 glass sold • -1 bottle</p>
                      </div>
                      <span className="text-sm text-muted-foreground">4h ago</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="button-luxury">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Configure POS Connections
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <InventoryAnalyticsDashboard />
        </TabsContent>
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Across all categories
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground">
                  Need immediate attention
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
                <p className="text-xs text-muted-foreground">
                  Requires urgent restock
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Current inventory value
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Inventory Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Most Issued Item</span>
                  <span className="font-bold">Fresh Towels (150 units this week)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fastest Moving Category</span>
                  <span className="font-bold">Housekeeping Supplies</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Restock Frequency</span>
                  <span className="font-bold">7 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Items Expiring Soon</span>
                  <span className="font-bold text-warning">2 items (next 30 days)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* All Modal Components */}
      <AddInventoryItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onItemAdded={fetchInventory}
      />

      <EditInventoryItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={selectedItem}
        onItemUpdated={fetchInventory}
      />

      <IssueInventoryModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        item={selectedItem}
        onItemIssued={fetchInventory}
      />

      <RestockModal
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
        item={selectedItem}
        onItemRestocked={fetchInventory}
      />

      <InventoryTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onImportData={handleImportData}
      />

      <POSConnectionModal
        isOpen={showPOSModal}
        onClose={() => setShowPOSModal(false)}
      />

      <InventoryReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        inventoryData={inventory}
      />

      <SupplierIntegrationModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        mode="inventory"
      />
    </div>
  );
};

export default InventoryManagement;