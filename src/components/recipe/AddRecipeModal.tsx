import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (recipe: Recipe) => void;
}

const categories = [
  "Appetizers", "Main Course", "Desserts", "Beverages", "Salads", "Soups", "Sides"
];

const AddRecipeModal = ({ isOpen, onClose, onAdd }: AddRecipeModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Recipe, 'id' | 'cost'>>({
    name: "",
    description: "",
    category: "",
    prepTime: 0,
    cookTime: 0,
    servings: 0,
    difficulty: "Easy",
    ingredients: [{ name: "", quantity: 0, unit: "", cost: 0 }],
    instructions: [""]
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      prepTime: 0,
      cookTime: 0,
      servings: 0,
      difficulty: "Easy",
      ingredients: [{ name: "", quantity: 0, unit: "", cost: 0 }],
      instructions: [""]
    });
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: 0, unit: "", cost: 0 }]
    }));
  };

  const updateIngredient = (index: number, field: keyof typeof formData.ingredients[0], value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
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
    const validIngredients = formData.ingredients.filter(ing => ing.name.trim());
    const validInstructions = formData.instructions.filter(inst => inst.trim());

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
    const totalCost = validIngredients.reduce((sum, ing) => sum + ing.cost, 0);
    
    const newRecipe: Recipe = {
      ...formData,
      id: Date.now().toString(),
      cost: totalCost,
      ingredients: validIngredients,
      instructions: validInstructions
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
          <DialogDescription>Create a new recipe with ingredients and instructions</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recipe Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter recipe name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
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
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe the recipe..." 
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Prep Time (min)</Label>
                  <Input 
                    type="number" 
                    value={formData.prepTime || ""}
                    onChange={(e) => setFormData(prev => ({...prev, prepTime: parseInt(e.target.value) || 0}))}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cook Time (min)</Label>
                  <Input 
                    type="number" 
                    value={formData.cookTime || ""}
                    onChange={(e) => setFormData(prev => ({...prev, cookTime: parseInt(e.target.value) || 0}))}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Servings</Label>
                  <Input 
                    type="number" 
                    value={formData.servings || ""}
                    onChange={(e) => setFormData(prev => ({...prev, servings: parseInt(e.target.value) || 0}))}
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => setFormData(prev => ({...prev, difficulty: value}))}>
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
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={ingredient.quantity || ""}
                        onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        placeholder="cups, tbsp, etc."
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cost ($)</Label>
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
                      disabled={formData.ingredients.length === 1}
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
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-2">
                      {index + 1}
                    </div>
                    <Textarea
                      placeholder={`Step ${index + 1}`}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      className="mt-2"
                      disabled={formData.instructions.length === 1}
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