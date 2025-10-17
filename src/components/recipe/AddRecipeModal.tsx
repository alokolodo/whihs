import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  cost: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: { name: string; quantity: number; unit: string; cost: number }[];
  instructions: string[];
  image_url?: string;
  selling_price?: number;
  created_at: string;
  updated_at: string;
}

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) => void;
}

const categories = [
  "Appetizers", "Main Course", "Desserts", "Beverages", "Salads", "Soups", "Sides"
];

const AddRecipeModal = ({ isOpen, onClose, onAdd }: AddRecipeModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: "Medium" as 'Easy' | 'Medium' | 'Hard',
    image_url: "",
    selling_price: 0
  });

  const [ingredients, setIngredients] = useState([
    { name: "", quantity: 0, unit: "", cost: 0 }
  ]);

  const [instructions, setInstructions] = useState<string[]>([""]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      prep_time: 0,
      cook_time: 0,
      servings: 1,
      difficulty: "Medium",
      image_url: "",
      selling_price: 0
    });
    setIngredients([{ name: "", quantity: 0, unit: "", cost: 0 }]);
    setInstructions([""]);
  };

  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: "", quantity: 0, unit: "", cost: 0 }]);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    setIngredients(prev => prev.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addInstruction = () => {
    setInstructions(prev => [...prev, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    setInstructions(prev => prev.map((inst, i) => i === index ? value : inst));
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Filter out empty ingredients and instructions
    const validIngredients = ingredients.filter(ing => ing.name.trim());
    const validInstructions = instructions.filter(inst => inst.trim());

    if (validIngredients.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one ingredient",
        variant: "destructive"
      });
      return;
    }

    if (validInstructions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one instruction",
        variant: "destructive"
      });
      return;
    }

    // Calculate total cost from ingredients
    const totalCost = validIngredients.reduce((sum, ing) => sum + (ing.cost * ing.quantity), 0);
    
    const newRecipe = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      prep_time: formData.prep_time,
      cook_time: formData.cook_time,
      servings: formData.servings,
      difficulty: formData.difficulty,
      ingredients: validIngredients,
      instructions: validInstructions,
      image_url: formData.image_url,
      cost: totalCost,
      selling_price: formData.selling_price || 0
    };

    onAdd(newRecipe);
    toast({
      title: "Recipe created",
      description: `${formData.name} has been successfully added to your recipes.`
    });
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const totalCost = ingredients.reduce((sum, ing) => sum + (ing.cost * ing.quantity), 0);
  const profit = (formData.selling_price || 0) - totalCost;
  const profitMargin = formData.selling_price > 0 ? (profit / formData.selling_price) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
          <DialogDescription>Create a new recipe with ingredients, instructions, and profit tracking</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recipe Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter recipe name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the recipe..." 
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Prep Time (min)</Label>
                  <Input 
                    type="number" 
                    value={formData.prep_time || ""}
                    onChange={(e) => setFormData({...formData, prep_time: parseInt(e.target.value) || 0})}
                    placeholder="15"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cook Time (min)</Label>
                  <Input 
                    type="number" 
                    value={formData.cook_time || ""}
                    onChange={(e) => setFormData({...formData, cook_time: parseInt(e.target.value) || 0})}
                    placeholder="30"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Servings</Label>
                  <Input 
                    type="number" 
                    value={formData.servings || ""}
                    onChange={(e) => setFormData({...formData, servings: parseInt(e.target.value) || 1})}
                    placeholder="4"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({...formData, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Profit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pricing & Profit Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selling_price">Selling Price ($)</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.selling_price || ""}
                    onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost Price (Auto-calculated)</Label>
                  <Input value={`$${totalCost.toFixed(2)}`} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Total Profit</Label>
                  <Input 
                    value={`$${profit.toFixed(2)}`} 
                    disabled 
                    className={profit >= 0 ? 'text-green-600' : 'text-red-600'} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profit Margin</Label>
                  <Input 
                    value={`${profitMargin.toFixed(1)}%`} 
                    disabled
                    className={profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ingredients</CardTitle>
              <Button onClick={addIngredient} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Ingredient"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={ingredient.quantity || ""}
                        onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        placeholder="kg, L, etc."
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cost/Unit ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={ingredient.cost || ""}
                        onChange={(e) => updateIngredient(index, 'cost', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      className="h-10"
                      disabled={ingredients.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Instructions</CardTitle>
              <Button onClick={addInstruction} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-2">
                      {index + 1}
                    </div>
                    <Textarea
                      placeholder={`Step ${index + 1}`}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      className="mt-2"
                      disabled={instructions.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecipeModal;
