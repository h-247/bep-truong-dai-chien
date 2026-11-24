import { GameEngine } from '@/src/game/core/game-engine';
import { getLevelById, getScaledLevelForPlayers } from '@/src/game/levels';
import { GameSnapshot, LevelConfig } from '@/src/types';

export interface ServerRoomMember {
  id: string;
  userId?: string;
  guestId?: string;
  token: string;
  name: string;
  characterId: string;
  isHost: boolean;
  isReady: boolean;
  isAi: boolean;
  connected: boolean;
  lastSeen: number;
}

export interface ServerRoom {
  id: string;
  code: string;
  name: string;
  hostId: string;
  visibility: 'public' | 'private';
  passwordHash?: string;
  maxPlayers: number;
  levelId: string;
  difficulty: string;
  status: 'lobby' | 'playing' | 'finished';
  members: Map<string, ServerRoomMember>;
  createdAt: number;
  engine?: GameEngine;
  lastTickTime: number;
  matchResults?: {
    teamScore: number;
    stars: number;
    completedOrders: number;
    failedOrders: number;
    highestCombo: number;
    duration: number;
  };
}

class MultiplayerRoomManager {
  private rooms: Map<string, ServerRoom> = new Map();
  private codeToId: Map<string, string> = new Map();

  constructor() {
    // Run periodic cleanup every 60s
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupExpiredRooms(), 60000);
    }
  }

  public createRoom(params: {
    name: string;
    hostName: string;
    hostUserId?: string;
    hostGuestId?: string;
    characterId?: string;
    maxPlayers?: number;
    levelId?: string;
    difficulty?: string;
    visibility?: 'public' | 'private';
    passwordHash?: string;
  }): { room: ServerRoom; memberToken: string; memberId: string } {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const code = this.generateRoomCode();
    const memberId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const memberToken = `tok_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

    const hostMember: ServerRoomMember = {
      id: memberId,
      userId: params.hostUserId,
      guestId: params.hostGuestId,
      token: memberToken,
      name: params.hostName || 'Chủ phòng',
      characterId: params.characterId || 'chef_1',
      isHost: true,
      isReady: true,
      isAi: false,
      connected: true,
      lastSeen: Date.now(),
    };

    const members = new Map<string, ServerRoomMember>();
    members.set(memberId, hostMember);

    const room: ServerRoom = {
      id: roomId,
      code,
      name: params.name || `Phòng của ${params.hostName}`,
      hostId: memberId,
      visibility: params.visibility || 'public',
      passwordHash: params.passwordHash,
      maxPlayers: Math.max(2, Math.min(8, params.maxPlayers || 8)),
      levelId: params.levelId || 'level_1_1',
      difficulty: params.difficulty || 'normal',
      status: 'lobby',
      members,
      createdAt: Date.now(),
      lastTickTime: Date.now(),
    };

    this.rooms.set(roomId, room);
    this.codeToId.set(code, roomId);

    return { room, memberToken, memberId };
  }

  public getRoom(roomId: string): ServerRoom | undefined {
    return this.rooms.get(roomId);
  }

  public getRoomByCode(code: string): ServerRoom | undefined {
    const roomId = this.codeToId.get(code.toUpperCase().trim());
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  public listPublicRooms(): Array<{
    id: string;
    code: string;
    name: string;
    hostName: string;
    playerCount: number;
    maxPlayers: number;
    levelId: string;
    difficulty: string;
    status: string;
    hasPassword: boolean;
  }> {
    const list: Array<{
      id: string;
      code: string;
      name: string;
      hostName: string;
      playerCount: number;
      maxPlayers: number;
      levelId: string;
      difficulty: string;
      status: string;
      hasPassword: boolean;
    }> = [];

    for (const room of this.rooms.values()) {
      if (room.visibility === 'public') {
        const host = room.members.get(room.hostId);
        list.push({
          id: room.id,
          code: room.code,
          name: room.name,
          hostName: host?.name || 'Chủ phòng',
          playerCount: room.members.size,
          maxPlayers: room.maxPlayers,
          levelId: room.levelId,
          difficulty: room.difficulty,
          status: room.status,
          hasPassword: !!room.passwordHash,
        });
      }
    }

    return list;
  }

  public joinRoom(
    roomIdOrCode: string,
    params: {
      name: string;
      userId?: string;
      guestId?: string;
      characterId?: string;
      password?: string;
    },
  ): { memberToken: string; memberId: string; room: ServerRoom } | { error: string } {
    let room = this.getRoom(roomIdOrCode);
    if (!room) {
      room = this.getRoomByCode(roomIdOrCode);
    }

    if (!room) {
      return { error: 'Không tìm thấy phòng hoặc mã phòng không đúng.' };
    }

    if (room.members.size >= room.maxPlayers) {
      return { error: 'Phòng đã đầy!' };
    }

    if (room.status !== 'lobby') {
      return { error: 'Trận đấu đang diễn ra, không thể tham gia lúc này.' };
    }

    if (room.passwordHash && room.passwordHash !== params.password) {
      return { error: 'Mật khẩu phòng không chính xác.' };
    }

    // Pick an unused character if requested character is already taken
    const usedCharacters = new Set(
      Array.from(room.members.values()).map((m) => m.characterId),
    );
    let chosenChar = params.characterId || 'chef_1';
    if (usedCharacters.has(chosenChar)) {
      for (let i = 1; i <= 8; i++) {
        const candidate = `chef_${i}`;
        if (!usedCharacters.has(candidate)) {
          chosenChar = candidate;
          break;
        }
      }
    }

    const memberId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const memberToken = `tok_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

    const member: ServerRoomMember = {
      id: memberId,
      userId: params.userId,
      guestId: params.guestId,
      token: memberToken,
      name: params.name || `Đầu bếp ${room.members.size + 1}`,
      characterId: chosenChar,
      isHost: false,
      isReady: false,
      isAi: false,
      connected: true,
      lastSeen: Date.now(),
    };

    room.members.set(memberId, member);

    return { memberToken, memberId, room };
  }

  public addAiMember(roomId: string, hostToken: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'lobby') return false;

    const host = room.members.get(room.hostId);
    if (!host || host.token !== hostToken) return false;

    if (room.members.size >= room.maxPlayers) return false;

    const usedCharacters = new Set(
      Array.from(room.members.values()).map((m) => m.characterId),
    );
    let chosenChar = 'chef_1';
    for (let i = 1; i <= 8; i++) {
      const candidate = `chef_${i}`;
      if (!usedCharacters.has(candidate)) {
        chosenChar = candidate;
        break;
      }
    }

    const aiId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const aiMember: ServerRoomMember = {
      id: aiId,
      token: `ai_tok_${Math.random()}`,
      name: `Phụ bếp AI ${room.members.size}`,
      characterId: chosenChar,
      isHost: false,
      isReady: true,
      isAi: true,
      connected: true,
      lastSeen: Date.now(),
    };

    room.members.set(aiId, aiMember);
    return true;
  }

  public removeAiMember(roomId: string, hostToken: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'lobby') return false;

    const host = room.members.get(room.hostId);
    if (!host || host.token !== hostToken) return false;

    // Find latest AI member
    for (const [id, m] of Array.from(room.members.entries()).reverse()) {
      if (m.isAi) {
        room.members.delete(id);
        return true;
      }
    }

    return false;
  }

  public leaveRoom(roomId: string, memberId: string, memberToken: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const member = room.members.get(memberId);
    if (!member || member.token !== memberToken) return;

    room.members.delete(memberId);

    // If room is empty, delete room
    if (room.members.size === 0) {
      this.rooms.delete(roomId);
      this.codeToId.delete(room.code);
      return;
    }

    // If host left, transfer host to next eligible human player
    if (member.isHost) {
      for (const nextMember of room.members.values()) {
        if (!nextMember.isAi) {
          nextMember.isHost = true;
          room.hostId = nextMember.id;
          break;
        }
      }
    }
  }

  public setReady(
    roomId: string,
    memberId: string,
    memberToken: string,
    isReady: boolean,
  ): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'lobby') return false;

    const member = room.members.get(memberId);
    if (!member || member.token !== memberToken) return false;

    member.isReady = isReady;
    return true;
  }

  public updateSettings(
    roomId: string,
    hostToken: string,
    updates: {
      name?: string;
      maxPlayers?: number;
      levelId?: string;
      difficulty?: string;
      visibility?: 'public' | 'private';
    },
  ): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'lobby') return false;

    const host = room.members.get(room.hostId);
    if (!host || host.token !== hostToken) return false;

    if (updates.name) room.name = updates.name;
    if (updates.maxPlayers) {
      room.maxPlayers = Math.max(
        room.members.size,
        Math.min(8, updates.maxPlayers),
      );
    }
    if (updates.levelId) room.levelId = updates.levelId;
    if (updates.difficulty) room.difficulty = updates.difficulty;
    if (updates.visibility) room.visibility = updates.visibility;

    return true;
  }

  public startMatch(roomId: string, hostToken: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Phòng không tồn tại' };

    const host = room.members.get(room.hostId);
    if (!host || host.token !== hostToken) {
      return { success: false, error: 'Chỉ chủ phòng mới có quyền bắt đầu trận đấu' };
    }

    if (room.members.size < 2) {
      return { success: false, error: 'Cần ít nhất 2 người chơi để bắt đầu' };
    }

    // Require all human players to be ready
    for (const member of room.members.values()) {
      if (!member.isAi && !member.isReady) {
        return { success: false, error: 'Tất cả người chơi phải sẵn sàng' };
      }
    }

    const baseLevel = getLevelById(room.levelId) || getLevelById('level_1_1')!;
    const scaledLevel = getScaledLevelForPlayers(baseLevel, room.members.size);

    const playerList = Array.from(room.members.values()).map((m) => ({
      id: m.id,
      name: m.name,
      characterId: m.characterId,
      isAi: m.isAi,
    }));

    room.engine = new GameEngine({
      level: scaledLevel,
      playerCount: room.members.size,
      players: playerList,
      isClientSideOnly: false,
    });

    room.status = 'playing';
    room.lastTickTime = Date.now();

    return { success: true };
  }

  public syncPlayerAction(
    roomId: string,
    memberId: string,
    memberToken: string,
    actions: {
      dx?: number;
      dy?: number;
      dash?: boolean;
      pickupDrop?: boolean;
      interact?: boolean;
      ping?: { x: number; y: number; type?: 'general' | 'ingredient' | 'station' | 'fire' | 'order' };
      chat?: string;
    },
  ): { snapshot?: GameSnapshot; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Phòng không tồn tại' };

    const member = room.members.get(memberId);
    if (!member || member.token !== memberToken) {
      return { error: 'Phiên xác thực không hợp lệ' };
    }

    member.lastSeen = Date.now();
    member.connected = true;

    if (room.status !== 'playing' || !room.engine) {
      return { error: 'Trận đấu chưa bắt đầu' };
    }

    // Advance engine simulation to current time
    const now = Date.now();
    const dt = Math.min(0.2, (now - room.lastTickTime) / 1000);
    room.lastTickTime = now;
    if (dt > 0.001) {
      room.engine.update(dt);
    }

    // Apply player input
    if (actions.dx !== undefined && actions.dy !== undefined) {
      room.engine.movePlayer(memberId, actions.dx, actions.dy, !!actions.dash);
    }
    if (actions.pickupDrop) {
      room.engine.pickupOrDrop(memberId);
    }
    if (actions.interact) {
      room.engine.interact(memberId);
    }
    if (actions.ping) {
      room.engine.addPing(memberId, actions.ping.x, actions.ping.y, actions.ping.type);
    }
    if (actions.chat) {
      room.engine.addQuickChatMessage(memberId, actions.chat);
    }

    // Check if game is over
    if (room.engine.isGameOver && room.status === 'playing') {
      room.status = 'finished';
      room.matchResults = {
        teamScore: room.engine.score,
        stars: room.engine.calculateStars(),
        completedOrders: room.engine.completedOrdersCount,
        failedOrders: room.engine.failedOrdersCount,
        highestCombo: room.engine.highestCombo,
        duration: room.engine.level.timeLimit,
      };
    }

    return { snapshot: room.engine.getSnapshot() };
  }

  public rematch(roomId: string, hostToken: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const host = room.members.get(room.hostId);
    if (!host || host.token !== hostToken) return false;

    room.status = 'lobby';
    room.engine = undefined;
    for (const m of room.members.values()) {
      if (!m.isAi) m.isReady = false;
    }

    return true;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.codeToId.has(code));
    return code;
  }

  private cleanupExpiredRooms() {
    const now = Date.now();
    for (const [id, room] of this.rooms.entries()) {
      // If room older than 3 hours or no active connections for 15 minutes, remove
      let hasRecentMember = false;
      for (const m of room.members.values()) {
        if (now - m.lastSeen < 15 * 60 * 1000) {
          hasRecentMember = true;
          break;
        }
      }
      if (!hasRecentMember || now - room.createdAt > 3 * 3600 * 1000) {
        this.rooms.delete(id);
        this.codeToId.delete(room.code);
      }
    }
  }
}

// Global singleton instance across route handlers in the Worker process
declare global {
  var __multiplayerRoomManager: MultiplayerRoomManager | undefined;
}

export const roomManager =
  globalThis.__multiplayerRoomManager || (globalThis.__multiplayerRoomManager = new MultiplayerRoomManager());
