import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Menu, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  DollarSign,
  Star,
  TrendingUp,
  Settings,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMenuItems, MenuItem } from "@/hooks/useMenuItems";
import EditMenuItemModal from "@/components/menu/EditMenuItemModal";
import DeleteMenuItemModal from "@/components/menu/DeleteMenuItemModal";
import MenuSettingsModal from "@/components/menu/MenuSettingsModal";
import MenuTemplateModal from "@/components/menu/MenuTemplateModal";
import MenuExportModal from "@/components/menu/MenuExportModal";

const MenuManagement = () => {
  const { menuItems, setMenuItems } = useMenuItems();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleImportData = (importedItems: Partial<MenuItem>[]) => {
    const newItems = importedItems.map(item => ({
      id: item.id || `item-${Date.now()}-${Math.random()}`,
      name: item.name || "",
      price: item.price || 0,
      description: item.description || "",
      category: item.category || "Main Course",
      preparationTime: item.preparationTime || 15,
      calories: item.calories,
      isPopular: Boolean(item.isPopular),
      isAvailable: item.isAvailable !== false,
      allergens: item.allergens || [],
      ingredients: item.ingredients || []
    })) as MenuItem[];

    setMenuItems([...menuItems, ...newItems]);
  };

  const categories = [
    "Appetizers", "Main Course", "Desserts", "Salads", "Soups", "Sides",
    "Red Wine", "White Wine", "Rosé Wine", "Sparkling Wine", "Cocktails", 
    "Spirits", "Beer", "Non-Alcoholic Beverages", "Hot Beverages"
  ];

  const allergens = [
    "Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish"
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const MenuItemCard = ({ item }: { item: MenuItem }) => (
    <Card className={`card-luxury ${!item.isAvailable ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              {item.isPopular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              {!item.isAvailable && <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </div>
            <CardDescription className="mt-1">{item.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedItem(item);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedItem(item);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-accent">
              ${item.price.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{item.category}</Badge>
              <Badge variant={item.isAvailable ? "default" : "secondary"}>
                {item.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Prep Time:</span> {item.preparationTime}min
            </div>
            {item.calories && (
              <div>
                <span className="font-medium">Calories:</span> {item.calories}
              </div>
            )}
          </div>

          {item.allergens.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Allergens</h4>
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((allergen) => (
                  <Badge key={allergen} variant="outline" className="text-xs">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Main Ingredients</h4>
            <div className="flex flex-wrap gap-1">
              {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
              {item.ingredients.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.ingredients.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Menu className="h-8 w-8 text-accent" />
            Menu Management
          </h1>
          <p className="text-muted-foreground">Manage your restaurant menu items and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsSettingsDialogOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="button-luxury">
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>Create a new item for your restaurant menu</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="allergens">Allergens</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input placeholder="Enter item name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the menu item..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prep Time (min)</Label>
                    <Input type="number" placeholder="15" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Calories (optional)</Label>
                    <Input type="number" placeholder="350" />
                  </div>
                  <div className="space-y-2">
                    <Label>Serving Size</Label>
                    <Input placeholder="1 portion" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Main Ingredients</Label>
                  <Textarea placeholder="List main ingredients separated by commas..." />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="popular" />
                  <Label htmlFor="popular">Mark as Popular Item</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="available" defaultChecked />
                  <Label htmlFor="available">Available for Order</Label>
                </div>
              </TabsContent>

              <TabsContent value="allergens" className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Allergens</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {allergens.map((allergen) => (
                      <div key={allergen} className="flex items-center space-x-2">
                        <Switch id={allergen.toLowerCase()} />
                        <Label htmlFor={allergen.toLowerCase()}>{allergen}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="button-luxury"
                onClick={() => {
                  toast({
                    title: "Menu item saved",
                    description: "New menu item has been added successfully."
                  });
                  setIsAddDialogOpen(false);
                }}
              >
                Save Menu Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Menu className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{menuItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{menuItems.filter(i => i.isAvailable).length}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{menuItems.filter(i => i.isPopular).length}</p>
                <p className="text-sm text-muted-foreground">Popular Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  ${menuItems.length > 0 ? (menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-muted-foreground">Avg Price</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Menu className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No menu items found</h3>
          <p className="text-muted-foreground">Try adjusting your search or add a new menu item</p>
        </div>
      )}

      {/* Modals */}
      <EditMenuItemModal 
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
      
      <DeleteMenuItemModal 
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
      
      <MenuSettingsModal 
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      />
      
      <MenuTemplateModal 
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onImportData={handleImportData}
      />
      
      <MenuExportModal 
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        menuItems={menuItems}
      />
    </div>
  );
};

export default MenuManagement;