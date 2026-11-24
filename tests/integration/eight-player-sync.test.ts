import { describe, it, expect } from 'vitest';
import { roomManager } from '@/src/server/rooms/room-manager';

describe('Eight-Player Multiplayer Synchronization', () => {
  it('should support 8 simultaneous connected players and synchronize actions', () => {
    // 1. Host creates room for 8 players
    const { room, memberId: hostId, memberToken: hostToken } = roomManager.createRoom({
      name: 'Đại Chiến 8 Người',
      hostName: 'Host Bếp Trưởng',
      maxPlayers: 8,
      levelId: 'level_5_4', // Chaotic kitchen for 8 players
    });

    const players: Array<{ id: string; token: string; name: string }> = [
      { id: hostId, token: hostToken, name: 'Host Bếp Trưởng' },
    ];

    // 2. Connect 7 additional real players
    for (let i = 2; i <= 8; i++) {
      const join = roomManager.joinRoom(room.code, {
        name: `Đầu Bếp ${i}`,
        characterId: `chef_${i}`,
      });
      expect('error' in join).toBe(false);
      if (!('error' in join)) {
        players.push({
          id: join.memberId,
          token: join.memberToken,
          name: `Đầu Bếp ${i}`,
        });
      }
    }

    expect(players.length).toBe(8);
    expect(room.members.size).toBe(8);

    // 3. Mark all 7 other players as ready
    for (let i = 1; i < players.length; i++) {
      const ok = roomManager.setReady(room.id, players[i].id, players[i].token, true);
      expect(ok).toBe(true);
    }

    // 4. Host starts match
    const startResult = roomManager.startMatch(room.id, hostToken);
    expect(startResult.success).toBe(true);
    expect(room.status).toBe('playing');
    expect(room.engine).toBeDefined();
    expect(room.engine?.players.size).toBe(8);

    // 5. Concurrently submit actions for all 8 players
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const dirX = (i % 2 === 0 ? 1 : -1) * 0.8;
      const dirY = (i % 3 === 0 ? 1 : -1) * 0.8;

      const syncResult = roomManager.syncPlayerAction(room.id, p.id, p.token, {
        dx: dirX,
        dy: dirY,
        dash: i === 2, // player 3 dashes
        pickupDrop: i === 0, // host tries pickup
      });

      expect(syncResult.error).toBeUndefined();
      expect(syncResult.snapshot).toBeDefined();
      expect(syncResult.snapshot?.players.length).toBe(8);
    }

    // 6. Verify state snapshot consistency
    const engineSnap = room.engine!.getSnapshot();
    expect(engineSnap.players.length).toBe(8);
    expect(engineSnap.timeRemaining).toBeGreaterThan(0);

    // 7. Test Disconnection & Reconnection for player 4
    const player4 = players[3];
    const memberObj = room.members.get(player4.id)!;
    expect(memberObj.connected).toBe(true);

    // Simulate temporary disconnect
    memberObj.connected = false;

    // Player 4 reconnects using their session token and syncs an action
    const reconnectSync = roomManager.syncPlayerAction(room.id, player4.id, player4.token, {
      dx: 0,
      dy: 0,
      chat: 'Tôi đã kết nối lại!',
    });

    expect(reconnectSync.error).toBeUndefined();
    expect(memberObj.connected).toBe(true);
    expect(room.engine?.quickChatLog.length).toBeGreaterThan(0);
  });
});
