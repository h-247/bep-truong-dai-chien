import { StationData, StationType, IngredientId, LevelConfig } from '@/src/types';
import { INGREDIENT_CHAR_MAP } from '@/src/game/levels';

export class KitchenGrid {
  public width: number;
  public height: number;
  public stations: Map<string, StationData> = new Map();
  public walkableGrid: boolean[][] = [];

  constructor(level: LevelConfig) {
    this.width = level.gridWidth;
    this.height = level.gridHeight;
    this.initGrid(level.layout);
  }

  private key(x: number, y: number): string {
    return `${x},${y}`;
  }

  private initGrid(layout: string[]) {
    this.walkableGrid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => true),
    );

    for (let y = 0; y < this.height; y++) {
      const row = layout[y] || '';
      for (let x = 0; x < this.width; x++) {
        const char = row[x] || '.';

        if (char === '.') {
          // Walkable floor
          this.walkableGrid[y][x] = true;
          continue;
        }

        // Non-walkable obstacle / station
        this.walkableGrid[y][x] = false;

        let stationType: StationType = 'counter';
        let ingredientId: IngredientId | undefined = undefined;

        if (char === 'W') {
          stationType = 'wall';
        } else if (char === 'C') {
          stationType = 'counter';
        } else if (char === 'B') {
          stationType = 'cutting_board';
        } else if (char === 'S') {
          stationType = 'stove';
        } else if (char === 'O') {
          stationType = 'oven';
        } else if (char === 'R') {
          stationType = 'rice_cooker';
        } else if (char === 'F') {
          stationType = 'deep_fryer';
        } else if (char === 'P') {
          stationType = 'plate_dispenser';
        } else if (char === 'K') {
          stationType = 'sink';
        } else if (char === 'D') {
          stationType = 'serving';
        } else if (char === 'T') {
          stationType = 'trash';
        } else if (char === 'X') {
          stationType = 'fire_extinguisher_stand';
        } else if (INGREDIENT_CHAR_MAP[char]) {
          stationType = 'ingredient_box';
          ingredientId = INGREDIENT_CHAR_MAP[char] as IngredientId;
        }

        const station: StationData = {
          x,
          y,
          type: stationType,
          ingredientId,
          placedItem: null,
          progress: 0,
          isOperating: false,
          isBurning: false,
          burnIntensity: 0,
        };

        // If it's a stove, pre-place a pan or pot
        if (stationType === 'stove') {
          station.placedItem = {
            type: 'cooking_tool',
            id: `pan_${x}_${y}`,
            toolType: 'pan',
            contents: [],
            isCooking: false,
            cookingProgress: 0,
            burnProgress: 0,
          };
        }

        this.stations.set(this.key(x, y), station);
      }
    }
  }

  public getStation(x: number, y: number): StationData | undefined {
    return this.stations.get(this.key(x, y));
  }

  public isWalkable(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    // Check if station is on fire
    const station = this.getStation(x, y);
    if (station && station.isBurning) {
      return false;
    }
    return this.walkableGrid[y][x];
  }

  /**
   * Continuous collision check for circle chef against obstacles.
   * Player radius is typically 0.35 tiles.
   */
  public resolvePlayerCollision(
    x: number,
    y: number,
    radius: number = 0.35,
  ): { x: number; y: number } {
    let resolvedX = Math.max(radius, Math.min(this.width - radius, x));
    let resolvedY = Math.max(radius, Math.min(this.height - radius, y));

    const minGridX = Math.max(0, Math.floor(resolvedX - radius));
    const maxGridX = Math.min(this.width - 1, Math.floor(resolvedX + radius));
    const minGridY = Math.max(0, Math.floor(resolvedY - radius));
    const maxGridY = Math.min(this.height - 1, Math.floor(resolvedY + radius));

    for (let gy = minGridY; gy <= maxGridY; gy++) {
      for (let gx = minGridX; gx <= maxGridX; gx++) {
        if (!this.walkableGrid[gy][gx]) {
          // AABB vs Circle collision resolution
          const closestX = Math.max(gx, Math.min(resolvedX, gx + 1));
          const closestY = Math.max(gy, Math.min(resolvedY, gy + 1));
          const distX = resolvedX - closestX;
          const distY = resolvedY - closestY;
          const distSq = distX * distX + distY * distY;

          if (distSq < radius * radius && distSq > 0.00001) {
            const dist = Math.sqrt(distSq);
            const overlap = radius - dist;
            resolvedX += (distX / dist) * overlap;
            resolvedY += (distY / dist) * overlap;
          }
        }
      }
    }

    return { x: resolvedX, y: resolvedY };
  }

  /**
   * Returns the grid cell immediately in front of the player based on orientation.
   */
  public getFacingCell(
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right',
  ): { x: number; y: number } {
    let targetX = Math.floor(x);
    let targetY = Math.floor(y);

    switch (direction) {
      case 'up':
        targetY = Math.floor(y - 0.6);
        break;
      case 'down':
        targetY = Math.floor(y + 0.6);
        break;
      case 'left':
        targetX = Math.floor(x - 0.6);
        break;
      case 'right':
        targetX = Math.floor(x + 0.6);
        break;
    }

    targetX = Math.max(0, Math.min(this.width - 1, targetX));
    targetY = Math.max(0, Math.min(this.height - 1, targetY));

    return { x: targetX, y: targetY };
  }
}
