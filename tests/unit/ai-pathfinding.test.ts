import { describe, it, expect } from 'vitest';
import { GameEngine } from '@/src/game/core/game-engine';
import { AiChefController } from '@/src/game/ai/ai-chef';
import { LEVELS } from '@/src/game/levels';

describe('AI Chef System', () => {
  it('should find path around obstacles to destination', () => {
    const level = LEVELS[0];
    const engine = new GameEngine({
      level,
      playerCount: 2,
      players: [
        { id: 'p1', name: 'Người Chơi', characterId: 'chef_1', isAi: false },
        { id: 'ai_1', name: 'Phụ Bếp AI', characterId: 'chef_2', isAi: true },
      ],
    });

    const aiController = new AiChefController(engine, 'ai_1');

    // Find path from (2, 2) to (8, 4) in the kitchen
    const path = aiController.findPath(2, 2, 8, 4);

    expect(path.length).toBeGreaterThan(0);
    // Every tile in path must be walkable
    for (const step of path) {
      expect(engine.grid.isWalkable(step.x, step.y)).toBe(true);
    }
    // Destination matches target
    const finalStep = path[path.length - 1];
    expect(finalStep.x).toBe(8);
    expect(finalStep.y).toBe(4);
  });

  it('should respond to command changes', () => {
    const level = LEVELS[0];
    const engine = new GameEngine({
      level,
      playerCount: 2,
      players: [
        { id: 'p1', name: 'Người Chơi', characterId: 'chef_1', isAi: false },
        { id: 'ai_1', name: 'Phụ Bếp AI', characterId: 'chef_2', isAi: true },
      ],
    });

    const aiController = new AiChefController(engine, 'ai_1');
    expect(aiController.command).toBe('auto');

    aiController.setCommand('stay_still');
    expect(aiController.command).toBe('stay_still');

    // Run tick - should not move
    aiController.update(0.1);
    const aiPlayer = engine.players.get('ai_1')!;
    expect(aiPlayer.isMoving).toBe(false);
  });
});
