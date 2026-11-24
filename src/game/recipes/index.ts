import { Recipe, IngredientItem, PlateItem, CookingToolItem } from '@/src/types';

export const RECIPES: Record<string, Recipe> = {
  salad: {
    id: 'salad',
    nameVi: 'Salad rau củ',
    descriptionVi: 'Xà lách thái + Cà chua thái + Dưa leo thái trên đĩa sạch',
    ingredients: [
      { ingredientId: 'lettuce', state: 'chopped' },
      { ingredientId: 'tomato', state: 'chopped' },
      { ingredientId: 'cucumber', state: 'chopped' },
    ],
    needsPlate: true,
    prepDuration: 6,
    cookingDuration: 0,
    baseScore: 100,
    orderTimeout: 90,
    difficulty: 'easy',
  },
  hamburger: {
    id: 'hamburger',
    nameVi: 'Bánh hamburger',
    descriptionVi: 'Bánh mì + Thịt bò rán chín + Xà lách thái + Cà chua thái trên đĩa',
    ingredients: [
      { ingredientId: 'bun', state: 'raw' },
      { ingredientId: 'beef', state: 'cooked', cookedWith: 'pan' },
      { ingredientId: 'lettuce', state: 'chopped' },
      { ingredientId: 'tomato', state: 'chopped' },
    ],
    needsPlate: true,
    prepDuration: 8,
    cookingDuration: 10,
    baseScore: 160,
    orderTimeout: 105,
    difficulty: 'medium',
  },
  cheeseburger: {
    id: 'cheeseburger',
    nameVi: 'Hamburger phô mai',
    descriptionVi: 'Bánh mì + Thịt bò rán chín + Phô mai thái trên đĩa',
    ingredients: [
      { ingredientId: 'bun', state: 'raw' },
      { ingredientId: 'beef', state: 'cooked', cookedWith: 'pan' },
      { ingredientId: 'cheese', state: 'chopped' },
    ],
    needsPlate: true,
    prepDuration: 6,
    cookingDuration: 10,
    baseScore: 140,
    orderTimeout: 95,
    difficulty: 'medium',
  },
  pizza: {
    id: 'pizza',
    nameVi: 'Bánh pizza',
    descriptionVi: 'Bột bánh + Cà chua thái + Phô mai thái, nướng trong lò nướng',
    ingredients: [
      { ingredientId: 'dough', state: 'raw' },
      { ingredientId: 'tomato', state: 'chopped' },
      { ingredientId: 'cheese', state: 'chopped' },
    ],
    needsPlate: true,
    cookedWith: 'oven',
    prepDuration: 8,
    cookingDuration: 12,
    baseScore: 150,
    orderTimeout: 100,
    difficulty: 'medium',
  },
  mushroom_pizza: {
    id: 'mushroom_pizza',
    nameVi: 'Pizza nấm',
    descriptionVi: 'Bột bánh + Cà chua thái + Phô mai thái + Nấm thái, nướng trong lò',
    ingredients: [
      { ingredientId: 'dough', state: 'raw' },
      { ingredientId: 'tomato', state: 'chopped' },
      { ingredientId: 'cheese', state: 'chopped' },
      { ingredientId: 'mushroom', state: 'chopped' },
    ],
    needsPlate: true,
    cookedWith: 'oven',
    prepDuration: 10,
    cookingDuration: 14,
    baseScore: 180,
    orderTimeout: 110,
    difficulty: 'hard',
  },
  sushi: {
    id: 'sushi',
    nameVi: 'Sushi',
    descriptionVi: 'Cơm nấu chín + Rong biển + Cá tươi thái lát trên đĩa',
    ingredients: [
      { ingredientId: 'rice', state: 'cooked', cookedWith: 'rice_cooker' },
      { ingredientId: 'seaweed', state: 'raw' },
      { ingredientId: 'fish', state: 'chopped' },
    ],
    needsPlate: true,
    prepDuration: 8,
    cookingDuration: 12,
    baseScore: 150,
    orderTimeout: 100,
    difficulty: 'medium',
  },
  fried_rice: {
    id: 'fried_rice',
    nameVi: 'Cơm chiên',
    descriptionVi: 'Cơm nấu chín + Trứng thái + Rau củ thái, xào chín trên chảo rán',
    ingredients: [
      { ingredientId: 'rice', state: 'cooked', cookedWith: 'rice_cooker' },
      { ingredientId: 'egg', state: 'chopped' },
      { ingredientId: 'vegetables', state: 'chopped' },
    ],
    needsPlate: true,
    cookedWith: 'pan',
    prepDuration: 10,
    cookingDuration: 10,
    baseScore: 170,
    orderTimeout: 105,
    difficulty: 'hard',
  },
  pasta: {
    id: 'pasta',
    nameVi: 'Mì Ý',
    descriptionVi: 'Mì Ý luộc trong nồi + Cà chua thái nấu xốt trên đĩa sạch',
    ingredients: [
      { ingredientId: 'pasta', state: 'cooked', cookedWith: 'pot' },
      { ingredientId: 'tomato', state: 'cooked', cookedWith: 'pot' },
    ],
    needsPlate: true,
    prepDuration: 6,
    cookingDuration: 10,
    baseScore: 140,
    orderTimeout: 95,
    difficulty: 'medium',
  },
  onion_soup: {
    id: 'onion_soup',
    nameVi: 'Súp hành tây',
    descriptionVi: 'Hành tây thái nhỏ, nấu chín trong nồi súp',
    ingredients: [
      { ingredientId: 'onion', state: 'cooked', cookedWith: 'pot' },
    ],
    needsPlate: true,
    prepDuration: 6,
    cookingDuration: 10,
    baseScore: 110,
    orderTimeout: 85,
    difficulty: 'easy',
  },
  tomato_soup: {
    id: 'tomato_soup',
    nameVi: 'Súp cà chua',
    descriptionVi: 'Cà chua thái nhỏ, nấu chín đậm đà trong nồi súp',
    ingredients: [
      { ingredientId: 'tomato', state: 'cooked', cookedWith: 'pot' },
    ],
    needsPlate: true,
    prepDuration: 6,
    cookingDuration: 10,
    baseScore: 110,
    orderTimeout: 85,
    difficulty: 'easy',
  },
  french_fries: {
    id: 'french_fries',
    nameVi: 'Khoai tây chiên',
    descriptionVi: 'Khoai tây thái lát, chiên giòn rụm trong nồi chiên ngập dầu',
    ingredients: [
      { ingredientId: 'potato', state: 'cooked', cookedWith: 'deep_fryer' },
    ],
    needsPlate: true,
    prepDuration: 6,
    cookingDuration: 10,
    baseScore: 120,
    orderTimeout: 85,
    difficulty: 'easy',
  },
  grilled_fish: {
    id: 'grilled_fish',
    nameVi: 'Cá nướng',
    descriptionVi: 'Cá tươi thái lát, rán áp chảo hoặc nướng thơm lừng',
    ingredients: [
      { ingredientId: 'fish', state: 'cooked', cookedWith: 'pan' },
    ],
    needsPlate: true,
    prepDuration: 6,
    cookingDuration: 10,
    baseScore: 130,
    orderTimeout: 90,
    difficulty: 'medium',
  },
};

export const RECIPE_LIST = Object.values(RECIPES);

/**
 * Checks if a collection of ingredients matches a recipe requirement exactly.
 */
export function matchIngredientsToRecipe(
  ingredients: IngredientItem[],
  recipe: Recipe,
): boolean {
  if (ingredients.length !== recipe.ingredients.length) {
    return false;
  }

  // Count required ingredients
  const unmatchedRequirements = [...recipe.ingredients];

  for (const item of ingredients) {
    // If any item is burned, dish is invalid
    if (item.state === 'burned') {
      return false;
    }

    const index = unmatchedRequirements.findIndex(
      (req) => req.ingredientId === item.ingredientId && req.state === item.state,
    );

    if (index === -1) {
      return false;
    }

    unmatchedRequirements.splice(index, 1);
  }

  return unmatchedRequirements.length === 0;
}

/**
 * Identifies if a plate contains a valid completed recipe.
 */
export function identifyRecipeOnPlate(plate: PlateItem): Recipe | null {
  if (plate.isDirty || plate.items.length === 0) {
    return null;
  }

  for (const recipe of RECIPE_LIST) {
    if (matchIngredientsToRecipe(plate.items, recipe)) {
      return recipe;
    }
  }

  return null;
}

/**
 * Checks if an ingredient can be added to an existing plate without making it impossible to produce any recipe.
 */
export function canAddIngredientToPlate(
  plate: PlateItem,
  newItem: IngredientItem,
): boolean {
  if (plate.isDirty || newItem.state === 'burned') {
    return false;
  }

  const testList = [...plate.items, newItem];

  // Check if any recipe is a superset of testList
  for (const recipe of RECIPE_LIST) {
    const reqs = [...recipe.ingredients];
    let possible = true;

    for (const item of testList) {
      const idx = reqs.findIndex(
        (r) => r.ingredientId === item.ingredientId && r.state === item.state,
      );
      if (idx === -1) {
        possible = false;
        break;
      }
      reqs.splice(idx, 1);
    }

    if (possible) return true;
  }

  return false;
}

/**
 * Calculates score, tip, and combo multiplier for order delivery.
 */
export function calculateDeliveryScore(
  baseScore: number,
  remainingTime: number,
  totalTime: number,
  currentCombo: number,
): { totalScore: number; tipScore: number; comboBonus: number } {
  const timeRatio = Math.max(0, Math.min(1, remainingTime / totalTime));
  
  // Fast delivery tip: up to 50% bonus if delivered quickly
  const tipScore = Math.round(baseScore * (timeRatio > 0.5 ? (timeRatio - 0.5) * 1.0 : 0));
  
  // Combo multiplier: 1.0 + (combo * 0.2), capped at 2.0 (x2 multiplier)
  const multiplier = Math.min(2.0, 1.0 + Math.max(0, currentCombo - 1) * 0.2);
  const comboBonus = Math.round(baseScore * (multiplier - 1.0));
  
  const totalScore = baseScore + tipScore + comboBonus;

  return { totalScore, tipScore, comboBonus };
}
