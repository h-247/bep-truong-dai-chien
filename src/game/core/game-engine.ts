import {
  CustomerOrder,
  GameSnapshot,
  HeldItem,
  IngredientId,
  IngredientItem,
  KitchenPing,
  LevelConfig,
  PlateItem,
  PlayerState,
  QuickChatMessage,
  StationData,
  CookingToolItem,
} from '@/src/types';
import { KitchenGrid } from './kitchen-grid';
import {
  canAddIngredientToPlate,
  identifyRecipeOnPlate,
  calculateDeliveryScore,
  RECIPES,
} from '@/src/game/recipes';
import { sound } from '@/src/game/audio/synth';

export interface GameEngineOptions {
  level: LevelConfig;
  playerCount: number;
  players: Array<{ id: string; name: string; characterId: string; isAi: boolean }>;
  isClientSideOnly?: boolean;
}

export class GameEngine {
  public level: LevelConfig;
  public grid: KitchenGrid;
  public players: Map<string, PlayerState> = new Map();
  public orders: CustomerOrder[] = [];
  public pings: KitchenPing[] = [];
  public quickChatLog: QuickChatMessage[] = [];
  public timeRemaining: number;
  public score: number = 0;
  public combo: number = 1;
  public highestCombo: number = 1;
  public tipsEarned: number = 0;
  public completedOrdersCount: number = 0;
  public failedOrdersCount: number = 0;
  public isGameOver: boolean = false;
  public version: number = 0;

  private orderTimer: number = 0;
  private orderCounter: number = 0;
  private isClientOnly: boolean;

  constructor(options: GameEngineOptions) {
    this.level = options.level;
    this.grid = new KitchenGrid(this.level);
    this.timeRemaining = this.level.timeLimit;
    this.isClientOnly = !!options.isClientSideOnly;

    // Initialize players
    this.initPlayers(options.players);

    // Initial orders
    this.spawnInitialOrders();
  }

  private initPlayers(
    playerList: Array<{ id: string; name: string; characterId: string; isAi: boolean }>,
  ) {
    // Find walkable spawn spots near the center
    const spawnSpots: Array<{ x: number; y: number }> = [];
    for (let y = 1; y < this.grid.height - 1; y++) {
      for (let x = 1; x < this.grid.width - 1; x++) {
        if (this.grid.isWalkable(x, y)) {
          spawnSpots.push({ x: x + 0.5, y: y + 0.5 });
        }
      }
    }

    playerList.forEach((p, idx) => {
      const spot = spawnSpots[idx % spawnSpots.length] || { x: 2.5, y: 2.5 };
      const player: PlayerState = {
        id: p.id,
        name: p.name,
        characterId: p.characterId,
        isAi: p.isAi,
        isHost: idx === 0,
        x: spot.x,
        y: spot.y,
        vx: 0,
        vy: 0,
        direction: 'down',
        isMoving: false,
        isDashing: false,
        dashCooldown: 0,
        heldItem: null,
        currentInteraction: 'idle',
        interactionProgress: 0,
        score: 0,
        stats: {
          ingredientsPrepared: 0,
          ingredientsCooked: 0,
          dishesAssembled: 0,
          ordersDelivered: 0,
          platesWashed: 0,
          firesExtinguished: 0,
        },
      };
      this.players.set(p.id, player);
    });
  }

  private spawnInitialOrders() {
    const initialCount = Math.min(2, this.level.maxSimultaneousOrders);
    for (let i = 0; i < initialCount; i++) {
      this.generateNewOrder();
    }
  }

  public generateNewOrder() {
    if (this.orders.length >= this.level.maxSimultaneousOrders) {
      return;
    }

    const recipeIds = this.level.availableRecipes;
    if (recipeIds.length === 0) return;

    const recipeId = recipeIds[Math.floor(Math.random() * recipeIds.length)];
    const recipe = RECIPES[recipeId];
    if (!recipe) return;

    this.orderCounter++;
    const newOrder: CustomerOrder = {
      id: `order_${this.orderCounter}_${Date.now()}`,
      recipeId,
      remainingTime: recipe.orderTimeout,
      totalTime: recipe.orderTimeout,
      createdAt: Date.now(),
      baseScore: recipe.baseScore,
      urgency: 'normal',
    };

    this.orders.push(newOrder);
  }

