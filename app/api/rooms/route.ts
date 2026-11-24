import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roomManager } from '@/src/server/rooms/room-manager';

const CreateRoomSchema = z.object({
  name: z.string().min(1).max(32),
  hostName: z.string().min(1).max(24),
  characterId: z.string().optional(),
  maxPlayers: z.number().int().min(2).max(8).optional(),
  levelId: z.string().optional(),
  difficulty: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  password: z.string().optional(),
  guestId: z.string().optional(),
  userId: z.string().optional(),
});

export async function GET() {
  const rooms = roomManager.listPublicRooms();
  return NextResponse.json({ rooms });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dữ liệu tạo phòng không hợp lệ' },
        { status: 400 },
      );
    }

    const {
      name,
      hostName,
      characterId,
      maxPlayers,
      levelId,
      difficulty,
      visibility,
      password,
      guestId,
      userId,
    } = parsed.data;

    const { room, memberToken, memberId } = roomManager.createRoom({
      name,
      hostName,
      hostGuestId: guestId,
      hostUserId: userId,
      characterId,
      maxPlayers,
      levelId,
      difficulty,
      visibility,
      passwordHash: password,
    });

    return NextResponse.json({
      room: {
        id: room.id,
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        visibility: room.visibility,
        maxPlayers: room.maxPlayers,
        levelId: room.levelId,
        difficulty: room.difficulty,
        status: room.status,
        members: Array.from(room.members.values()),
      },
      memberToken,
      memberId,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Không thể tạo phòng' }, { status: 500 });
  }
}
