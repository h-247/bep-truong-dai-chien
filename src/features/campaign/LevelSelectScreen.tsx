'use client';

import React, { useState } from 'react';
import { ArrowLeft, Star, Lock } from 'lucide-react';
import { LEVELS } from '@/src/game/levels';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface LevelSelectScreenProps {
  onBack: () => void;
  onSelectLevel: (levelId: string) => void;
  unlockedLevelIds: string[];
  levelStars: Record<string, number>;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  onBack,
  onSelectLevel,
  unlockedLevelIds,
  levelStars,
}) => {
  const [selectedWorld, setSelectedWorld] = useState<number>(1);

  const worlds = [
    { id: 1, name: '1. ' + VIETNAMESE_TEXT.worlds[1] },
    { id: 2, name: '2. ' + VIETNAMESE_TEXT.worlds[2] },
    { id: 3, name: '3. ' + VIETNAMESE_TEXT.worlds[3] },
    { id: 4, name: '4. ' + VIETNAMESE_TEXT.worlds[4] },
    { id: 5, name: '5. ' + VIETNAMESE_TEXT.worlds[5] },
  ];

  const currentLevels = LEVELS.filter((l) => l.worldId === selectedWorld);

  return (
    <div className="h-full w-full flex flex-col p-4 max-w-xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-[#262626] border border-[#3A3A3A] text-[#ECECEC] hover:bg-[#303030] active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#ECECEC]">{VIETNAMESE_TEXT.nav.selectLevel}</h1>
          <p className="text-xs text-[#A3A3A3]">Chiến dịch 20 màn thử thách phối hợp</p>
        </div>
      </div>

      {/* World Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {worlds.map((w) => {
          const isSelected = selectedWorld === w.id;
          return (
            <button
              key={w.id}
              onClick={() => setSelectedWorld(w.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FFFFFF] text-[#000000] shadow-md'
                  : 'bg-[#262626] text-[#A3A3A3] hover:text-[#ECECEC] border border-[#3A3A3A]'
              }`}
            >
              {w.name}
            </button>
          );
        })}
      </div>

      {/* Level List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {currentLevels.map((lvl) => {
          const isUnlocked = unlockedLevelIds.includes(lvl.id);
          const stars = levelStars[lvl.id] || 0;

          return (
            <Card
              key={lvl.id}
              className={`flex items-center justify-between p-4 transition-all ${
                isUnlocked
                  ? 'hover:border-[#FFFFFF]/40 cursor-pointer active:scale-99'
                  : 'opacity-60 pointer-events-none'
              }`}
              onClick={() => isUnlocked && onSelectLevel(lvl.id)}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isUnlocked
                      ? 'bg-[#303030] text-[#ECECEC] border border-[#4A4A4A]'
                      : 'bg-[#1A1A1A] text-[#666666]'
                  }`}
                >
                  {isUnlocked ? `${lvl.worldId}-${lvl.levelNumber}` : <Lock size={20} />}
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#ECECEC]">{lvl.nameVi}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A3A3A3] border border-[#3A3A3A]">
                      {lvl.timeLimit}s
                    </span>
                    <span className="text-xs text-[#EAB308]">
                      Mục tiêu 3★: {lvl.starThresholds[2]} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Stars earned */}
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    className={
                      stars >= s
                        ? 'fill-[#EAB308] text-[#EAB308]'
                        : 'text-[#4A4A4A]'
                    }
                  />
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
