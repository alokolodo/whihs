import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Download, 
  Upload, 
  BarChart3, 
  Settings, 
  FileText,
  Package2,
  Truck
} from "lucide-react";

interface InventoryActionButtonsProps {
  onAddItem: () => void;
  onShowTemplate: () => void;
  onShowReports: () => void;
  onShowPOSIntegration: () => void;
  onShowSupplierIntegration: () => void;
  userRole?: 'admin' | 'storekeeper' | 'manager' | 'staff';
}

const InventoryActionButtons = ({
  onAddItem,
  onShowTemplate,
  onShowReports,
  onShowPOSIntegration,
  onShowSupplierIntegration,
  userRole = 'staff'
}: InventoryActionButtonsProps) => {
  
  // Different permissions based on user role
  const canAddItems = userRole === 'admin' || userRole === 'storekeeper';
  const canViewReports = userRole === 'admin' || userRole === 'manager' || userRole === 'storekeeper';
  const canManageIntegrations = userRole === 'admin' || userRole === 'storekeeper';

  return (
    <div className="flex flex-wrap gap-2">
      {/* Add New Item - Admin/Storekeeper only */}
      {canAddItems && (
        <Button onClick={onAddItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      )}

      {/* Template & Import - Admin/Storekeeper only */}
      {canAddItems && (
        <Button variant="outline" onClick={onShowTemplate} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Template & Import
        </Button>
      )}

      {/* Reports - Admin/Manager/Storekeeper */}
      {canViewReports && (
        <Button variant="outline" onClick={onShowReports} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Reports
        </Button>
      )}

      {/* Analytics - Admin/Manager/Storekeeper */}
      {canViewReports && (
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
      )}

      {/* POS Integration - Admin/Storekeeper only */}
      {canManageIntegrations && (
        <Button variant="outline" onClick={onShowPOSIntegration} className="flex items-center gap-2">
          <Package2 className="h-4 w-4" />
          POS Integration
        </Button>
      )}

      {/* Supplier Integration - Admin/Storekeeper only */}
      {canManageIntegrations && (
        <Button variant="outline" onClick={onShowSupplierIntegration} className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Supplier Integration
        </Button>
      )}

      {/* Settings - Admin only */}
      {userRole === 'admin' && (
        <Button variant="ghost" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      )}
    </div>
  );
};

export default InventoryActionButtons;
