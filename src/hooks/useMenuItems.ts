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
        id: "4",
        name: "CRAFT BEER",
        description: "Local craft beer selection including IPA, Lager, and Wheat varieties",
        price: 8.00,
        category: "Beverages",
        isAvailable: true,
        isPopular: false,
        allergens: ["Gluten"],
        preparationTime: 2,
        ingredients: ["Craft Beer"]
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
        id: "7",
        name: "FRESH JUICE",
        description: "Freshly squeezed orange, apple, or mixed fruit juice",
        price: 4.99,
        category: "Beverages",
        isAvailable: true,
        isPopular: false,
        allergens: [],
        preparationTime: 3,
        calories: 120,
        ingredients: ["Fresh Fruit"]
      },
      {
        id: "8",
        name: "BOTTLED WATER",
        description: "Premium spring water",
        price: 1.99,
        category: "Beverages",
        isAvailable: true,
        isPopular: false,
        allergens: [],
        preparationTime: 1,
        calories: 0,
        ingredients: ["Water"]
      },
      {
        id: "9",
        name: "COFFEE",
        description: "Freshly brewed premium coffee",
        price: 3.99,
        category: "Beverages",
        isAvailable: true,
        isPopular: true,
        allergens: [],
        preparationTime: 4,
        calories: 5,
        ingredients: ["Coffee Beans", "Water"]
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
      }
    ];

    setMenuItems(mockMenuItems);
  }, []);

  // Filter items for food/beverage categories (Restaurant POS)
  const getFoodAndBeverageItems = () => {
    const foodCategories = ["Main Course", "Appetizers", "Desserts", "Beverages", "Salads", "Soups", "Sides"];
    return menuItems.filter(item => 
      foodCategories.some(category => 
        item.category.toLowerCase().includes(category.toLowerCase())
      ) && item.isAvailable
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