  /**
   * Fixed-timestep update simulation.
   * @param dt Delta time in seconds (e.g. 1/60 or 1/30)
   */
  public update(dt: number) {
    if (this.isGameOver) return;

    this.version++;

    // 1. Update Match Timer (if not practice mode with 0 timeLimit)
    if (this.level.timeLimit > 0) {
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
      if (this.timeRemaining <= 0) {
        this.isGameOver = true;
      }
    }

    // 2. Update Customer Orders
    this.orderTimer += dt;
    if (this.orderTimer >= this.level.orderInterval) {
      this.orderTimer = 0;
      this.generateNewOrder();
    }

    for (let i = this.orders.length - 1; i >= 0; i--) {
      const order = this.orders[i];
      order.remainingTime -= dt;

      // Update urgency
      const ratio = order.remainingTime / order.totalTime;
      if (ratio <= 0.25) {
        order.urgency = 'critical';
      } else if (ratio <= 0.5) {
        order.urgency = 'urgent';
      } else {
        order.urgency = 'normal';
      }

      // Check order expiration
      if (order.remainingTime <= 0) {
        this.orders.splice(i, 1);
        this.failedOrdersCount++;
        this.combo = 1; // Reset combo multiplier
        this.score = Math.max(0, this.score - 30);
        if (this.isClientOnly) {
          sound.playDeliveryFail();
        }
      }
    }

    // 3. Update Kitchen Stations & Cooking
    this.updateStations(dt);

    // 4. Update Players Movement & Interactions
    this.updatePlayers(dt);

    // 5. Cleanup expired Pings
    const now = Date.now();
    this.pings = this.pings.filter((p) => now - p.createdAt < p.duration);
  }

  private updateStations(dt: number) {
    for (const station of this.grid.stations.values()) {
      // 1. Cooking at stove / oven / deep_fryer / rice_cooker
      if (
        station.type === 'stove' ||
        station.type === 'oven' ||
        station.type === 'deep_fryer' ||
        station.type === 'rice_cooker'
      ) {
        this.processCookingStation(station, dt);
      }

      // 2. Burning & fire spreading
      if (station.isBurning) {
        station.burnIntensity = Math.min(1, (station.burnIntensity || 0) + dt * 0.1);
      }
    }
  }

