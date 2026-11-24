import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roomManager } from '@/src/server/rooms/room-manager';

const UpdateSettingsSchema = z.object({
  hostToken: z.string().min(1),
  name: z.string().min(1).max(32).optional(),
  maxPlayers: z.number().int().min(2).max(8).optional(),
  levelId: z.string().optional(),
  difficulty: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  action: z.enum(['add_ai', 'remove_ai']).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const room = roomManager.getRoom(id);

  if (!room) {
    return NextResponse.json(
      { error: 'Không tìm thấy phòng' },
      { status: 404 },
    );
  }

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
      matchResults: room.matchResults,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dữ liệu cập nhật không hợp lệ' }, { status: 400 });
    }

    const { hostToken, action, ...settings } = parsed.data;

    if (action === 'add_ai') {
      const ok = roomManager.addAiMember(id, hostToken);
      if (!ok) return NextResponse.json({ error: 'Không thể thêm đầu bếp AI' }, { status: 400 });
    } else if (action === 'remove_ai') {
      const ok = roomManager.removeAiMember(id, hostToken);
      if (!ok) return NextResponse.json({ error: 'Không thể bỏ đầu bếp AI' }, { status: 400 });
    } else {
      const ok = roomManager.updateSettings(id, hostToken, settings);
      if (!ok) return NextResponse.json({ error: 'Không có quyền cập nhật phòng' }, { status: 403 });
    }

    const room = roomManager.getRoom(id);
    return NextResponse.json({
      room: room
        ? {
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
          }
        : null,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi cập nhật phòng' }, { status: 500 });
  }
}
