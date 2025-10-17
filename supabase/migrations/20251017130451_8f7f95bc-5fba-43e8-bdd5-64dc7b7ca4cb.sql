-- Add selling_price to recipes table for profit calculation
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS selling_price NUMERIC DEFAULT 0;

-- Add profit_margin computed field (percentage)
-- This will be calculated in the application layer

-- Add a function to calculate recipe profit
CREATE OR REPLACE FUNCTION public.calculate_recipe_profit(recipe_uuid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipe_cost NUMERIC;
  recipe_selling_price NUMERIC;
  profit NUMERIC;
BEGIN
  SELECT cost, selling_price INTO recipe_cost, recipe_selling_price
  FROM recipes
  WHERE id = recipe_uuid;
  
  profit := COALESCE(recipe_selling_price, 0) - COALESCE(recipe_cost, 0);
  
  RETURN profit;
END;
$$;

COMMENT ON FUNCTION public.calculate_recipe_profit IS 'Calculates profit for a recipe (selling price - cost)';