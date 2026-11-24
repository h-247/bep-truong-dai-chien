import { describe, it, expect } from 'vitest';
import { roomManager } from '@/src/server/rooms/room-manager';

describe('Multiplayer Room Management', () => {
  it('should create room with valid code and host member', () => {
    const { room, memberId, memberToken } = roomManager.createRoom({
      name: 'Bếp Test 1',
      hostName: 'Chủ Phòng',
      maxPlayers: 8,
      levelId: 'level_1_1',
    });

    expect(room.id).toBeDefined();
    expect(room.code.length).toBe(6);
    expect(room.members.size).toBe(1);
    expect(room.hostId).toBe(memberId);

    const hostMember = room.members.get(memberId);
    expect(hostMember?.isHost).toBe(true);
    expect(hostMember?.token).toBe(memberToken);
  });

  it('should allow players to join using room code', () => {
    const { room } = roomManager.createRoom({
      name: 'Bếp Test 2',
      hostName: 'Chủ Phòng',
      maxPlayers: 4,
    });

    const joinResult = roomManager.joinRoom(room.code, {
      name: 'Người Chơi 2',
      characterId: 'chef_2',
    });

    expect('error' in joinResult).toBe(false);
    if (!('error' in joinResult)) {
      expect(joinResult.room.members.size).toBe(2);
      expect(joinResult.memberToken).toBeTruthy();
    }
  });

  it('should enforce 8 player capacity and reject 9th player', () => {
    const { room } = roomManager.createRoom({
      name: 'Phòng 8 Người',
      hostName: 'Chủ Phòng',
      maxPlayers: 8,
    });

    // Add 7 more players to reach exactly 8 players
    for (let i = 2; i <= 8; i++) {
      const res = roomManager.joinRoom(room.code, {
        name: `Đầu Bếp ${i}`,
        characterId: `chef_${i}`,
      });
      expect('error' in res).toBe(false);
    }

    expect(room.members.size).toBe(8);

    // Attempt to add a 9th player -> MUST FAIL
    const ninthResult = roomManager.joinRoom(room.code, {
      name: 'Đầu Bếp 9',
    });

    expect('error' in ninthResult).toBe(true);
    if ('error' in ninthResult) {
      expect(ninthResult.error).toContain('Phòng đã đầy');
    }
  });

  it('should require all human players to be ready before starting match', () => {
    const { room, memberToken: hostToken } = roomManager.createRoom({
      name: 'Phòng Ready Test',
      hostName: 'Chủ Phòng',
      maxPlayers: 4,
    });

    const joinResult = roomManager.joinRoom(room.code, {
      name: 'Người Chơi 2',
    });
    expect('error' in joinResult).toBe(false);

    // Player 2 is NOT ready yet -> start should fail
    const startFail = roomManager.startMatch(room.id, hostToken);
    expect(startFail.success).toBe(false);
    expect(startFail.error).toContain('sẵn sàng');

    // Mark Player 2 as ready
    if (!('error' in joinResult)) {
      roomManager.setReady(room.id, joinResult.memberId, joinResult.memberToken, true);
    }

    // Now start match should succeed!
    const startSuccess = roomManager.startMatch(room.id, hostToken);
    expect(startSuccess.success).toBe(true);
    expect(room.status).toBe('playing');
    expect(room.engine).toBeDefined();
  });
});
