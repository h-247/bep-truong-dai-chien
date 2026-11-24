import { NextResponse } from 'next/server';
import { LEVELS } from '@/src/game/levels';

export async function GET() {
  return NextResponse.json({
    levels: LEVELS.map((l) => ({
      id: l.id,
      worldId: l.worldId,
      levelNumber: l.levelNumber,
      nameVi: l.nameVi,
      worldNameVi: l.worldNameVi,
      difficulty: l.difficulty,
      timeLimit: l.timeLimit,
      starThresholds: l.starThresholds,
      recipes: l.availableRecipes,
    })),
  });
}
