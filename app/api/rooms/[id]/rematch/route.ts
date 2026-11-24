import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roomManager } from '@/src/server/rooms/room-manager';

const RematchSchema = z.object({
  hostToken: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = RematchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 400 });
    }

    const ok = roomManager.rematch(id, parsed.data.hostToken);
    if (!ok) {
      return NextResponse.json({ error: 'Không thể chơi lại' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi' }, { status: 500 });
  }
}
