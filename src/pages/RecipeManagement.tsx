import { useState } from "react";
import { 
  ChefHat, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  DollarSign,
  BookOpen,
  TrendingUp,
  Percent
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AddRecipeModal from "@/components/recipe/AddRecipeModal";
import EditRecipeModal from "@/components/recipe/EditRecipeModal";
import DeleteRecipeModal from "@/components/recipe/DeleteRecipeModal";
import { useRecipesDB } from "@/hooks/useRecipesDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";

const RecipeManagement = () => {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipesDB();
  const { formatCurrency } = useGlobalSettings();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof recipes[0] | null>(null);

  const categories = [
    "Appetizers", "Main Course", "Desserts", "Beverages", "Salads", "Soups", "Sides"
  ];

  // Calculate profit for a recipe
  const calculateProfit = (recipe: typeof recipes[0]) => {
    const sellingPrice = (recipe as any).selling_price || 0;
    const cost = recipe.cost || 0;
    return sellingPrice - cost;
  };

  const calculateProfitMargin = (recipe: typeof recipes[0]) => {
    const sellingPrice = (recipe as any).selling_price || 0;
    if (sellingPrice === 0) return 0;
    const profit = calculateProfit(recipe);
    return (profit / sellingPrice) * 100;
  };

  // Handler functions
  const handleAddRecipe = async (newRecipe: any) => {
    try {
      await addRecipe(newRecipe);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  const handleEditRecipe = async (recipeData: any) => {
    if (selectedRecipe) {
      try {
        await updateRecipe(selectedRecipe.id, recipeData);
        setIsEditDialogOpen(false);
        setSelectedRecipe(null);
      } catch (error) {
        console.error("Error updating recipe:", error);
      }
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteRecipe(recipeId);
      setIsDeleteDialogOpen(false);
      setSelectedRecipe(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const openEditDialog = (recipe: typeof recipes[0]) => {
    setSelectedRecipe(recipe);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (recipe: typeof recipes[0]) => {
    setSelectedRecipe(recipe);
    setIsDeleteDialogOpen(true);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (recipe.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalProfit = recipes.reduce((sum, recipe) => sum + calculateProfit(recipe), 0);
  const avgCost = recipes.length > 0 ? recipes.reduce((sum, r) => sum + (r.cost || 0), 0) / recipes.length : 0;
  const avgTime = recipes.length > 0 ? recipes.reduce((sum, r) => sum + (r.prep_time + r.cook_time), 0) / recipes.length : 0;

  const RecipeCard = ({ recipe }: { recipe: typeof recipes[0] }) => {
    const profit = calculateProfit(recipe);
    const profitMargin = calculateProfitMargin(recipe);
    const profitPerServing = recipe.servings > 0 ? profit / recipe.servings : 0;
    const isProfitable = profit > 0;

    return (
      <Card className="card-luxury hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg truncate">{recipe.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2">
                {recipe.description}
              </CardDescription>
            </div>
            <div className="flex gap-1 sm:gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => openEditDialog(recipe)} className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => openDeleteDialog(recipe)} className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Badge variant="secondary" className="text-xs">{recipe.category}</Badge>
            <Badge variant="outline" className={`text-xs ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {isProfitable ? '+' : ''}{formatCurrency(profit)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Percent className="h-3 w-3 mr-1" />
              {profitMargin.toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {recipe.prep_time + recipe.cook_time}min
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Cost Price</p>
              <p className="font-semibold">{formatCurrency(recipe.cost)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Selling Price</p>
              <p className="font-semibold">{formatCurrency((recipe as any).selling_price || 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Profit/Serving</p>
              <p className={`font-semibold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profitPerServing)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Servings</p>
              <p className="font-semibold flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recipe.servings}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-xs sm:text-sm">Ingredients ({recipe.ingredients?.length || 0})</h4>
              <Badge variant={recipe.difficulty === "Easy" ? "default" : recipe.difficulty === "Medium" ? "secondary" : "destructive"} className="text-xs">
                {recipe.difficulty}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
              {(recipe.ingredients || []).slice(0, 4).map((ingredient: any, idx: number) => (
                <div key={idx} className="truncate">
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </div>
              ))}
              {(recipe.ingredients?.length || 0) > 4 && (
                <div className="text-accent">+{(recipe.ingredients?.length || 0) - 4} more...</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8 max-w-[100vw] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-accent shrink-0" />
            <span className="truncate">Recipe Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track recipes, costs, and profit margins
          </p>
        </div>
        <Button className="button-luxury shrink-0 w-full sm:w-auto" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card className="card-luxury">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-accent shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{recipes.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Recipes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(totalProfit)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(avgCost)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Avg Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{Math.round(avgTime)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Avg Time (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <ChefHat className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Try adjusting your search or add a new recipe</p>
        </div>
      )}

      {/* Modals */}
      <AddRecipeModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddRecipe}
      />

      <EditRecipeModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        recipe={selectedRecipe}
        onSave={handleEditRecipe}
      />

      <DeleteRecipeModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        recipe={selectedRecipe}
        onDelete={handleDeleteRecipe}
      />
    </div>
  );
};

export default RecipeManagement;