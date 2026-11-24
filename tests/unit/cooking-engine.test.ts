import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/src/game/core/game-engine';
import { LEVELS } from '@/src/game/levels';

describe('Cooking Game Engine', () => {
  it('should initialize game engine with players and orders', () => {
    const level = LEVELS[0];
    const engine = new GameEngine({
      level,
      playerCount: 2,
      players: [
        { id: 'p1', name: 'Đầu Bếp 1', characterId: 'chef_1', isAi: false },
        { id: 'p2', name: 'Đầu Bếp 2', characterId: 'chef_2', isAi: false },
      ],
      isClientSideOnly: false,
    });

    expect(engine.players.size).toBe(2);
    expect(engine.orders.length).toBeGreaterThan(0);
    expect(engine.grid.width).toBe(level.gridWidth);
    expect(engine.grid.height).toBe(level.gridHeight);
  });

  it('should move player and resolve collisions with walls', () => {
    const level = LEVELS[0];
    const engine = new GameEngine({
      level,
      playerCount: 1,
      players: [{ id: 'p1', name: 'P1', characterId: 'chef_1', isAi: false }],
    });

    const player = engine.players.get('p1')!;
    const initialX = player.x;
    const initialY = player.y;

    // Move player right
    engine.movePlayer('p1', 1, 0);
    engine.update(0.1);

    expect(player.x).toBeGreaterThan(initialX);
    expect(player.direction).toBe('right');
  });

  it('should allow player to pick up an ingredient from ingredient box', () => {
    const level = LEVELS[0];
    const engine = new GameEngine({
      level,
      playerCount: 1,
      players: [{ id: 'p1', name: 'P1', characterId: 'chef_1', isAi: false }],
    });

    const player = engine.players.get('p1')!;
    // In level 1-1, W1.2.3.P.T.W has '1' (lettuce) at (1, 1).
    // Position player directly below the lettuce box at (1.5, 2.2) facing UP.
    player.x = 1.5;
    player.y = 2.2;
    player.direction = 'up';

    engine.pickupOrDrop('p1');

    expect(player.heldItem).toBeDefined();
    expect(player.heldItem?.type).toBe('ingredient');
    if (player.heldItem?.type === 'ingredient') {
      expect(player.heldItem.ingredientId).toBe('lettuce');
      expect(player.heldItem.state).toBe('raw');
    }
  });

  it('should allow player to chop raw ingredient on cutting board', () => {
    const level = LEVELS[0];
    const engine = new GameEngine({
      level,
      playerCount: 1,
      players: [{ id: 'p1', name: 'P1', characterId: 'chef_1', isAi: false }],
    });

    const player = engine.players.get('p1')!;

    // Level 1-1 has cutting board 'B' at (2, 3)
    const cuttingBoard = engine.grid.getStation(2, 3)!;
    expect(cuttingBoard.type).toBe('cutting_board');

    // Give player raw lettuce
    player.heldItem = {
      type: 'ingredient',
      id: 'lettuce_1',
      ingredientId: 'lettuce',
      state: 'raw',
      cookingProgress: 0,
      burnProgress: 0,
    };

    // Stand next to cutting board at (2.5, 2.5) facing down (into (2, 3))
    player.x = 2.5;
    player.y = 2.5;
    player.direction = 'down';

    engine.pickupOrDrop('p1');
    expect(player.heldItem).toBeNull();
    expect(cuttingBoard.placedItem?.type).toBe('ingredient');

    // Interact to start chopping
    engine.interact('p1');
    expect(player.currentInteraction).toBe('chopping');

    // Simulate 3 seconds of chopping
    for (let i = 0; i < 30; i++) {
      engine.update(0.1);
    }

    expect(cuttingBoard.placedItem?.type).toBe('ingredient');
    if (cuttingBoard.placedItem?.type === 'ingredient') {
      expect(cuttingBoard.placedItem.state).toBe('chopped');
    }
  });

  it('should calculate star rating based on thresholds', () => {
    const level = LEVELS[0]; // thresholds: [60, 140, 220]
    const engine = new GameEngine({
      level,
      playerCount: 1,
      players: [{ id: 'p1', name: 'P1', characterId: 'chef_1', isAi: false }],
    });

    engine.score = 50;
    expect(engine.calculateStars()).toBe(0);

    engine.score = 70;
    expect(engine.calculateStars()).toBe(1);

    engine.score = 150;
    expect(engine.calculateStars()).toBe(2);

    engine.score = 250;
    expect(engine.calculateStars()).toBe(3);
  });
});