  private processCookingStation(station: StationData, dt: number) {
    // If station is already on fire, cooking stops and danger increases
    if (station.isBurning) return;

    let tool: CookingToolItem | null = null;
    let singleIngredient: IngredientItem | null = null;

    if (station.placedItem?.type === 'cooking_tool') {
      tool = station.placedItem;
    } else if (station.placedItem?.type === 'ingredient') {
      singleIngredient = station.placedItem;
    }

    // A) If a cooking tool (pan/pot) is present with contents
    if (tool && tool.contents.length > 0) {
      tool.isCooking = true;
      if (tool.cookingProgress < 1.0) {
        tool.cookingProgress = Math.min(1.0, tool.cookingProgress + dt * 0.12);
        if (tool.cookingProgress >= 1.0) {
          // Ingredients become cooked!
          tool.contents.forEach((item) => {
            item.state = 'cooked';
          });
          if (this.isClientOnly) {
            sound.playDishComplete();
          }
        }
      } else {
        // Left unattended while hot -> burns!
        tool.burnProgress = Math.min(1.0, tool.burnProgress + dt * 0.08);
        if (tool.burnProgress >= 0.7 && tool.burnProgress < 1.0) {
          // Overcooked warning
          tool.contents.forEach((item) => {
            item.state = 'overcooked';
          });
          if (this.isClientOnly && Math.random() < 0.05) {
            sound.playBurnAlert();
          }
        } else if (tool.burnProgress >= 1.0) {
          // CATCHES FIRE!
          tool.contents.forEach((item) => {
            item.state = 'burned';
          });
          station.isBurning = true;
          station.burnIntensity = 0.5;
          if (this.isClientOnly) {
            sound.playBurnAlert();
          }
        }
      }
    }

    // B) If ingredient is placed directly in Oven / Deep Fryer / Rice Cooker
    if (
      singleIngredient &&
      (station.type === 'oven' ||
        station.type === 'deep_fryer' ||
        station.type === 'rice_cooker')
    ) {
      if (singleIngredient.cookingProgress < 1.0) {
        singleIngredient.cookingProgress = Math.min(
          1.0,
          singleIngredient.cookingProgress + dt * 0.12,
        );
        if (singleIngredient.cookingProgress >= 1.0) {
          singleIngredient.state = 'cooked';
          if (this.isClientOnly) {
            sound.playDishComplete();
          }
        }
      } else {
        singleIngredient.burnProgress = Math.min(
          1.0,
          singleIngredient.burnProgress + dt * 0.08,
        );
        if (singleIngredient.burnProgress >= 0.7 && singleIngredient.burnProgress < 1.0) {
          singleIngredient.state = 'overcooked';
          if (this.isClientOnly && Math.random() < 0.05) {
            sound.playBurnAlert();
          }
        } else if (singleIngredient.burnProgress >= 1.0) {
          singleIngredient.state = 'burned';
          station.isBurning = true;
          station.burnIntensity = 0.5;
          if (this.isClientOnly) {
            sound.playBurnAlert();
          }
        }
      }
    }
  }

  private updatePlayers(dt: number) {
    for (const player of this.players.values()) {
      // Dash cooldown
      if (player.dashCooldown > 0) {
        player.dashCooldown = Math.max(0, player.dashCooldown - dt);
      }

      // Movement integration
      const speed = player.isDashing ? 6.5 : 4.0;
      if (player.isMoving && (player.vx !== 0 || player.vy !== 0)) {
        const nextX = player.x + player.vx * speed * dt;
        const nextY = player.y + player.vy * speed * dt;
        const resolved = this.grid.resolvePlayerCollision(nextX, nextY, 0.35);
        player.x = resolved.x;
        player.y = resolved.y;
      }

      // Continuous interactions (chopping, washing, fire extinguishing)
      this.processPlayerContinuousInteraction(player, dt);
    }
  }

  private processPlayerContinuousInteraction(player: PlayerState, dt: number) {
    if (player.currentInteraction === 'idle') return;

    const facing = this.grid.getFacingCell(player.x, player.y, player.direction);
    const station = this.grid.getStation(facing.x, facing.y);

    if (!station) {
      player.currentInteraction = 'idle';
      player.interactionProgress = 0;
      return;
    }

    // 1. Chopping on cutting board
    if (player.currentInteraction === 'chopping') {
      if (
        station.type === 'cutting_board' &&
        station.placedItem?.type === 'ingredient' &&
        station.placedItem.state === 'raw'
      ) {
        player.interactionProgress = Math.min(1.0, player.interactionProgress + dt * 0.4);
        if (this.isClientOnly && Math.random() < 0.2) {
          sound.playChop();
        }
        if (player.interactionProgress >= 1.0) {
          station.placedItem.state = 'chopped';
          player.stats.ingredientsPrepared++;
          player.currentInteraction = 'idle';
          player.interactionProgress = 0;
          if (this.isClientOnly) {
            sound.playDishComplete();
          }
        }
      } else {
        player.currentInteraction = 'idle';
        player.interactionProgress = 0;
      }
    }

    // 2. Washing dirty plates at sink
    else if (player.currentInteraction === 'washing') {
      if (
        station.type === 'sink' &&
        station.placedItem?.type === 'plate' &&
        station.placedItem.isDirty
      ) {
        player.interactionProgress = Math.min(1.0, player.interactionProgress + dt * 0.4);
        if (this.isClientOnly && Math.random() < 0.2) {
          sound.playWashPlate();
        }
        if (player.interactionProgress >= 1.0) {
          station.placedItem.isDirty = false;
          station.placedItem.cleanliness = 1.0;
          player.stats.platesWashed++;
          player.currentInteraction = 'idle';
          player.interactionProgress = 0;
          if (this.isClientOnly) {
            sound.playDishComplete();
          }
        }
      } else {
        player.currentInteraction = 'idle';
        player.interactionProgress = 0;
      }
    }

    // 3. Extinguishing fire
    else if (player.currentInteraction === 'extinguishing') {
      if (player.heldItem?.type === 'fire_extinguisher' && station.isBurning) {
        player.interactionProgress = Math.min(1.0, player.interactionProgress + dt * 0.6);
        if (this.isClientOnly && Math.random() < 0.2) {
          sound.playFireExtinguish();
        }
        if (player.interactionProgress >= 1.0) {
          station.isBurning = false;
          station.burnIntensity = 0;
          player.stats.firesExtinguished++;
          player.currentInteraction = 'idle';
          player.interactionProgress = 0;
        }
      } else {
        player.currentInteraction = 'idle';
        player.interactionProgress = 0;
      }
    }
  }

  // ================= PLAYER ACTIONS =================

  public movePlayer(
    playerId: string,
    dx: number,
    dy: number,
    dash: boolean = false,
  ) {
    const player = this.players.get(playerId);
    if (!player) return;

    if (dx === 0 && dy === 0) {
      player.isMoving = false;
      player.vx = 0;
      player.vy = 0;
      return;
    }

    // Normalize movement vector
    const length = Math.sqrt(dx * dx + dy * dy);
    player.vx = dx / length;
    player.vy = dy / length;
    player.isMoving = true;

    // Determine primary facing direction
    if (Math.abs(dx) > Math.abs(dy)) {
      player.direction = dx > 0 ? 'right' : 'left';
    } else {
      player.direction = dy > 0 ? 'down' : 'up';
    }

    // Dash handling
    if (dash && player.dashCooldown <= 0) {
      player.isDashing = true;
      player.dashCooldown = 1.2;
      setTimeout(() => {
        player.isDashing = false;
      }, 200);
      if (this.isClientOnly) {
        sound.playDash();
      }
    }
  }

  public pickupOrDrop(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    const facing = this.grid.getFacingCell(player.x, player.y, player.direction);
    const station = this.grid.getStation(facing.x, facing.y);

    if (!station) return;

    // Stop active interaction if moving/picking
    player.currentInteraction = 'idle';
    player.interactionProgress = 0;

    // CASE 1: Player has NO item in hand -> PICK UP
    if (!player.heldItem) {
      // A) Ingredient Box: take fresh raw ingredient
      if (station.type === 'ingredient_box' && station.ingredientId) {
        const newIng: IngredientItem = {
          type: 'ingredient',
          id: `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ingredientId: station.ingredientId,
          state: 'raw',
          cookingProgress: 0,
          burnProgress: 0,
        };
        player.heldItem = newIng;
        if (this.isClientOnly) sound.playPickup();
        return;
      }

      // B) Plate Dispenser: take fresh clean plate
      if (station.type === 'plate_dispenser') {
        const newPlate: PlateItem = {
          type: 'plate',
          id: `plate_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          isDirty: false,
          cleanliness: 1.0,
          items: [],
        };
        player.heldItem = newPlate;
        if (this.isClientOnly) sound.playPickup();
        return;
      }

      // C) Fire Extinguisher Stand: take extinguisher
      if (station.type === 'fire_extinguisher_stand') {
        player.heldItem = {
          type: 'fire_extinguisher',
          id: `ext_${Date.now()}`,
          fuel: 1.0,
        };
        if (this.isClientOnly) sound.playPickup();
        return;
      }

      // D) Station has an item placed on it -> pick it up
      if (station.placedItem) {
        // If it's a cooking tool with cooked food and player has a plate, see CASE 2.
        // Otherwise pick up the tool/item.
        player.heldItem = station.placedItem;
        station.placedItem = null;
        if (this.isClientOnly) sound.playPickup();
        return;
      }

      return;
    }

    // CASE 2: Player IS HOLDING an item -> PLACE or COMBINE
    const held = player.heldItem;

    // A) Trash bin -> throw away item
    if (station.type === 'trash') {
      player.heldItem = null;
      if (this.isClientOnly) sound.playDrop();
      return;
    }

    // B) Serving station -> deliver completed dish
    if (station.type === 'serving') {
      if (held.type === 'plate') {
        this.attemptDelivery(player, held);
      } else {
        if (this.isClientOnly) sound.playDeliveryFail();
      }
      return;
    }

    // C) Plating: Holding clean Plate and facing a station with cooked ingredient / tool
    if (held.type === 'plate' && !held.isDirty) {
      // Facing a station with an ingredient item
      if (station.placedItem?.type === 'ingredient') {
        const stationIng = station.placedItem;
        if (canAddIngredientToPlate(held, stationIng)) {
          held.items.push(stationIng);
          station.placedItem = null;
          player.stats.dishesAssembled++;
          if (this.isClientOnly) sound.playPickup();
          return;
        }
      }

      // Facing a stove/station with a cooking tool (pan/pot) holding cooked food
      if (station.placedItem?.type === 'cooking_tool') {
        const tool = station.placedItem;
        if (tool.contents.length > 0 && tool.cookingProgress >= 1.0) {
          // Transfer food to plate
          for (const item of tool.contents) {
            if (canAddIngredientToPlate(held, item)) {
              held.items.push(item);
            }
          }
          tool.contents = [];
          tool.cookingProgress = 0;
          tool.burnProgress = 0;
          tool.isCooking = false;
          player.stats.dishesAssembled++;
          if (this.isClientOnly) sound.playPickup();
          return;
        }
      }
    }

    // D) Assembly onto Plate already sitting on Counter
    if (held.type === 'ingredient' && station.placedItem?.type === 'plate') {
      const plate = station.placedItem;
      if (canAddIngredientToPlate(plate, held)) {
        plate.items.push(held);
        player.heldItem = null;
        player.stats.dishesAssembled++;
        if (this.isClientOnly) sound.playDrop();
        return;
      }
    }

    // E) Adding ingredient to cooking tool on stove
    if (held.type === 'ingredient' && station.placedItem?.type === 'cooking_tool') {
      const tool = station.placedItem;
      if (tool.contents.length < 3 && !station.isBurning) {
        tool.contents.push(held);
        player.heldItem = null;
        if (this.isClientOnly) sound.playDrop();
        return;
      }
    }

    // F) Placing item on empty counter/station
    if (!station.placedItem) {
      // Cannot place regular items on ingredient boxes or plate dispensers
      if (
        station.type !== 'ingredient_box' &&
        station.type !== 'plate_dispenser' &&
        station.type !== 'wall'
      ) {
        station.placedItem = held;
        player.heldItem = null;
        if (this.isClientOnly) sound.playDrop();
        return;
      }
    }
  }

