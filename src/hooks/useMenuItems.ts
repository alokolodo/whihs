import { useState, useEffect } from "react";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  allergens: string[];
  preparationTime: number;
  calories?: number;
  image?: string;
  ingredients: string[];
}

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // Mock data - in a real app this would come from a database
    const mockMenuItems: MenuItem[] = [
      // Food Items
      {
        id: "1",
        name: "GRILLED SALMON",
        description: "Fresh Atlantic salmon grilled to perfection with herb seasoning, served with seasonal vegetables",
        price: 28.00,
        category: "Main Course",
        isAvailable: true,
        isPopular: true,
        allergens: ["Fish"],
        preparationTime: 25,
        calories: 420,
        ingredients: ["Salmon", "Fresh Herbs", "Seasonal Vegetables", "Olive Oil"]
      },
      {
        id: "2",
        name: "CAESAR SALAD",
        description: "Classic Caesar salad with homemade dressing, parmesan cheese, and crispy croutons",
        price: 16.00,
        category: "Salads",
        isAvailable: true,
        isPopular: false,
        allergens: ["Gluten", "Dairy", "Eggs"],
        preparationTime: 10,
        calories: 320,
        ingredients: ["Romaine Lettuce", "Parmesan", "Croutons", "Caesar Dressing"]
      },
      {
        id: "3",
        name: "CHOCOLATE LAVA CAKE",
        description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
        price: 12.00,
        category: "Desserts",
        isAvailable: false,
        isPopular: true,
        allergens: ["Gluten", "Dairy", "Eggs"],
        preparationTime: 15,
        calories: 580,
        ingredients: ["Dark Chocolate", "Butter", "Eggs", "Flour", "Vanilla Ice Cream"]
      },
      {
        id: "5",
        name: "MEATBALL SUB",
        description: "Italian style meatballs in marinara sauce on fresh bread",
        price: 12.99,
        category: "Main Course",
        isAvailable: true,
        isPopular: true,
        allergens: ["Gluten", "Dairy"],
        preparationTime: 15,
        calories: 650,
        ingredients: ["Meatballs", "Marinara Sauce", "Sub Roll", "Mozzarella"]
      },
      {
        id: "6",
        name: "CHICKEN WINGS",
        description: "Crispy chicken wings with your choice of sauce",
        price: 8.99,
        category: "Appetizers",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 12,
        calories: 480,
        ingredients: ["Chicken Wings", "Buffalo Sauce", "Celery"]
      },
      {
        id: "10",
        name: "FISH & CHIPS",
        description: "Beer battered fish with crispy fries",
        price: 16.99,
        category: "Main Course",
        isAvailable: true,
        isPopular: true,
        allergens: ["Fish", "Gluten"],
        preparationTime: 18,
        calories: 750,
        ingredients: ["White Fish", "Potato", "Beer Batter", "Oil"]
      },

      // Red Wines
      {
        id: "w1",
        name: "CABERNET SAUVIGNON",
        description: "Full-bodied red wine with rich blackcurrant flavors and smooth tannins",
        price: 45.00,
        category: "Red Wine",
        isAvailable: true,
        isPopular: true,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Cabernet Sauvignon Grapes", "Sulfites"]
      },
      {
        id: "w2",
        name: "MERLOT",
        description: "Medium-bodied red wine with plum and cherry notes",
        price: 38.00,
        category: "Red Wine",
        isAvailable: true,
        isPopular: false,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Merlot Grapes", "Sulfites"]
      },
      {
        id: "w3",
        name: "PINOT NOIR",
        description: "Light-bodied red wine with elegant cherry and strawberry flavors",
        price: 42.00,
        category: "Red Wine",
        isAvailable: true,
        isPopular: true,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Pinot Noir Grapes", "Sulfites"]
      },

      // White Wines
      {
        id: "w4",
        name: "CHARDONNAY",
        description: "Full-bodied white wine with vanilla and oak notes",
        price: 40.00,
        category: "White Wine",
        isAvailable: true,
        isPopular: true,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Chardonnay Grapes", "Sulfites"]
      },
      {
        id: "w5",
        name: "SAUVIGNON BLANC",
        description: "Crisp white wine with citrus and tropical fruit flavors",
        price: 35.00,
        category: "White Wine",
        isAvailable: true,
        isPopular: true,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Sauvignon Blanc Grapes", "Sulfites"]
      },
      {
        id: "w6",
        name: "RIESLING",
        description: "Sweet white wine with floral and peach notes",
        price: 32.00,
        category: "White Wine",
        isAvailable: true,
        isPopular: false,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Riesling Grapes", "Sulfites"]
      },

      // Rosé Wines
      {
        id: "w7",
        name: "PROVENCE ROSÉ",
        description: "Dry rosé with delicate strawberry and watermelon flavors",
        price: 36.00,
        category: "Rosé Wine",
        isAvailable: true,
        isPopular: true,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Mixed Red Grapes", "Sulfites"]
      },

      // Sparkling Wines
      {
        id: "w8",
        name: "CHAMPAGNE",
        description: "Premium French sparkling wine with fine bubbles and toasty notes",
        price: 85.00,
        category: "Sparkling Wine",
        isAvailable: true,
        isPopular: true,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Chardonnay", "Pinot Noir", "Pinot Meunier", "Sulfites"]
      },
      {
        id: "w9",
        name: "PROSECCO",
        description: "Italian sparkling wine with fresh apple and pear flavors",
        price: 28.00,
        category: "Sparkling Wine",
        isAvailable: true,
        isPopular: true,
        allergens: ["Sulfites"],
        preparationTime: 2,
        ingredients: ["Glera Grapes", "Sulfites"]
      },

      // Cocktails
      {
        id: "c1",
        name: "MANHATTAN",
        description: "Classic whiskey cocktail with sweet vermouth and bitters",
        price: 14.00,
        category: "Cocktails",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 5,
        ingredients: ["Whiskey", "Sweet Vermouth", "Angostura Bitters", "Cherry"]
      },
      {
        id: "c2",
        name: "MARTINI",
        description: "Classic gin cocktail with dry vermouth, served with olive or lemon twist",
        price: 13.00,
        category: "Cocktails",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 4,
        ingredients: ["Gin", "Dry Vermouth", "Olive", "Lemon"]
      },
      {
        id: "c3",
        name: "OLD FASHIONED",
        description: "Whiskey cocktail with sugar, bitters, and orange peel",
        price: 15.00,
        category: "Cocktails",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 6,
        ingredients: ["Whiskey", "Sugar", "Bitters", "Orange Peel"]
      },
      {
        id: "c4",
        name: "MOJITO",
        description: "Refreshing rum cocktail with mint, lime, and soda water",
        price: 12.00,
        category: "Cocktails",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 7,
        ingredients: ["White Rum", "Fresh Mint", "Lime Juice", "Sugar", "Soda Water"]
      },
      {
        id: "c5",
        name: "MARGARITA",
        description: "Tequila cocktail with triple sec and lime juice, served with salt rim",
        price: 13.50,
        category: "Cocktails",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 5,
        ingredients: ["Tequila", "Triple Sec", "Lime Juice", "Salt"]
      },
      {
        id: "c6",
        name: "NEGRONI",
        description: "Italian cocktail with gin, Campari, and sweet vermouth",
        price: 14.50,
        category: "Cocktails",
        isAvailable: true,
        isPopular: false,
        allergens: [],
        preparationTime: 4,
        ingredients: ["Gin", "Campari", "Sweet Vermouth", "Orange Peel"]
      },

      // Spirits
      {
        id: "s1",
        name: "WHISKEY NEAT",
        description: "Premium aged whiskey served neat",
        price: 18.00,
        category: "Spirits",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 2,
        ingredients: ["Aged Whiskey"]
      },
      {
        id: "s2",
        name: "VODKA SHOT",
        description: "Premium vodka served chilled",
        price: 12.00,
        category: "Spirits",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 2,
        ingredients: ["Premium Vodka"]
      },
      {
        id: "s3",
        name: "COGNAC",
        description: "Fine French cognac served in a snifter",
        price: 25.00,
        category: "Spirits",
        isAvailable: true,
        isPopular: false,
        allergens: [],
        preparationTime: 2,
        ingredients: ["French Cognac"]
      },

      // Beer
      {
        id: "b1",
        name: "CRAFT IPA",
        description: "Local craft India Pale Ale with hoppy citrus flavors",
        price: 8.00,
        category: "Beer",
        isAvailable: true,
        isPopular: true,
        allergens: ["Gluten"],
        preparationTime: 2,
        ingredients: ["Craft Beer", "Hops", "Malt", "Yeast"]
      },
      {
        id: "b2",
        name: "LAGER",
        description: "Crisp and refreshing premium lager beer",
        price: 6.50,
        category: "Beer",
        isAvailable: true,
        isPopular: true,
        allergens: ["Gluten"],
        preparationTime: 2,
        ingredients: ["Lager Beer", "Malt", "Hops", "Yeast"]
      },
      {
        id: "b3",
        name: "WHEAT BEER",
        description: "Smooth wheat beer with citrus notes",
        price: 7.00,
        category: "Beer",
        isAvailable: true,
        isPopular: false,
        allergens: ["Gluten"],
        preparationTime: 2,
        ingredients: ["Wheat Beer", "Wheat", "Hops", "Yeast"]
      },

      // Non-Alcoholic Beverages
      {
        id: "7",
        name: "FRESH ORANGE JUICE",
        description: "Freshly squeezed orange juice",
        price: 4.99,
        category: "Non-Alcoholic Beverages",
        isAvailable: true,
        isPopular: false,
        allergens: [],
        preparationTime: 3,
        calories: 120,
        ingredients: ["Fresh Oranges"]
      },
      {
        id: "8",
        name: "BOTTLED WATER",
        description: "Premium spring water",
        price: 1.99,
        category: "Non-Alcoholic Beverages",
        isAvailable: true,
        isPopular: false,
        allergens: [],
        preparationTime: 1,
        calories: 0,
        ingredients: ["Spring Water"]
      },
      {
        id: "9",
        name: "PREMIUM COFFEE",
        description: "Freshly brewed premium coffee",
        price: 3.99,
        category: "Hot Beverages",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 4,
        calories: 5,
        ingredients: ["Coffee Beans", "Water"]
      },
      {
        id: "nb1",
        name: "SOFT DRINKS",
        description: "Selection of cola, lemon-lime, and orange sodas",
        price: 3.50,
        category: "Non-Alcoholic Beverages",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 2,
        calories: 150,
        ingredients: ["Carbonated Water", "Syrup", "Natural Flavors"]
      },
      {
        id: "nb2",
        name: "FRESH LEMONADE",
        description: "House-made fresh lemonade",
        price: 4.50,
        category: "Non-Alcoholic Beverages",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 5,
        calories: 110,
        ingredients: ["Fresh Lemons", "Sugar", "Water", "Ice"]
      },
      {
        id: "hb1",
        name: "ESPRESSO",
        description: "Rich, concentrated coffee shot",
        price: 2.99,
        category: "Hot Beverages",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 3,
        calories: 2,
        ingredients: ["Espresso Beans"]
      },
      {
        id: "hb2",
        name: "CAPPUCCINO",
        description: "Espresso with steamed milk foam",
        price: 4.50,
        category: "Hot Beverages",
        isAvailable: true,
        isPopular: true,
        allergens: ["Dairy"],
        preparationTime: 5,
        calories: 80,
        ingredients: ["Espresso", "Steamed Milk", "Milk Foam"]
      },
      {
        id: "hb3",
        name: "HOT TEA",
        description: "Selection of premium teas: Earl Grey, Green, Chamomile",
        price: 3.50,
        category: "Hot Beverages",
        isAvailable: true,
        isPopular: false,
        allergens: [],
        preparationTime: 4,
        calories: 0,
        ingredients: ["Tea Leaves", "Hot Water"]
      }
    ];

    setMenuItems(mockMenuItems);
  }, []);

  // Filter items for food/beverage categories (Restaurant POS)
  const getFoodAndBeverageItems = () => {
    const foodCategories = [
      "Main Course", "Appetizers", "Desserts", "Salads", "Soups", "Sides",
      "Red Wine", "White Wine", "Rosé Wine", "Sparkling Wine", "Cocktails", 
      "Spirits", "Beer", "Non-Alcoholic Beverages", "Hot Beverages"
    ];
    return menuItems.filter(item => 
      foodCategories.includes(item.category) && item.isAvailable
    );
  };

  // Get all available items
  const getAvailableItems = () => {
    return menuItems.filter(item => item.isAvailable);
  };

  return {
    menuItems,
    setMenuItems,
    getFoodAndBeverageItems,
    getAvailableItems
  };
};