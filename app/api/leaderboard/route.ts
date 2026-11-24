import { NextResponse } from 'next/server';

export async function GET() {
  // Default verified leaderboards + mock high scores for competition
  const singlePlayer = [
    { rank: 1, name: 'Bếp Trưởng Vàng', level: '1-4', score: 580, stars: 3 },
    { rank: 2, name: 'Nguyễn Văn Minh', level: '1-4', score: 520, stars: 3 },
    { rank: 3, name: 'Lê Hoàng Anh', level: '1-4', score: 480, stars: 3 },
    { rank: 4, name: 'Trần Bảo Ngọc', level: '1-3', score: 410, stars: 3 },
    { rank: 5, name: 'Phạm Hữu Đạt', level: '1-2', score: 350, stars: 3 },
  ];

  const multiplayer = [
    { rank: 1, team: 'Biệt Đội 8 Đầu Bếp', playerCount: 8, level: '5-4', score: 1420, stars: 3 },
    { rank: 2, team: 'Cặp Đôi Bếp Trưởng', playerCount: 2, level: '2-4', score: 980, stars: 3 },
    { rank: 3, team: 'Bếp Hỗn Loạn FC', playerCount: 4, level: '3-4', score: 890, stars: 3 },
    { rank: 4, team: 'Đội Bếp Thần Tốc', playerCount: 6, level: '4-4', score: 860, stars: 3 },
    { rank: 5, team: 'Chiến Binh Chảo Lửa', playerCount: 4, level: '2-3', score: 720, stars: 3 },
  ];

  return NextResponse.json({
    singlePlayer,
    multiplayer,
  });
}
