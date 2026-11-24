import {
  GameSnapshot,
  HeldItem,
  IngredientId,
  PlayerState,
  StationData,
  KitchenPing,
} from '@/src/types';
import { getChefById } from '@/src/game/characters';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private localPlayerId?: string;
  private animTimer: number = 0;
  private floatingScores: Array<{
    x: number;
    y: number;
    text: string;
    color: string;
    createdAt: number;
  }> = [];

  constructor(canvas: HTMLCanvasElement, localPlayerId?: string) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2d context');
    this.ctx = context;
    this.localPlayerId = localPlayerId;
  }

  public setLocalPlayerId(id?: string) {
    this.localPlayerId = id;
  }

  public addFloatingScore(x: number, y: number, text: string, color: string = '#22C55E') {
    this.floatingScores.push({
      x,
      y,
      text,
      color,
      createdAt: Date.now(),
    });
  }

  public render(
    snapshot: GameSnapshot,
    gridWidth: number,
    gridHeight: number,
    dt: number = 0.016,
  ) {
    this.animTimer += dt;
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Responsive scaling: calculate tileSize to fit the canvas viewport
    const tileSize = Math.min(
      canvas.width / gridWidth,
      canvas.height / gridHeight,
    );

    const offsetX = (canvas.width - gridWidth * tileSize) / 2;
    const offsetY = (canvas.height - gridHeight * tileSize) / 2;

    // Clear background
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // 1. Render Floor Grid
    this.renderFloor(ctx, gridWidth, gridHeight, tileSize);

    // 2. Render Stations
    for (const station of snapshot.stations) {
      this.renderStation(ctx, station, tileSize);
    }

    // 3. Render Players
    // Sort players by Y coordinate for correct depth layering
    const sortedPlayers = [...snapshot.players].sort((a, b) => a.y - b.y);
    for (const player of sortedPlayers) {
      this.renderPlayer(ctx, player, tileSize);
    }

    // 4. Render Kitchen Fires & Smoke
    for (const station of snapshot.stations) {
      if (station.isBurning) {
        this.renderFire(ctx, station.x, station.y, tileSize, station.burnIntensity || 0.5);
      }
    }

    // 5. Render Pings
    for (const ping of snapshot.pings) {
      this.renderPing(ctx, ping, tileSize);
    }

    // 6. Render Floating Score Popups
    this.renderFloatingScores(ctx, tileSize);

    ctx.restore();
  }

  private renderFloor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
  ) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Subtle checkerboard pattern in dark aesthetic
        ctx.fillStyle = (x + y) % 2 === 0 ? '#262626' : '#222222';
        ctx.fillRect(x * size, y * size, size, size);

        // Grid border
        ctx.strokeStyle = '#2E2E2E';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * size, y * size, size, size);
      }
    }
  }

  private renderStation(
    ctx: CanvasRenderingContext2D,
    station: StationData,
    size: number,
  ) {
    const px = station.x * size;
    const py = station.y * size;

    if (station.type === 'wall') {
      ctx.fillStyle = '#171717';
      ctx.fillRect(px, py, size, size);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, size, size);
      return;
    }

    // Counter Base
    ctx.fillStyle = '#383838';
    ctx.beginPath();
    ctx.roundRect(px + 2, py + 2, size - 4, size - 4, 6);
    ctx.fill();

    // Top surface
    ctx.fillStyle = '#4A4A4A';
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 4, size - 8, size - 8, 4);
    ctx.fill();

    // Station specific details
    switch (station.type) {
      case 'cutting_board':
        // Wooden board
        ctx.fillStyle = '#A16207';
        ctx.fillRect(px + 8, py + 8, size - 16, size - 16);
        ctx.fillStyle = '#CA8A04';
        ctx.fillRect(px + 10, py + 10, size - 20, size - 20);
        // Knife icon
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(px + size - 14, py + 10, 4, size - 20);
        break;

      case 'stove':
        // Metal burner ring
        ctx.fillStyle = '#1E1E1E';
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Small flame when cooking
        if (station.placedItem?.type === 'cooking_tool' && station.placedItem.isCooking) {
          ctx.fillStyle = '#3B82F6'; // Blue gas flame
          ctx.beginPath();
          ctx.arc(px + size / 2, py + size / 2, size * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'oven':
        // Oven glass window
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(px + 8, py + 8, size - 16, size - 16);
        ctx.fillStyle = '#EA580C'; // Warm glow
        ctx.fillRect(px + 12, py + 12, size - 24, size - 24);
        break;

      case 'rice_cooker':
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10B981';
        ctx.fillRect(px + size / 2 - 4, py + size / 2 - 4, 8, 8);
        break;

      case 'deep_fryer':
        // Vat of oil
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(px + 8, py + 8, size - 16, size - 16);
        ctx.fillStyle = '#EAB308'; // Golden oil
        ctx.fillRect(px + 10, py + 10, size - 20, size - 20);
        break;

      case 'plate_dispenser':
        // Stack of clean white porcelain plates
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#E2E8F0';
          ctx.beginPath();
          ctx.arc(px + size / 2, py + size / 2 - i * 3, size * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;

      case 'sink':
        // Basin
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(px + 8, py + 8, size - 16, size - 16);
        ctx.fillStyle = '#0284C7'; // Water
        ctx.fillRect(px + 10, py + 10, size - 20, size - 20);
        // Faucet
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(px + size / 2 - 3, py + 4, 6, 10);
        break;

      case 'serving':
        // Conveyor belt
        ctx.fillStyle = '#166534';
        ctx.fillRect(px + 4, py + 4, size - 8, size - 8);
        // White arrows pointing down
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.floor(size * 0.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('➔', px + size / 2, py + size / 2);
        break;

      case 'trash':
        // Trash bin
        ctx.fillStyle = '#4B5563';
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size * 0.34, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#EF4444';
        ctx.font = `bold ${Math.floor(size * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🗑', px + size / 2, py + size / 2);
        break;

      case 'fire_extinguisher_stand':
        // Stand
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.floor(size * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧯', px + size / 2, py + size / 2);
        break;

      case 'ingredient_box':
        // Wooden crate
        ctx.fillStyle = '#78350F';
        ctx.fillRect(px + 4, py + 4, size - 8, size - 8);
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 4, py + 4, size - 8, size - 8);

        // Ingredient Icon / Label
        if (station.ingredientId) {
          this.renderIngredientIcon(ctx, station.ingredientId, px + size / 2, py + size / 2, size * 0.3);
        }
        break;
    }

    // Render placed item on top of station (if any)
    if (station.placedItem) {
      this.renderHeldItem(ctx, station.placedItem, px + size / 2, py + size / 2, size * 0.6);
    }
  }

  private renderPlayer(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    size: number,
  ) {
    const px = player.x * size;
    const py = player.y * size;
    const radius = size * 0.35;
    const chef = getChefById(player.characterId);
    const isLocal = player.id === this.localPlayerId;

    // 1. Local Player Halo
    if (isLocal) {
      ctx.beginPath();
      ctx.arc(px, py, radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Walking animation bounce
    const bounce = player.isMoving ? Math.sin(this.animTimer * 12) * 3 : 0;

    // 2. Chef Body (Circular base)
    ctx.beginPath();
    ctx.arc(px, py + bounce, radius, 0, Math.PI * 2);
    ctx.fillStyle = chef.color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Chef Apron
    ctx.beginPath();
    ctx.arc(px, py + bounce + 2, radius * 0.7, 0, Math.PI);
    ctx.fillStyle = chef.apronColor;
    ctx.fill();

    // 4. Chef Hat
    ctx.beginPath();
    ctx.arc(px, py - radius * 0.5 + bounce, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = chef.hatColor;
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Chef Face / Direction Eyes
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    switch (player.direction) {
      case 'up':
        eyeOffsetY = -radius * 0.3;
        break;
      case 'down':
        eyeOffsetY = radius * 0.2;
        break;
      case 'left':
        eyeOffsetX = -radius * 0.3;
        break;
      case 'right':
        eyeOffsetX = radius * 0.3;
        break;
    }

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(px + eyeOffsetX - 4, py + eyeOffsetY + bounce, 2.5, 0, Math.PI * 2);
    ctx.arc(px + eyeOffsetX + 4, py + eyeOffsetY + bounce, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Held Item
    if (player.heldItem) {
      const itemX = px + (player.direction === 'right' ? radius * 0.9 : player.direction === 'left' ? -radius * 0.9 : 0);
      const itemY = py + (player.direction === 'down' ? radius * 0.9 : player.direction === 'up' ? -radius * 0.9 : 0) + bounce;
      this.renderHeldItem(ctx, player.heldItem, itemX, itemY, size * 0.5);
    }

    // 7. Interaction Progress Bar (chopping / washing / fire extinguishing)
    if (player.currentInteraction !== 'idle' && player.interactionProgress > 0) {
      const barW = size * 0.8;
      const barH = 7;
      const barX = px - barW / 2;
      const barY = py - radius * 1.6;

      ctx.fillStyle = '#000000';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      ctx.fillStyle = '#3B82F6'; // Blue background
      ctx.fillRect(barX, barY, barW, barH);

      ctx.fillStyle = '#22C55E'; // Green progress
      ctx.fillRect(barX, barY, barW * player.interactionProgress, barH);
    }

    // 8. Player Name Tag
    ctx.fillStyle = isLocal ? '#FACC15' : '#ECECEC';
    ctx.font = `bold ${Math.max(10, Math.floor(size * 0.22))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const tagText = player.isAi ? `${player.name} (AI)` : player.name;
    ctx.fillText(tagText, px, py - radius * 1.1 + bounce);
  }

  private renderHeldItem(
    ctx: CanvasRenderingContext2D,
    item: HeldItem,
    x: number,
    y: number,
    size: number,
  ) {
    if (!item) return;

    if (item.type === 'ingredient') {
      this.renderIngredient(ctx, item, x, y, size);
    } else if (item.type === 'plate') {
      this.renderPlate(ctx, item, x, y, size);
    } else if (item.type === 'fire_extinguisher') {
      ctx.font = `${Math.floor(size * 0.9)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧯', x, y);
    } else if (item.type === 'cooking_tool') {
      this.renderCookingTool(ctx, item, x, y, size);
    }
  }

  private renderIngredient(
    ctx: CanvasRenderingContext2D,
    item: { ingredientId: IngredientId; state: string },
    x: number,
    y: number,
    size: number,
  ) {
    this.renderIngredientIcon(ctx, item.ingredientId, x, y, size * 0.8);

    // State badge (chopped / cooked / burned)
    if (item.state === 'chopped') {
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(x + size * 0.35, y - size * 0.35, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.state === 'cooked') {
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(x + size * 0.35, y - size * 0.35, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.state === 'overcooked' || item.state === 'burned') {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(x + size * 0.35, y - size * 0.35, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderPlate(
    ctx: CanvasRenderingContext2D,
    plate: { isDirty: boolean; items: Array<{ ingredientId: IngredientId; state: string }> },
    x: number,
    y: number,
    size: number,
  ) {
    // Plate Rim
    ctx.beginPath();
    ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = plate.isDirty ? '#713F12' : '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = plate.isDirty ? '#451A03' : '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // If dirty, draw grease spots
    if (plate.isDirty) {
      ctx.fillStyle = '#3F1D0B';
      ctx.beginPath();
      ctx.arc(x - 3, y - 2, 4, 0, Math.PI * 2);
      ctx.arc(x + 4, y + 3, 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Plate Inner Ring
    ctx.beginPath();
    ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();

    // Render contents on plate
    const count = plate.items.length;
    if (count === 1) {
      this.renderIngredientIcon(ctx, plate.items[0].ingredientId, x, y, size * 0.35);
    } else if (count > 1) {
      const radius = size * 0.18;
      plate.items.forEach((ing, idx) => {
        const angle = (idx / count) * Math.PI * 2;
        const ix = x + Math.cos(angle) * radius;
        const iy = y + Math.sin(angle) * radius;
        this.renderIngredientIcon(ctx, ing.ingredientId, ix, iy, size * 0.22);
      });
    }
  }

  private renderCookingTool(
    ctx: CanvasRenderingContext2D,
    tool: { toolType: string; contents: Array<{ ingredientId: IngredientId; state: string }>; cookingProgress: number; isCooking: boolean },
    x: number,
    y: number,
    size: number,
  ) {
    // Pan circle
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pan handle
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + size * 0.35, y - 3, size * 0.3, 6);

    // Cooking progress arc
    if (tool.isCooking && tool.cookingProgress < 1.0) {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.44, -Math.PI / 2, -Math.PI / 2 + tool.cookingProgress * Math.PI * 2);
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Contents inside tool
    if (tool.contents.length > 0) {
      this.renderIngredientIcon(ctx, tool.contents[0].ingredientId, x, y, size * 0.28);
    }
  }

  private renderIngredientIcon(
    ctx: CanvasRenderingContext2D,
    id: IngredientId,
    x: number,
    y: number,
    size: number,
  ) {
    ctx.save();
    ctx.translate(x, y);

    switch (id) {
      case 'tomato':
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22C55E'; // Stem
        ctx.fillRect(-size * 0.2, -size * 1.1, size * 0.4, size * 0.4);
        break;

      case 'lettuce':
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#86EFAC';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'cucumber':
        ctx.fillStyle = '#15803D';
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bun':
        ctx.fillStyle = '#D97706'; // Golden brown bun
        ctx.beginPath();
        ctx.arc(0, -size * 0.1, size, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#FDE68A'; // Sesame seeds
        ctx.fillRect(-size * 0.3, -size * 0.6, 2, 2);
        ctx.fillRect(size * 0.2, -size * 0.7, 2, 2);
        break;

      case 'beef':
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'cheese':
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.moveTo(-size, size);
        ctx.lineTo(size, size);
        ctx.lineTo(0, -size);
        ctx.closePath();
        ctx.fill();
        break;

      case 'dough':
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'mushroom':
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.arc(0, -size * 0.2, size * 0.9, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-size * 0.25, -size * 0.2, size * 0.5, size * 0.8);
        break;

      case 'rice':
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.9, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'seaweed':
        ctx.fillStyle = '#064E3B';
        ctx.fillRect(-size * 0.8, -size * 0.8, size * 1.6, size * 1.6);
        break;

      case 'fish':
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(size * 0.8, 0);
        ctx.lineTo(size * 1.3, -size * 0.4);
        ctx.lineTo(size * 1.3, size * 0.4);
        ctx.closePath();
        ctx.fill();
        break;

      case 'egg':
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.7, size, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'vegetables':
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#EA580C'; // Carrot bit
        ctx.fillRect(-size * 0.4, -size * 0.3, size * 0.3, size * 0.3);
        break;

      case 'pasta':
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.6, 0, Math.PI);
        ctx.stroke();
        break;

      case 'onion':
        ctx.fillStyle = '#A855F7';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'potato':
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.7, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  private renderFire(
    ctx: CanvasRenderingContext2D,
    gridX: number,
    gridY: number,
    size: number,
    intensity: number,
  ) {
    const px = gridX * size + size / 2;
    const py = gridY * size + size / 2;

    // Flickering fire particles
    const flameCount = 5;
    for (let i = 0; i < flameCount; i++) {
      const offsetX = Math.sin(this.animTimer * 15 + i * 2) * size * 0.25;
      const offsetY = -Math.abs(Math.cos(this.animTimer * 10 + i)) * size * 0.4;
      const radius = size * 0.25 * intensity;

      ctx.beginPath();
      ctx.arc(px + offsetX, py + offsetY, radius, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(234, 179, 8, 0.8)';
      ctx.fill();
    }
  }

  private renderPing(
    ctx: CanvasRenderingContext2D,
    ping: KitchenPing,
    size: number,
  ) {
    const px = ping.x * size;
    const py = ping.y * size;

    const age = (Date.now() - ping.createdAt) / 1000;
    const pulse = (age % 1.0) * size * 0.8;
    const alpha = Math.max(0, 1 - (Date.now() - ping.createdAt) / ping.duration);

    // Expanding sonar ring
    ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Center icon
    ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // Ping sender text
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${ping.senderName}`, px, py - 14);
  }

  private renderFloatingScores(ctx: CanvasRenderingContext2D, size: number) {
    const now = Date.now();
    for (let i = this.floatingScores.length - 1; i >= 0; i--) {
      const fs = this.floatingScores[i];
      const age = (now - fs.createdAt) / 1000;
      if (age > 1.5) {
        this.floatingScores.splice(i, 1);
        continue;
      }

      const alpha = Math.max(0, 1 - age / 1.5);
      const floatY = fs.y * size - age * 40;

      ctx.fillStyle = fs.color;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = alpha;
      ctx.fillText(fs.text, fs.x * size, floatY);
      ctx.globalAlpha = 1.0;
    }
  }
}
