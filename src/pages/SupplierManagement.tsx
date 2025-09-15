import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Truck,
  Search,
  Plus,
  Edit,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Package,
  Building,
  Star,
  AlertTriangle
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  payment_terms: string;
  tax_id: string;
  total_orders: number;
  total_amount: number;
  last_order_date: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

interface SupplierOrder {
  id: string;
  supplier_id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'delivered' | 'cancelled';
  order_date: string;
  delivery_date?: string;
  items: string[];
}

const SupplierManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suppliers");
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setSuppliers([
      {
        id: "SUP001",
        name: "Global Coffee Co.",
        contact_person: "Maria Rodriguez",
        email: "orders@globalcoffee.com",
        phone: "+1-555-0123",
        address: "123 Coffee Street, Bean City, BC 12345",
        category: "Food & Beverages",
        rating: 4.8,
        payment_terms: "Net 30",
        tax_id: "TAX123456789",
        total_orders: 24,
        total_amount: 12450.00,
        last_order_date: "2024-01-12",
        status: 'active',
        created_at: "2023-06-15"
      },
      {
        id: "SUP002", 
        name: "Linen Supply Ltd.",
        contact_person: "James Wilson",
        email: "sales@linensupply.com",
        phone: "+1-555-0456",
        address: "456 Textile Ave, Fabric Town, FT 67890",
        category: "Housekeeping",
        rating: 4.5,
        payment_terms: "Net 15",
        tax_id: "TAX987654321",
        total_orders: 18,
        total_amount: 8920.00,
        last_order_date: "2024-01-10",
        status: 'active',
        created_at: "2023-08-20"
      },
      {
        id: "SUP003",
        name: "Fine Wine Imports",
        contact_person: "Sophie Chen",
        email: "info@finewineimports.com", 
        phone: "+1-555-0789",
        address: "789 Vineyard Road, Wine Valley, WV 13579",
        category: "Beverages",
        rating: 4.9,
        payment_terms: "Net 45",
        tax_id: "TAX456789123",
        total_orders: 15,
        total_amount: 18750.00,
        last_order_date: "2024-01-14",
        status: 'active',
        created_at: "2023-04-10"
      },
      {
        id: "SUP004",
        name: "Hygiene Solutions",
        contact_person: "Robert Brown",
        email: "orders@hygienesolutions.com",
        phone: "+1-555-0321",
        address: "321 Clean Street, Sanitary City, SC 24680",
        category: "Maintenance",
        rating: 4.2,
        payment_terms: "Net 30",
        tax_id: "TAX321654987",
        total_orders: 12,
        total_amount: 3450.00,
        last_order_date: "2024-01-08",
        status: 'active',
        created_at: "2023-09-05"
      }
    ]);

    setSupplierOrders([
      {
        id: "ORD001",
        supplier_id: "SUP001",
        order_number: "PO-2024-001",
        total_amount: 1250.00,
        status: 'delivered',
        order_date: "2024-01-10",
        delivery_date: "2024-01-12",
        items: ["Premium Coffee Beans", "Coffee Filters", "Sugar Sachets"]
      },
      {
        id: "ORD002",
        supplier_id: "SUP002", 
        order_number: "PO-2024-002",
        total_amount: 890.00,
        status: 'pending',
        order_date: "2024-01-14",
        items: ["Fresh Towels", "Bed Sheets", "Pillow Cases"]
      },
      {
        id: "ORD003",
        supplier_id: "SUP003",
        order_number: "PO-2024-003", 
        total_amount: 1680.00,
        status: 'delivered',
        order_date: "2024-01-12",
        delivery_date: "2024-01-14",
        items: ["Red Wine", "White Wine", "Champagne"]
      }
    ]);
  }, []);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-success text-success-foreground',
      inactive: 'bg-destructive text-destructive-foreground', 
      pending: 'bg-warning text-warning-foreground'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Food & Beverages': Package,
      'Housekeeping': Building,
      'Beverages': Package,
      'Maintenance': Truck
    };
    return icons[category as keyof typeof icons] || Package;
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supplier Management</h1>
          <p className="text-muted-foreground">Manage suppliers, orders and procurement relationships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            New Order
          </Button>
          <Button className="button-luxury">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="payments">Supplier Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers by name, category, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredSuppliers.map((supplier) => {
              const CategoryIcon = getCategoryIcon(supplier.category);
              
              return (
                <Card key={supplier.id} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <CategoryIcon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{supplier.name}</h3>
                          <p className="text-muted-foreground">Contact: {supplier.contact_person}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(supplier.status)}>
                          {supplier.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {supplier.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Business Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Rating</span>
                            <div className="flex gap-1">
                              {getRatingStars(supplier.rating)}
                              <span className="ml-1 text-sm">{supplier.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Payment Terms</span>
                            <span className="text-sm font-medium">{supplier.payment_terms}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tax ID</span>
                            <span className="text-sm font-medium">{supplier.tax_id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Order Statistics</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Orders</span>
                            <span className="text-sm font-bold">{supplier.total_orders}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                            <span className="text-sm font-bold">${supplier.total_amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last Order</span>
                            <span className="text-sm">{supplier.last_order_date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Actions</h4>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Supplier
                          </Button>
                          <Button variant="outline" size="sm">
                            <Package className="h-4 w-4 mr-2" />
                            New Order
                          </Button>
                          <Button variant="outline" size="sm">
                            <DollarSign className="h-4 w-4 mr-2" />
                            View Payments
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

        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-4">
            {supplierOrders.map((order) => {
              const supplier = suppliers.find(s => s.id === order.supplier_id);
              
              return (
                <Card key={order.id} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{order.order_number}</h3>
                        <p className="text-muted-foreground">
                          Supplier: {supplier?.name} • Order Date: {order.order_date}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Order Details</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount</span>
                            <span className="font-bold">${order.total_amount.toLocaleString()}</span>
                          </div>
                          {order.delivery_date && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Delivered</span>
                              <span>{order.delivery_date}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Items ({order.items.length})</h4>
                        <div className="space-y-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-sm">{item}</div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Order
                        </Button>
                        <Button variant="outline" size="sm">
                          <Package className="h-4 w-4 mr-2" />
                          Track Delivery
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Supplier Payment Overview</CardTitle>
              <CardDescription>Track payments to suppliers and outstanding amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payment Integration</h3>
                <p className="text-muted-foreground">
                  Supplier payments will be integrated with the main Payments Management system.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Suppliers</p>
                    <p className="text-2xl font-bold">{suppliers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                    <p className="text-2xl font-bold">{supplierOrders.filter(o => o.status === 'pending').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Procurement</p>
                    <p className="text-2xl font-bold">${suppliers.reduce((sum, s) => sum + s.total_amount, 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">
                      {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierManagement;