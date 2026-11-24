import { GameEngine } from '@/src/game/core/game-engine';
import { PlayerState, StationData, IngredientId, Recipe } from '@/src/types';
import { RECIPES } from '@/src/game/recipes';

export type AiCommand =
  | 'auto'
  | 'prep_ingredients'
  | 'cook_food'
  | 'wash_plates'
  | 'deliver_order'
  | 'follow_me'
  | 'stay_still';

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: PathNode;
}

export class AiChefController {
  private engine: GameEngine;
  private aiPlayerId: string;
  public command: AiCommand = 'auto';
  private currentPath: Array<{ x: number; y: number }> = [];
  private targetStation?: StationData;
  private actionTimer: number = 0;

  constructor(engine: GameEngine, aiPlayerId: string) {
    this.engine = engine;
    this.aiPlayerId = aiPlayerId;
  }

  public setCommand(cmd: AiCommand) {
    this.command = cmd;
    this.currentPath = [];
    this.targetStation = undefined;
  }

  public update(dt: number) {
    const aiPlayer = this.engine.players.get(this.aiPlayerId);
    if (!aiPlayer) return;

    if (this.command === 'stay_still') {
      this.engine.movePlayer(this.aiPlayerId, 0, 0);
      return;
    }

    if (this.command === 'follow_me') {
      this.followHumanPlayer(aiPlayer, dt);
      return;
    }

    this.actionTimer += dt;
    if (this.actionTimer >= 0.25) {
      this.actionTimer = 0;
      this.decideNextAction(aiPlayer);
    }

    this.executeMovement(aiPlayer, dt);
  }

  private followHumanPlayer(aiPlayer: PlayerState, dt: number) {
    // Find closest human player
    let closestHuman: PlayerState | null = null;
    let minDist = 9999;
    for (const p of this.engine.players.values()) {
      if (!p.isAi) {
        const dist = Math.hypot(p.x - aiPlayer.x, p.y - aiPlayer.y);
        if (dist < minDist) {
          minDist = dist;
          closestHuman = p;
        }
      }
    }

    if (closestHuman && minDist > 1.8) {
      const path = this.findPath(
        Math.floor(aiPlayer.x),
        Math.floor(aiPlayer.y),
        Math.floor(closestHuman.x),
        Math.floor(closestHuman.y),
      );
      if (path.length > 0) {
        this.currentPath = path;
      }
    } else {
      this.currentPath = [];
      this.engine.movePlayer(this.aiPlayerId, 0, 0);
    }
    this.executeMovement(aiPlayer, dt);
  }

  private decideNextAction(aiPlayer: PlayerState) {
    // 1. EMERGENCY: Fire Extinguishing
    for (const station of this.engine.grid.stations.values()) {
      if (station.isBurning) {
        this.handleFireEmergency(aiPlayer, station);
        return;
      }
    }

    // 2. EMERGENCY: Food burning on stove
    for (const station of this.engine.grid.stations.values()) {
      if (
        station.type === 'stove' &&
        station.placedItem?.type === 'cooking_tool' &&
        station.placedItem.cookingProgress >= 1.0 &&
        station.placedItem.burnProgress > 0.4
      ) {
        this.navigateToAdjacent(aiPlayer, station, () => {
          this.engine.pickupOrDrop(this.aiPlayerId);
        });
        return;
      }
    }

    // 3. Washing Dirty Plates
    if (this.command === 'wash_plates' || this.command === 'auto') {
      for (const station of this.engine.grid.stations.values()) {
        if (
          station.type === 'sink' &&
          station.placedItem?.type === 'plate' &&
          station.placedItem.isDirty
        ) {
          this.navigateToAdjacent(aiPlayer, station, () => {
            this.engine.interact(this.aiPlayerId);
          });
          return;
        }
      }
    }

    // 4. Work on Active Orders
    if (this.engine.orders.length > 0) {
      const currentOrder = this.engine.orders[0];
      const recipe = RECIPES[currentOrder.recipeId];
      if (recipe) {
        this.progressOrder(aiPlayer, recipe);
        return;
      }
    }

    // Idle
    this.engine.movePlayer(this.aiPlayerId, 0, 0);
  }

  private handleFireEmergency(aiPlayer: PlayerState, burningStation: StationData) {
    if (aiPlayer.heldItem?.type !== 'fire_extinguisher') {
      // Find extinguisher
      for (const station of this.engine.grid.stations.values()) {
        if (
          station.type === 'fire_extinguisher_stand' ||
          station.placedItem?.type === 'fire_extinguisher'
        ) {
          this.navigateToAdjacent(aiPlayer, station, () => {
            this.engine.pickupOrDrop(this.aiPlayerId);
          });
          return;
        }
      }
    } else {
      // Spray burning station
      this.navigateToAdjacent(aiPlayer, burningStation, () => {
        this.engine.interact(this.aiPlayerId);
      });
    }
  }

  private progressOrder(aiPlayer: PlayerState, recipe: Recipe) {
    // A) If AI is holding a plate with completed dish -> deliver to serving
    if (aiPlayer.heldItem?.type === 'plate' && !aiPlayer.heldItem.isDirty) {
      if (aiPlayer.heldItem.items.length === recipe.ingredients.length) {
        // Go to serving station
        for (const station of this.engine.grid.stations.values()) {
          if (station.type === 'serving') {
            this.navigateToAdjacent(aiPlayer, station, () => {
              this.engine.pickupOrDrop(this.aiPlayerId);
            });
            return;
          }
        }
      }
    }

    // B) If holding chopped ingredient -> place on plate or cook
    if (aiPlayer.heldItem?.type === 'ingredient') {
      const ing = aiPlayer.heldItem;
      if (ing.state === 'raw') {
        // Take to cutting board
        for (const station of this.engine.grid.stations.values()) {
          if (station.type === 'cutting_board' && !station.placedItem) {
            this.navigateToAdjacent(aiPlayer, station, () => {
              this.engine.pickupOrDrop(this.aiPlayerId);
            });
            return;
          }
        }
      } else if (ing.state === 'chopped') {
        // Find empty counter or plate to assemble
        for (const station of this.engine.grid.stations.values()) {
          if (station.type === 'counter') {
            this.navigateToAdjacent(aiPlayer, station, () => {
              this.engine.pickupOrDrop(this.aiPlayerId);
            });
            return;
          }
        }
      }
      return;
    }

    // C) If cutting board has raw ingredient -> chop it
    for (const station of this.engine.grid.stations.values()) {
      if (
        station.type === 'cutting_board' &&
        station.placedItem?.type === 'ingredient' &&
        station.placedItem.state === 'raw'
      ) {
        this.navigateToAdjacent(aiPlayer, station, () => {
          this.engine.interact(this.aiPlayerId);
        });
        return;
      }
    }

    // D) Fetch needed ingredient from ingredient box
    if (!aiPlayer.heldItem) {
      const neededIng = recipe.ingredients[0]?.ingredientId;
      if (neededIng) {
        for (const station of this.engine.grid.stations.values()) {
          if (station.type === 'ingredient_box' && station.ingredientId === neededIng) {
            this.navigateToAdjacent(aiPlayer, station, () => {
              this.engine.pickupOrDrop(this.aiPlayerId);
            });
            return;
          }
        }
      }
    }
  }

  private navigateToAdjacent(
    aiPlayer: PlayerState,
    station: StationData,
    onArrival: () => void,
  ) {
    this.targetStation = station;

    // Check if already adjacent and facing station
    const facing = this.engine.grid.getFacingCell(aiPlayer.x, aiPlayer.y, aiPlayer.direction);
    if (facing.x === station.x && facing.y === station.y) {
      onArrival();
      return;
    }

    // Find best adjacent walkable tile
    const adjacents = [
      { x: station.x + 1, y: station.y },
      { x: station.x - 1, y: station.y },
      { x: station.x, y: station.y + 1 },
      { x: station.x, y: station.y - 1 },
    ].filter((pos) => this.engine.grid.isWalkable(pos.x, pos.y));

    if (adjacents.length === 0) return;

    // Pick closest adjacent
    adjacents.sort((a, b) => {
      const distA = Math.hypot(a.x + 0.5 - aiPlayer.x, a.y + 0.5 - aiPlayer.y);
      const distB = Math.hypot(b.x + 0.5 - aiPlayer.x, b.y + 0.5 - aiPlayer.y);
      return distA - distB;
    });

    const targetPos = adjacents[0];
    const path = this.findPath(
      Math.floor(aiPlayer.x),
      Math.floor(aiPlayer.y),
      targetPos.x,
      targetPos.y,
    );

    if (path.length > 0) {
      this.currentPath = path;
    }
  }

  private executeMovement(aiPlayer: PlayerState, dt: number) {
    if (this.currentPath.length === 0) {
      // If we have reached destination and have target station, face it
      if (this.targetStation) {
        const dx = this.targetStation.x + 0.5 - aiPlayer.x;
        const dy = this.targetStation.y + 0.5 - aiPlayer.y;
        this.engine.movePlayer(this.aiPlayerId, dx, dy);
        this.engine.movePlayer(this.aiPlayerId, 0, 0); // stop
      }
      return;
    }

    const nextTile = this.currentPath[0];
    const targetX = nextTile.x + 0.5;
    const targetY = nextTile.y + 0.5;

    const dx = targetX - aiPlayer.x;
    const dy = targetY - aiPlayer.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.15) {
      this.currentPath.shift();
      if (this.currentPath.length === 0) {
        this.engine.movePlayer(this.aiPlayerId, 0, 0);
      }
    } else {
      this.engine.movePlayer(this.aiPlayerId, dx / dist, dy / dist);
    }
  }

  /**
   * Deterministic A* Pathfinding algorithm on grid.
   */
  public findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
  ): Array<{ x: number; y: number }> {
    if (startX === targetX && startY === targetY) return [];

    const openList: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
      x: startX,
      y: startY,
      g: 0,
      h: Math.abs(targetX - startX) + Math.abs(targetY - startY),
      f: 0,
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    const key = (x: number, y: number) => `${x},${y}`;

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      if (current.x === targetX && current.y === targetY) {
        // Reconstruct path
        const path: Array<{ x: number; y: number }> = [];
        let curr: PathNode | undefined = current;
        while (curr && (curr.x !== startX || curr.y !== startY)) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path;
      }

      closedSet.add(key(current.x, current.y));

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const n of neighbors) {
        if (!this.engine.grid.isWalkable(n.x, n.y)) continue;
        if (closedSet.has(key(n.x, n.y))) continue;

        const gScore = current.g + 1;
        let neighborNode = openList.find((node) => node.x === n.x && node.y === n.y);

        if (!neighborNode) {
          neighborNode = {
            x: n.x,
            y: n.y,
            g: gScore,
            h: Math.abs(targetX - n.x) + Math.abs(targetY - n.y),
            f: 0,
            parent: current,
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openList.push(neighborNode);
        } else if (gScore < neighborNode.g) {
          neighborNode.g = gScore;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    return [];
  }
}
