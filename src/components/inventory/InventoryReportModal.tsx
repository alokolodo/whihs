import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Calendar } from "lucide-react";
import * as XLSX from 'xlsx';

interface InventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryData?: any[];
}

const InventoryReportModal = ({ isOpen, onClose, inventoryData = [] }: InventoryReportModalProps) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("full");
  const [format, setFormat] = useState("xlsx");
  const [dateRange, setDateRange] = useState("current");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [includeFields, setIncludeFields] = useState({
    stock: true,
    pricing: true,
    supplier: true,
    dates: true,
    location: true
  });

  const categories = [
    { id: 'food', label: 'Food Items' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'housekeeping', label: 'Housekeeping' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'office', label: 'Office Supplies' },
    { id: 'amenities', label: 'Guest Amenities' }
  ];

  const reportTypes = [
    { value: 'full', label: 'Full Inventory Report' },
    { value: 'low-stock', label: 'Low Stock Items' },
    { value: 'out-of-stock', label: 'Out of Stock Items' },
    { value: 'high-value', label: 'High Value Items' },
    { value: 'category', label: 'Category Summary' },
    { value: 'supplier', label: 'Supplier Report' }
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, categoryId]
        : prev.filter(id => id !== categoryId)
    );
  };

  const handleFieldChange = (field: keyof typeof includeFields, checked: boolean) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const generateReport = () => {
    // Mock inventory data for demonstration
    const mockInventoryData = [
      {
        item_name: "Premium Coffee Beans",
        category: "food",
        current_quantity: 25,
        min_threshold: 10,
        max_threshold: 100,
        unit: "kg",
        cost_per_unit: 45.00,
        total_value: 1125.00,
        supplier: "Global Coffee Co.",
        last_restocked: "2024-01-10",
        location: "Kitchen Storage A"
      },
      {
        item_name: "Fresh Towels",
        category: "housekeeping",
        current_quantity: 150,
        min_threshold: 50,
        max_threshold: 300,
        unit: "pieces",
        cost_per_unit: 12.50,
        total_value: 1875.00,
        supplier: "Linen Supply Ltd.",
        last_restocked: "2024-01-08",
        location: "Housekeeping Store"
      },
      {
        item_name: "Red Wine",
        category: "beverages",
        current_quantity: 48,
        min_threshold: 24,
        max_threshold: 120,
        unit: "bottles",
        cost_per_unit: 35.00,
        total_value: 1680.00,
        supplier: "Fine Wine Imports",
        last_restocked: "2024-01-12",
        location: "Bar Storage"
      }
    ];

    let filteredData = [...mockInventoryData];

    // Apply category filter
    if (selectedCategories.length > 0) {
      filteredData = filteredData.filter(item => 
        selectedCategories.includes(item.category)
      );
    }

    // Apply report type filter
    switch (reportType) {
      case 'low-stock':
        filteredData = filteredData.filter(item => 
          item.current_quantity <= item.min_threshold
        );
        break;
      case 'out-of-stock':
        filteredData = filteredData.filter(item => 
          item.current_quantity === 0
        );
        break;
      case 'high-value':
        filteredData = filteredData.filter(item => 
          item.total_value >= 1000
        );
        break;
    }

    // Prepare data based on selected fields
    const reportData = filteredData.map(item => {
      const row: any = {
        'Item Name': item.item_name,
        'Category': item.category
      };

      if (includeFields.stock) {
        row['Current Stock'] = item.current_quantity;
        row['Unit'] = item.unit;
        row['Min Threshold'] = item.min_threshold;
        row['Max Threshold'] = item.max_threshold;
      }

      if (includeFields.pricing) {
        row['Cost per Unit'] = item.cost_per_unit;
        row['Total Value'] = item.total_value;
      }

      if (includeFields.supplier) {
        row['Supplier'] = item.supplier;
      }

      if (includeFields.dates) {
        row['Last Restocked'] = item.last_restocked;
      }

      if (includeFields.location) {
        row['Location'] = item.location;
      }

      return row;
    });

    if (reportData.length === 0) {
      toast({
        title: "No Data Found",
        description: "No inventory items match the selected criteria.",
        variant: "destructive"
      });
      return;
    }

    // Generate file based on format
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `inventory_report_${reportType}_${timestamp}`;

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      
      // Auto-size columns
      const cols = Object.keys(reportData[0] || {}).map(() => ({ width: 20 }));
      ws['!cols'] = cols;

      XLSX.utils.book_append_sheet(wb, ws, "Inventory Report");
      
      // Create a download link that allows user to choose save location
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    }

    toast({
      title: "Report Generated",
      description: `${reportData.length} items exported successfully. Choose your preferred folder to save it.`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Inventory Report
          </DialogTitle>
          <DialogDescription>
            Create detailed inventory reports with custom filters and export options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format and Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Stock</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <Label>Categories (leave empty for all)</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={category.id} className="text-sm">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Fields to Include */}
          <div className="space-y-3">
            <Label>Include in Report</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                stock: 'Stock Information',
                pricing: 'Pricing & Values',
                supplier: 'Supplier Details',
                dates: 'Date Information',
                location: 'Location Data'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={includeFields[key as keyof typeof includeFields]}
                    onCheckedChange={(checked) => 
                      handleFieldChange(key as keyof typeof includeFields, checked as boolean)
                    }
                  />
                  <Label htmlFor={key} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryReportModal;