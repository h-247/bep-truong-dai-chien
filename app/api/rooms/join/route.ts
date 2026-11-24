import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roomManager } from '@/src/server/rooms/room-manager';

const JoinRoomSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1).max(24),
  characterId: z.string().optional(),
  password: z.string().optional(),
  guestId: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = JoinRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dữ liệu tham gia phòng không hợp lệ' },
        { status: 400 },
      );
    }

    const { code, name, characterId, password, guestId, userId } = parsed.data;

    const result = roomManager.joinRoom(code, {
      name,
      characterId,
      password,
      guestId,
      userId,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { room, memberToken, memberId } = result;

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
    return NextResponse.json({ error: 'Lỗi tham gia phòng' }, { status: 500 });
  }
}
