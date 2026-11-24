import { NextResponse } from 'next/server';
import { z } from 'zod';
import { roomManager } from '@/src/server/rooms/room-manager';

const LeaveSchema = z.object({
  memberId: z.string().min(1),
  memberToken: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = LeaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Yêu cầu không hợp lệ' }, { status: 400 });
    }

    const { memberId, memberToken } = parsed.data;
    roomManager.leaveRoom(id, memberId, memberToken);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi rời phòng' }, { status: 500 });
  }
}
