-- Fix menu_items table to ensure allergens and ingredients are never null
-- Set default values to empty arrays
ALTER TABLE public.menu_items 
  ALTER COLUMN allergens SET DEFAULT '{}',
  ALTER COLUMN ingredients SET DEFAULT '{}';

-- Update existing null values to empty arrays
UPDATE public.menu_items 
SET allergens = '{}' 
WHERE allergens IS NULL;

UPDATE public.menu_items 
SET ingredients = '{}' 
WHERE ingredients IS NULL;

-- Make columns NOT NULL to prevent future null values
ALTER TABLE public.menu_items 
  ALTER COLUMN allergens SET NOT NULL,
  ALTER COLUMN ingredients SET NOT NULL;