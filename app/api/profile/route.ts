import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function GET() {
  const user = await getChatGPTUser().catch(() => null);

  return NextResponse.json({
    user: user
      ? {
          id: user.userId,
          displayName: user.displayName,
          email: user.email,
          isAuthenticated: true,
        }
      : {
          id: 'guest',
          displayName: 'Khách',
          isAuthenticated: false,
        },
  });
}
