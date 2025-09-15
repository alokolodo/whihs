import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddSupplierModal from "@/components/supplier/AddSupplierModal";
import EditSupplierModal from "@/components/supplier/EditSupplierModal";
import NewOrderModal from "@/components/supplier/NewOrderModal";
import OrderDetailsModal from "@/components/supplier/OrderDetailsModal";
import {
  Search,
  Plus,
  Edit,
  Phone,
  Mail,
  MapPin,
  Package,
  Building,
  Star
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

const SupplierManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showEditSupplier, setShowEditSupplier] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setSuppliers(data?.map(supplier => ({
        ...supplier,
        status: supplier.status as 'active' | 'inactive' | 'pending'
      })) || []);
      
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800', 
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Food & Beverages': Package,
      'Housekeeping': Building,
      'Beverages': Package,
      'Maintenance': Package,
      'Equipment': Package,
      'Office Supplies': Package
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
          <Button 
            variant="outline"
            onClick={() => setShowNewOrder(true)}
          >
            <Package className="h-4 w-4 mr-2" />
            New Order
          </Button>
          <Button 
            onClick={() => setShowAddSupplier(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

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

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading suppliers...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No suppliers found</p>
            </div>
          ) : (
            filteredSuppliers.map((supplier) => {
              const CategoryIcon = getCategoryIcon(supplier.category);
              
              return (
                <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <CategoryIcon className="h-6 w-6 text-blue-600" />
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
                            <span className="text-sm">{supplier.last_order_date || 'Never'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Actions</h4>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setShowEditSupplier(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Supplier
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedSupplierId(supplier.id);
                              setShowNewOrder(true);
                            }}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            New Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* All Modal Components */}
      <AddSupplierModal
        isOpen={showAddSupplier}
        onClose={() => setShowAddSupplier(false)}
        onSupplierAdded={fetchSuppliers}
      />

      <EditSupplierModal
        isOpen={showEditSupplier}
        onClose={() => {
          setShowEditSupplier(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        onSupplierUpdated={fetchSuppliers}
      />

      <NewOrderModal
        isOpen={showNewOrder}
        onClose={() => {
          setShowNewOrder(false);
          setSelectedSupplierId(null);
        }}
        selectedSupplierId={selectedSupplierId}
        onOrderCreated={() => {}}
      />

      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onOrderUpdated={() => {}}
      />
    </div>
  );
};

export default SupplierManagement;