  public interact(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    const facing = this.grid.getFacingCell(player.x, player.y, player.direction);
    const station = this.grid.getStation(facing.x, facing.y);

    if (!station) return;

    // 1. Fire extinguisher spray
    if (player.heldItem?.type === 'fire_extinguisher' && station.isBurning) {
      player.currentInteraction = 'extinguishing';
      player.interactionProgress = 0;
      return;
    }

    // 2. Chopping on cutting board
    if (
      station.type === 'cutting_board' &&
      station.placedItem?.type === 'ingredient' &&
      station.placedItem.state === 'raw'
    ) {
      player.currentInteraction = 'chopping';
      player.interactionProgress = 0;
      return;
    }

    // 3. Washing dirty dishes at sink
    if (
      station.type === 'sink' &&
      station.placedItem?.type === 'plate' &&
      station.placedItem.isDirty
    ) {
      player.currentInteraction = 'washing';
      player.interactionProgress = 0;
      return;
    }
  }

  private attemptDelivery(player: PlayerState, plate: PlateItem) {
    const recipe = identifyRecipeOnPlate(plate);

    if (!recipe) {
      // Invalid dish assembly delivered
      this.combo = 1;
      this.score = Math.max(0, this.score - 50);
      player.heldItem = null;
      this.spawnDirtyPlate();
      if (this.isClientOnly) sound.playDeliveryFail();
      return;
    }

    // Find matching order in active queue
    const orderIndex = this.orders.findIndex((o) => o.recipeId === recipe.id);

    if (orderIndex === -1) {
      // Dish is valid recipe but NOT in the active customer order queue
      this.combo = 1;
      this.score = Math.max(0, this.score - 40);
      player.heldItem = null;
      this.spawnDirtyPlate();
      if (this.isClientOnly) sound.playDeliveryFail();
      return;
    }

    // SUCCESSFUL DELIVERY!
    const matchedOrder = this.orders[orderIndex];
    this.orders.splice(orderIndex, 1);

    const { totalScore, tipScore } = calculateDeliveryScore(
      matchedOrder.baseScore,
      matchedOrder.remainingTime,
      matchedOrder.totalTime,
      this.combo,
    );

    this.score += totalScore;
    this.tipsEarned += tipScore;
    this.completedOrdersCount++;
    this.combo++;
    if (this.combo > this.highestCombo) {
      this.highestCombo = this.combo;
    }

    player.score += totalScore;
    player.stats.ordersDelivered++;
    player.heldItem = null;

    // Spawn dirty plate at return counter/sink
    this.spawnDirtyPlate();

    if (this.isClientOnly) {
      sound.playDeliverySuccess();
    }
  }

