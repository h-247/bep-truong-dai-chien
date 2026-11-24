'use client';

import React from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Star, RotateCcw, ArrowRight, Home } from 'lucide-react';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface MatchResultModalProps {
  isOpen: boolean;
  score: number;
  stars: number;
  completedOrders: number;
  failedOrders: number;
  highestCombo: number;
  onRetry: () => void;
  onNextLevel?: () => void;
  onHome: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  isOpen,
  score,
  stars,
  completedOrders,
  failedOrders,
  highestCombo,
  onRetry,
  onNextLevel,
  onHome,
}) => {
  const isVictory = stars > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onHome}
      title={isVictory ? VIETNAMESE_TEXT.gameplay.levelCompleted : VIETNAMESE_TEXT.gameplay.levelFailed}
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        {/* Star Rating Display */}
        <div className="flex items-center gap-2 my-2">
          {[1, 2, 3].map((starIdx) => {
            const hasStar = stars >= starIdx;
            return (
              <Star
                key={starIdx}
                size={44}
                className={
                  hasStar
                    ? 'fill-[#EAB308] text-[#EAB308] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                    : 'text-[#4A4A4A]'
                }
              />
            );
          })}
        </div>

        {/* Total Score */}
        <div>
          <div className="text-4xl font-extrabold text-[#ECECEC]">{score}</div>
          <div className="text-xs uppercase tracking-wider text-[#A3A3A3] mt-0.5">
            Điểm số trận đấu
          </div>
        </div>

        {/* Statistics breakdown */}
        <div className="w-full grid grid-cols-3 gap-2 bg-[#1A1A1A] p-3 rounded-xl border border-[#3A3A3A]">
          <div>
            <div className="text-sm font-bold text-[#22C55E]">{completedOrders}</div>
            <div className="text-[11px] text-[#A3A3A3]">Đơn giao</div>
          </div>
          <div>
            <div className="text-sm font-bold text-[#EF4444]">{failedOrders}</div>
            <div className="text-[11px] text-[#A3A3A3]">Bỏ lỡ</div>
          </div>
          <div>
            <div className="text-sm font-bold text-[#3B82F6]">x{highestCombo}</div>
            <div className="text-[11px] text-[#A3A3A3]">Combo cao</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-2">
          {isVictory && onNextLevel && (
            <Button variant="primary" fullWidth onClick={onNextLevel} className="gap-2">
              <span>{VIETNAMESE_TEXT.gameplay.nextLevel}</span>
              <ArrowRight size={18} />
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 gap-1.5" onClick={onRetry}>
              <RotateCcw size={16} />
              <span>{VIETNAMESE_TEXT.gameplay.retry}</span>
            </Button>

            <Button variant="secondary" className="flex-1 gap-1.5" onClick={onHome}>
              <Home size={16} />
              <span>{VIETNAMESE_TEXT.controls.quitToMenu}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
