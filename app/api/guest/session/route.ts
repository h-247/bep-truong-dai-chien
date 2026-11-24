import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  displayName: z.string().min(1).max(24).optional(),
  characterId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const guestToken = `gtok_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const displayName = parsed.data.displayName || `Đầu bếp ${Math.floor(100 + Math.random() * 900)}`;
    const characterId = parsed.data.characterId || 'chef_1';

    return NextResponse.json({
      guestId,
      guestToken,
      displayName,
      characterId,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