  private spawnDirtyPlate() {
    // Find sink or free counter to place dirty plate
    for (const station of this.grid.stations.values()) {
      if (station.type === 'sink' && !station.placedItem) {
        station.placedItem = {
          type: 'plate',
          id: `dirty_plate_${Date.now()}`,
          isDirty: true,
          cleanliness: 0,
          items: [],
        };
        return;
      }
    }

    for (const station of this.grid.stations.values()) {
      if (station.type === 'counter' && !station.placedItem) {
        station.placedItem = {
          type: 'plate',
          id: `dirty_plate_${Date.now()}`,
          isDirty: true,
          cleanliness: 0,
          items: [],
        };
        return;
      }
    }
  }

  public addPing(senderId: string, x: number, y: number, type: KitchenPing['type'] = 'general') {
    const player = this.players.get(senderId);
    const ping: KitchenPing = {
      id: `ping_${Date.now()}_${Math.random()}`,
      senderId,
      senderName: player?.name || 'Đầu bếp',
      x,
      y,
      type,
      createdAt: Date.now(),
      duration: 3500,
    };
    this.pings.push(ping);
    if (this.isClientOnly) sound.playPing();
  }

  public addQuickChatMessage(senderId: string, messageVi: string) {
    const player = this.players.get(senderId);
    const msg: QuickChatMessage = {
      id: `chat_${Date.now()}_${Math.random()}`,
      senderId,
      senderName: player?.name || 'Đầu bếp',
      messageVi,
      createdAt: Date.now(),
    };
    this.quickChatLog.push(msg);
    if (this.quickChatLog.length > 20) {
      this.quickChatLog.shift();
    }
    if (this.isClientOnly) sound.playClick();
  }

  public getSnapshot(): GameSnapshot {
    return {
      version: this.version,
      timestamp: Date.now(),
      timeRemaining: this.timeRemaining,
      score: this.score,
      combo: this.combo,
      orders: [...this.orders],
      players: Array.from(this.players.values()).map((p) => ({ ...p })),
      stations: Array.from(this.grid.stations.values()).map((s) => ({ ...s })),
      pings: [...this.pings],
      isOver: this.isGameOver,
      starsEarned: this.calculateStars(),
    };
  }

  public calculateStars(): number {
    const thresholds = this.level.starThresholds;
    if (this.score >= thresholds[2]) return 3;
    if (this.score >= thresholds[1]) return 2;
    if (this.score >= thresholds[0]) return 1;
    return 0;
  }
}
