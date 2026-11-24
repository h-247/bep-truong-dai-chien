import { NextResponse } from 'next/server';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

export async function GET() {
  return NextResponse.json({
    achievements: VIETNAMESE_TEXT.achievements,
  });
}
