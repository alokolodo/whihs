import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from 'xlsx';
import { MenuItem } from "@/hooks/useMenuItems";

interface MenuTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (items: Partial<MenuItem>[]) => void;
}

const MenuTemplateModal = ({ isOpen, onClose, onImportData }: MenuTemplateModalProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState<Partial<MenuItem>[]>([]);

  const downloadTemplate = () => {
    const templateData = [
      {
        name: "Grilled Salmon",
        price: 24.99,
        description: "Fresh Atlantic salmon grilled to perfection with herbs",
        category: "Main Course",
        preparationTime: 25,
        calories: 350,
        isPopular: "Yes",
        isAvailable: "Yes",
        allergens: "Fish",
        ingredients: "Salmon, Herbs, Lemon, Olive Oil"
      },
      {
        name: "Caesar Salad",
        price: 12.99,
        description: "Crisp romaine lettuce with caesar dressing and croutons",
        category: "Salads",
        preparationTime: 10,
        calories: 180,
        isPopular: "No",
        isAvailable: "Yes",
        allergens: "Dairy, Gluten",
        ingredients: "Romaine Lettuce, Caesar Dressing, Croutons, Parmesan"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu Items");

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // name
      { wch: 10 }, // price
      { wch: 40 }, // description
      { wch: 15 }, // category
      { wch: 15 }, // preparationTime
      { wch: 10 }, // calories
      { wch: 12 }, // isPopular
      { wch: 12 }, // isAvailable
      { wch: 20 }, // allergens
      { wch: 30 }  // ingredients
    ];

    XLSX.writeFile(wb, 'menu_template.xlsx');
    
    toast({
      title: "Template downloaded",
      description: "Menu template has been downloaded successfully."
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const processedData: Partial<MenuItem>[] = jsonData.map((row, index) => ({
          id: `imported-${Date.now()}-${index}`,
          name: row.name || "",
          price: parseFloat(row.price) || 0,
          description: row.description || "",
          category: row.category || "Main Course",
          preparationTime: parseInt(row.preparationTime) || 15,
          calories: row.calories ? parseInt(row.calories) : undefined,
          isPopular: row.isPopular === "Yes" || row.isPopular === true,
          isAvailable: row.isAvailable !== "No" && row.isAvailable !== false,
          allergens: row.allergens ? row.allergens.split(',').map((a: string) => a.trim()) : [],
          ingredients: row.ingredients ? row.ingredients.split(',').map((i: string) => i.trim()) : []
        }));

        setUploadedData(processedData);
        
        toast({
          title: "File processed",
          description: `Found ${processedData.length} menu items in the uploaded file.`
        });
      } catch (error) {
        toast({
          title: "Error processing file",
          description: "Please make sure the file format is correct.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (uploadedData.length > 0) {
      onImportData(uploadedData);
      toast({
        title: "Menu items imported",
        description: `Successfully imported ${uploadedData.length} menu items.`
      });
      setUploadedData([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-accent" />
            Menu Template Manager
          </DialogTitle>
          <DialogDescription>
            Download a template or upload menu items from an Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5" />
                Download Template
              </CardTitle>
              <CardDescription>
                Download an Excel template with sample menu items and correct formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download XLSX Template
              </Button>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5" />
                Upload Menu Items
              </CardTitle>
              <CardDescription>
                Upload a completed Excel file to import menu items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menu-upload">Select Excel File</Label>
                <Input
                  id="menu-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make sure your Excel file has the following columns: name, price, description, category, 
                  preparationTime, calories, isPopular, isAvailable, allergens, ingredients
                </AlertDescription>
              </Alert>

              {uploadedData.length > 0 && (
                <div className="space-y-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <h4 className="font-medium">Preview of imported data:</h4>
                    <p className="text-sm text-muted-foreground">
                      {uploadedData.length} menu items ready to import
                    </p>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {uploadedData.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-sm">
                          • {item.name} - ${item.price} ({item.category})
                        </div>
                      ))}
                      {uploadedData.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          ...and {uploadedData.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button onClick={handleImport} className="w-full">
                    Import {uploadedData.length} Menu Items
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuTemplateModal;