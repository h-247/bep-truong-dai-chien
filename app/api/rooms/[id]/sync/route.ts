import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roomManager } from '@/src/server/rooms/room-manager';

const SyncSchema = z.object({
  memberId: z.string().min(1),
  memberToken: z.string().min(1),
  dx: z.number().optional(),
  dy: z.number().optional(),
  dash: z.boolean().optional(),
  pickupDrop: z.boolean().optional(),
  interact: z.boolean().optional(),
  ping: z
    .object({
      x: z.number(),
      y: z.number(),
      type: z.enum(['general', 'ingredient', 'station', 'fire', 'order']).optional(),
    })
    .optional(),
  chat: z.string().max(100).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = SyncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dữ liệu đồng bộ không hợp lệ' }, { status: 400 });
    }

    const { memberId, memberToken, ...actions } = parsed.data;

    const result = roomManager.syncPlayerAction(id, memberId, memberToken, actions);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const room = roomManager.getRoom(id);

    return NextResponse.json({
      status: room?.status,
      snapshot: result.snapshot,
      matchResults: room?.matchResults,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi đồng bộ' }, { status: 500 });
  }
}
