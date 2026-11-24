import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roomManager } from '@/src/server/rooms/room-manager';

const ReadySchema = z.object({
  memberId: z.string().min(1),
  memberToken: z.string().min(1),
  isReady: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = ReadySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const { memberId, memberToken, isReady } = parsed.data;
    const ok = roomManager.setReady(id, memberId, memberToken, isReady);

    if (!ok) {
      return NextResponse.json(
        { error: 'Không thể cập nhật trạng thái sẵn sàng' },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, isReady });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
