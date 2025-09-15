import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInventoryIntegration } from "@/hooks/useInventoryIntegration";
import { CheckCircle, XCircle, AlertTriangle, Package } from "lucide-react";

interface RecipeIngredient {
  inventoryItemId: string;
  quantityNeeded: number;
  unit: string;
  name: string;
}

interface RecipeIngredientCheckerProps {
  recipeId: string;
  recipeName: string;
  ingredients: RecipeIngredient[];
  quantity?: number;
  onProduce?: (canProduce: boolean) => void;
}

const RecipeIngredientChecker = ({ 
  recipeId, 
  recipeName, 
  ingredients, 
  quantity = 1, 
  onProduce 
}: RecipeIngredientCheckerProps) => {
  const { checkRecipeIngredients, deductRecipeIngredients } = useInventoryIntegration();
  const [isProducing, setIsProducing] = useState(false);

  const ingredientCheck = checkRecipeIngredients(
    ingredients.map(ing => ({
      inventoryItemId: ing.inventoryItemId,
      quantityNeeded: ing.quantityNeeded * quantity
    }))
  );

  const handleProduce = async () => {
    setIsProducing(true);
    try {
      const success = await deductRecipeIngredients(
        ingredients.map(ing => ({
          inventoryItemId: ing.inventoryItemId,
          quantityNeeded: ing.quantityNeeded
        })),
        quantity
      );
      
      onProduce?.(success);
    } finally {
      setIsProducing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recipe Ingredients - {recipeName}
          {quantity > 1 && <Badge variant="outline">x{quantity}</Badge>}
        </CardTitle>
        <CardDescription>
          Check ingredient availability and produce recipe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert className={ingredientCheck.canMake ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {ingredientCheck.canMake ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {ingredientCheck.canMake 
                ? "All ingredients are available for production"
                : `Missing ${ingredientCheck.missingItems.length} ingredient(s)`
              }
            </AlertDescription>
          </div>
        </Alert>

        {/* Ingredient List */}
        <div className="space-y-3">
          <h4 className="font-semibold">Ingredients Needed</h4>
          {ingredientCheck.availability.map((ingredient, index) => {
            const needed = ingredient.quantityNeeded;
            const available = ingredient.currentStock;
            const percentage = Math.min(100, (available / needed) * 100);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ingredient.available ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{ingredient.itemName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {needed} needed / {available} available
                    </span>
                    <Badge 
                      variant={ingredient.available ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {ingredient.available ? "OK" : "SHORT"}
                    </Badge>
                  </div>
                </div>
                
                <Progress 
                  value={percentage} 
                  className={`h-2 ${ingredient.available ? "bg-green-100" : "bg-red-100"}`}
                />
                
                {!ingredient.available && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Short by {needed - available} units
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Production Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={handleProduce}
            disabled={!ingredientCheck.canMake || isProducing}
            className="w-full"
          >
            {isProducing 
              ? "Producing..." 
              : `Produce ${recipeName}${quantity > 1 ? ` (x${quantity})` : ""}`
            }
          </Button>
          
          {!ingredientCheck.canMake && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Restock missing ingredients to enable production
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeIngredientChecker;