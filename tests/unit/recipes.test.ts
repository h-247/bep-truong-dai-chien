import { describe, it, expect } from 'vitest';
import {
  RECIPES,
  matchIngredientsToRecipe,
  identifyRecipeOnPlate,
  canAddIngredientToPlate,
  calculateDeliveryScore,
} from '@/src/game/recipes';
import { PlateItem, IngredientItem } from '@/src/types';

describe('Recipe System', () => {
  it('should have all 12 initial recipes defined', () => {
    const requiredRecipes = [
      'salad',
      'hamburger',
      'cheeseburger',
      'pizza',
      'mushroom_pizza',
      'sushi',
      'fried_rice',
      'pasta',
      'onion_soup',
      'tomato_soup',
      'french_fries',
      'grilled_fish',
    ];

    requiredRecipes.forEach((id) => {
      expect(RECIPES[id]).toBeDefined();
      expect(RECIPES[id].nameVi).toBeTruthy();
      expect(RECIPES[id].ingredients.length).toBeGreaterThan(0);
      expect(RECIPES[id].baseScore).toBeGreaterThan(0);
    });
  });

  it('should correctly match salad ingredients', () => {
    const saladRecipe = RECIPES.salad;
    const ingredients: IngredientItem[] = [
      { type: 'ingredient', id: '1', ingredientId: 'lettuce', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
      { type: 'ingredient', id: '2', ingredientId: 'tomato', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
      { type: 'ingredient', id: '3', ingredientId: 'cucumber', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
    ];

    expect(matchIngredientsToRecipe(ingredients, saladRecipe)).toBe(true);

    // If an ingredient is raw instead of chopped, it must fail
    ingredients[0].state = 'raw';
    expect(matchIngredientsToRecipe(ingredients, saladRecipe)).toBe(false);
  });

  it('should reject burned ingredients', () => {
    const saladRecipe = RECIPES.salad;
    const ingredients: IngredientItem[] = [
      { type: 'ingredient', id: '1', ingredientId: 'lettuce', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
      { type: 'ingredient', id: '2', ingredientId: 'tomato', state: 'burned', cookingProgress: 0, burnProgress: 1 },
      { type: 'ingredient', id: '3', ingredientId: 'cucumber', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
    ];

    expect(matchIngredientsToRecipe(ingredients, saladRecipe)).toBe(false);
  });

  it('should identify a completed recipe on a clean plate', () => {
    const cleanPlate: PlateItem = {
      type: 'plate',
      id: 'p1',
      isDirty: false,
      cleanliness: 1.0,
      items: [
        { type: 'ingredient', id: '1', ingredientId: 'lettuce', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
        { type: 'ingredient', id: '2', ingredientId: 'tomato', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
        { type: 'ingredient', id: '3', ingredientId: 'cucumber', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
      ],
    };

    const identified = identifyRecipeOnPlate(cleanPlate);
    expect(identified).toBeDefined();
    expect(identified?.id).toBe('salad');
  });

  it('should not identify recipe if plate is dirty', () => {
    const dirtyPlate: PlateItem = {
      type: 'plate',
      id: 'p1',
      isDirty: true,
      cleanliness: 0,
      items: [
        { type: 'ingredient', id: '1', ingredientId: 'lettuce', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
        { type: 'ingredient', id: '2', ingredientId: 'tomato', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
        { type: 'ingredient', id: '3', ingredientId: 'cucumber', state: 'chopped', cookingProgress: 0, burnProgress: 0 },
      ],
    };

    expect(identifyRecipeOnPlate(dirtyPlate)).toBeNull();
  });

  it('should calculate delivery score with tips and combo multiplier correctly', () => {
    const baseScore = 100;
    // Fast delivery: 80s remaining out of 100s -> ratio = 0.8 -> (0.8 - 0.5) * 1.0 * 100 = 30 tip
    // Combo = 2 -> multiplier = 1.2 -> 20 combo bonus
    const { totalScore, tipScore, comboBonus } = calculateDeliveryScore(baseScore, 80, 100, 2);

    expect(tipScore).toBe(30);
    expect(comboBonus).toBe(20);
    expect(totalScore).toBe(150);
  });
});
