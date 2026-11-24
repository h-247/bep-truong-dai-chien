export type IngredientId =
  | 'lettuce'
  | 'tomato'
  | 'cucumber'
  | 'bun'
  | 'beef'
  | 'cheese'
  | 'dough'
  | 'mushroom'
  | 'rice'
  | 'seaweed'
  | 'fish'
  | 'egg'
  | 'vegetables'
  | 'pasta'
  | 'onion'
  | 'potato';

export type IngredientState =
  | 'raw'
  | 'chopped'
  | 'cooking'
  | 'cooked'
  | 'overcooked'
  | 'burned';

export interface IngredientItem {
  type: 'ingredient';
  id: string; // unique instance id
  ingredientId: IngredientId;
  state: IngredientState;
  cookingProgress: number; // 0 to 1
  burnProgress: number; // 0 to 1 (when cookingProgress >= 1)
}

export type EquipmentType =
  | 'pan'
  | 'pot'
  | 'oven'
  | 'rice_cooker'
  | 'deep_fryer';

export interface PlateItem {
  type: 'plate';
  id: string;
  isDirty: boolean;
  cleanliness: number; // 0 to 1 (0 = dirty, 1 = clean)
  items: IngredientItem[]; // Assembled ingredients on plate
  completedDishId?: string;
}

export interface ExtinguisherItem {
  type: 'fire_extinguisher';
  id: string;
  fuel: number; // 0 to 1
}

export interface CookingToolItem {
  type: 'cooking_tool';
  id: string;
  toolType: 'pan' | 'pot';
  contents: IngredientItem[];
  isCooking: boolean;
  cookingProgress: number;
  burnProgress: number;
}

export type HeldItem = IngredientItem | PlateItem | ExtinguisherItem | CookingToolItem | null;

export type StationType =
  | 'counter'
  | 'cutting_board'
  | 'stove'
  | 'oven'
  | 'rice_cooker'
  | 'deep_fryer'
  | 'plate_dispenser'
  | 'sink'
  | 'serving'
  | 'trash'
  | 'fire_extinguisher_stand'
  | 'ingredient_box'
  | 'floor'
  | 'wall'
  | 'hazard';

export interface StationData {
  x: number;
  y: number;
  type: StationType;
  ingredientId?: IngredientId; // For ingredient_box
  placedItem: HeldItem;
  // Specific station state
  progress?: number; // 0 to 1 (for chopping, washing, baking, etc.)
  isOperating?: boolean;
  isBurning?: boolean;
  burnIntensity?: number; // 0 to 1
}

export interface RecipeIngredientRequirement {
  ingredientId: IngredientId;
  state: IngredientState;
  cookedWith?: EquipmentType;
}

export interface Recipe {
  id: string;
  nameVi: string;
  descriptionVi: string;
  ingredients: RecipeIngredientRequirement[];
  needsPlate: boolean;
  cookedWith?: EquipmentType; // if entire assembly needs cooking (e.g. pizza in oven)
  prepDuration: number; // seconds
  cookingDuration: number; // seconds
  baseScore: number;
  orderTimeout: number; // seconds
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CustomerOrder {
  id: string;
  recipeId: string;
  remainingTime: number; // seconds
  totalTime: number; // seconds
  createdAt: number;
  baseScore: number;
  urgency: 'normal' | 'urgent' | 'critical';
}

export interface ChefCharacter {
  id: string;
  nameVi: string;
  color: string;
  accentColor: string;
  hatColor: string;
  apronColor: string;
  skinTone: string;
}

export interface PlayerState {
  id: string; // user id or player slot id
  name: string;
  characterId: string;
  isAi: boolean;
  isHost: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  isDashing: boolean;
  dashCooldown: number;
  heldItem: HeldItem;
  currentInteraction: 'idle' | 'chopping' | 'washing' | 'extinguishing';
  interactionProgress: number;
  interactionTarget?: { x: number; y: number };
  score: number;
  stats: {
    ingredientsPrepared: number;
    ingredientsCooked: number;
    dishesAssembled: number;
    ordersDelivered: number;
    platesWashed: number;
    firesExtinguished: number;
  };
}

export interface KitchenPing {
  id: string;
  senderId: string;
  senderName: string;
  x: number;
  y: number;
  type: 'general' | 'ingredient' | 'station' | 'fire' | 'order';
  message?: string;
  createdAt: number;
  duration: number; // ms to display
}

export interface QuickChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  messageVi: string;
  createdAt: number;
}

export interface LevelConfig {
  id: string;
  worldId: number;
  levelNumber: number;
  nameVi: string;
  worldNameVi: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'chaotic';
  timeLimit: number; // seconds (0 = infinite / practice)
  orderInterval: number; // seconds between new orders
  maxSimultaneousOrders: number;
  availableRecipes: string[]; // recipe IDs
  starThresholds: [number, number, number];
  gridWidth: number;
  gridHeight: number;
  layout: string[]; // ASCII grid layout
  hazards?: Array<{
    type: 'fire_vent' | 'slippery_floor' | 'moving_counter';
    x: number;
    y: number;
    properties?: Record<string, unknown>;
  }>;
}

export type GameMode =
  | 'single'
  | 'ai_coop'
  | 'local_coop'
  | 'online_coop'
  | 'practice'
  | 'campaign';

export interface GameSnapshot {
  version: number;
  timestamp: number;
  timeRemaining: number;
  score: number;
  combo: number;
  orders: CustomerOrder[];
  players: PlayerState[];
  stations: StationData[];
  pings: KitchenPing[];
  isOver: boolean;
  starsEarned: number;
}
