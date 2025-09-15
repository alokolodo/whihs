import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Link, Unlink, Package, Truck, DollarSign, Plus } from "lucide-react";

interface SupplierIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'inventory' | 'payment';
}

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  category: string;
  payment_terms: string;
  status: 'active' | 'inactive';
  total_orders: number;
  total_amount: number;
}

interface InventorySupplierLink {
  id: string;
  inventory_item: string;
  supplier_id: string;
  supplier_name: string;
  unit_cost: number;
  lead_time_days: number;
  minimum_order: number;
}

const SupplierIntegrationModal = ({ isOpen, onClose, mode }: SupplierIntegrationModalProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);

  const suppliers: Supplier[] = [
    {
      id: "SUP001",
      name: "Global Coffee Co.",
      contact_person: "Maria Rodriguez",
      email: "orders@globalcoffee.com",
      phone: "+1-555-0123",
      category: "Food & Beverages",
      payment_terms: "Net 30",
      status: 'active',
      total_orders: 24,
      total_amount: 12450.00
    },
    {
      id: "SUP002", 
      name: "Linen Supply Ltd.",
      contact_person: "James Wilson",
      email: "sales@linensupply.com",
      phone: "+1-555-0456",
      category: "Housekeeping",
      payment_terms: "Net 15",
      status: 'active',
      total_orders: 18,
      total_amount: 8920.00
    },
    {
      id: "SUP003",
      name: "Fine Wine Imports",
      contact_person: "Sophie Chen",
      email: "info@finewineimports.com", 
      phone: "+1-555-0789",
      category: "Beverages",
      payment_terms: "Net 45",
      status: 'active',
      total_orders: 15,
      total_amount: 18750.00
    }
  ];

  const [inventoryLinks] = useState<InventorySupplierLink[]>([
    {
      id: "LINK001",
      inventory_item: "Premium Coffee Beans",
      supplier_id: "SUP001",
      supplier_name: "Global Coffee Co.",
      unit_cost: 45.00,
      lead_time_days: 7,
      minimum_order: 10
    },
    {
      id: "LINK002",
      inventory_item: "Fresh Towels",
      supplier_id: "SUP002",
      supplier_name: "Linen Supply Ltd.",
      unit_cost: 12.50,
      lead_time_days: 3,
      minimum_order: 50
    }
  ]);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLinkSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowLinkForm(true);
  };

  const handleSaveLinkage = () => {
    if (selectedSupplier) {
      toast({
        title: "Supplier Linked",
        description: `${selectedSupplier.name} has been linked successfully.`,
      });
      setShowLinkForm(false);
      setSelectedSupplier(null);
    }
  };

  const handleUnlink = (linkId: string, itemName: string, supplierName: string) => {
    toast({
      title: "Supplier Unlinked",
      description: `${supplierName} has been unlinked from ${itemName}.`,
      variant: "destructive"
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {mode === 'inventory' ? 'Inventory' : 'Payment'} Supplier Integration
          </DialogTitle>
          <DialogDescription>
            {mode === 'inventory' 
              ? 'Link suppliers to inventory items for automated procurement and stock management.'
              : 'Connect suppliers to payment systems for automated invoice processing and payments.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {mode === 'inventory' && (
            <>
              {/* Current Inventory Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Inventory Suppliers</CardTitle>
                  <CardDescription>Currently linked suppliers for inventory items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-32 overflow-y-auto">
                    {inventoryLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-medium">{link.inventory_item}</span>
                          </div>
                          <Link className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-accent" />
                            <span className="font-medium">{link.supplier_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">${link.unit_cost}</Badge>
                          <Badge variant="outline">{link.lead_time_days} days</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUnlink(link.id, link.inventory_item, link.supplier_name)}
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Supplier List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Suppliers</CardTitle>
              <CardDescription>Select suppliers to link with {mode === 'inventory' ? 'inventory items' : 'payment system'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{supplier.name}</h4>
                        <Badge className={getStatusColor(supplier.status)}>
                          {supplier.status}
                        </Badge>
                        <Badge variant="outline">{supplier.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>Contact: {supplier.contact_person}</div>
                        <div>Email: {supplier.email}</div>
                        <div>Payment Terms: {supplier.payment_terms}</div>
                        <div>Total Orders: {supplier.total_orders}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleLinkSupplier(supplier)}
                        className="min-w-[100px]"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Link
                      </Button>
                      {mode === 'payment' && (
                        <Button variant="outline" size="sm" className="min-w-[100px]">
                          <DollarSign className="h-4 w-4 mr-1" />
                          View Payments
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Link Form */}
          {showLinkForm && selectedSupplier && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Link Supplier: {selectedSupplier.name}</CardTitle>
                <CardDescription>Configure linkage settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'inventory' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unitCost">Unit Cost ($)</Label>
                      <Input
                        id="unitCost"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter unit cost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leadTime">Lead Time (Days)</Label>
                      <Input
                        id="leadTime"
                        type="number"
                        min="1"
                        placeholder="Enter lead time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minOrder">Minimum Order Quantity</Label>
                      <Input
                        id="minOrder"
                        type="number"
                        min="1"
                        placeholder="Enter minimum order"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level</Label>
                      <Input
                        id="priority"
                        placeholder="Primary/Secondary/Backup"
                      />
                    </div>
                  </div>
                )}
                
                {mode === 'payment' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Default Payment Method</Label>
                      <Input
                        id="paymentMethod"
                        placeholder="Bank Transfer/Check/Card"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="approvalLimit">Auto-Approval Limit ($)</Label>
                      <Input
                        id="approvalLimit"
                        type="number"
                        min="0"
                        placeholder="Enter approval limit"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveLinkage}>
                    Save Linkage
                  </Button>
                  <Button variant="outline" onClick={() => setShowLinkForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integration Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Integration Benefits</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {mode === 'inventory' ? (
                <>
                  <p>• Automated reorder notifications when stock is low</p>
                  <p>• Direct supplier communication for purchase orders</p>
                  <p>• Cost tracking and comparison across suppliers</p>
                  <p>• Lead time management for better stock planning</p>
                </>
              ) : (
                <>
                  <p>• Automated invoice processing and approval workflows</p>
                  <p>• Payment scheduling based on supplier terms</p>
                  <p>• Spend tracking and budget management</p>
                  <p>• Compliance with payment policies and limits</p>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierIntegrationModal;