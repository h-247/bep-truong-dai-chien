import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roomManager } from '@/src/server/rooms/room-manager';

const StartSchema = z.object({
  hostToken: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = StartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 400 });
    }

    const result = roomManager.startMatch(id, parsed.data.hostToken);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Không thể bắt đầu' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi bắt đầu trận đấu' }, { status: 500 });
  }
}
