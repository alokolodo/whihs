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
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  cost: number;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: { name: string; quantity: number; unit: string; cost: number }[];
  instructions: string[];
  image?: string;
}

const RecipeManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const categories = [
    "Appetizers", "Main Course", "Desserts", "Beverages", "Salads", "Soups", "Sides"
  ];

  const mockRecipes: Recipe[] = [
    {
      id: "1",
      name: "Grilled Salmon with Herbs",
      description: "Fresh Atlantic salmon grilled to perfection with herb seasoning",
      category: "Main Course",
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      cost: 18.50,
      difficulty: "Medium",
      ingredients: [
        { name: "Salmon Fillet", quantity: 4, unit: "pieces", cost: 12.00 },
        { name: "Fresh Herbs", quantity: 2, unit: "tbsp", cost: 1.50 },
        { name: "Olive Oil", quantity: 3, unit: "tbsp", cost: 1.00 },
        { name: "Lemon", quantity: 1, unit: "piece", cost: 0.50 },
        { name: "Salt & Pepper", quantity: 1, unit: "tsp", cost: 0.10 }
      ],
      instructions: [
        "Preheat grill to medium-high heat",
        "Season salmon with herbs, salt, and pepper",
        "Brush with olive oil",
        "Grill for 6-8 minutes per side",
        "Serve with lemon wedges"
      ]
    },
    {
      id: "2",
      name: "Caesar Salad",
      description: "Classic Caesar salad with homemade dressing and croutons",
      category: "Salads",
      prepTime: 20,
      cookTime: 0,
      servings: 6,
      cost: 8.75,
      difficulty: "Easy",
      ingredients: [
        { name: "Romaine Lettuce", quantity: 2, unit: "heads", cost: 3.00 },
        { name: "Parmesan Cheese", quantity: 100, unit: "g", cost: 2.50 },
        { name: "Croutons", quantity: 1, unit: "cup", cost: 1.25 },
        { name: "Caesar Dressing", quantity: 0.5, unit: "cup", cost: 2.00 }
      ],
      instructions: [
        "Wash and chop romaine lettuce",
        "Toss with Caesar dressing",
        "Add croutons and parmesan",
        "Serve immediately"
      ]
    }
  ];

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Card className="card-luxury">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{recipe.name}</CardTitle>
            <CardDescription className="mt-1">{recipe.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{recipe.category}</Badge>
            <Badge variant="outline" className="text-green-600">
              <DollarSign className="h-3 w-3 mr-1" />
              ${recipe.cost.toFixed(2)}
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {recipe.prepTime + recipe.cookTime}min
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {recipe.servings} servings
            </Badge>
            <Badge variant={recipe.difficulty === "Easy" ? "default" : recipe.difficulty === "Medium" ? "secondary" : "destructive"}>
              {recipe.difficulty}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Prep Time:</span> {recipe.prepTime}min
            </div>
            <div>
              <span className="font-medium">Cook Time:</span> {recipe.cookTime}min
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Ingredients ({recipe.ingredients.length})</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                <div key={idx}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </div>
              ))}
              {recipe.ingredients.length > 4 && (
                <div className="text-accent">+{recipe.ingredients.length - 4} more...</div>
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
            <ChefHat className="h-8 w-8 text-accent" />
            Recipe Management
          </h1>
          <p className="text-muted-foreground">Manage your restaurant recipes and ingredient costs</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="button-luxury">
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Recipe</DialogTitle>
              <DialogDescription>Create a new recipe for your restaurant menu</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recipe Name</Label>
                  <Input placeholder="Enter recipe name" />
                </div>
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
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the recipe..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prep Time (min)</Label>
                  <Input type="number" placeholder="15" />
                </div>
                <div className="space-y-2">
                  <Label>Cook Time (min)</Label>
                  <Input type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label>Servings</Label>
                  <Input type="number" placeholder="4" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="button-luxury">
                  Save Recipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{mockRecipes.length}</p>
                <p className="text-sm text-muted-foreground">Total Recipes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">$13.63</p>
                <p className="text-sm text-muted-foreground">Avg Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">27</p>
                <p className="text-sm text-muted-foreground">Avg Time (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-muted-foreground">Try adjusting your search or add a new recipe</p>
        </div>
      )}
    </div>
  );
};

export default RecipeManagement;