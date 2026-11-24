'use client';

import React from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Award, CheckCircle2 } from 'lucide-react';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedIds?: string[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  unlockedIds = ['first_order', 'apprentice_chef'],
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hệ thống thành tích" maxWidth="md">
      <div className="flex flex-col gap-2.5">
        {VIETNAMESE_TEXT.achievements.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                isUnlocked
                  ? 'bg-[#1E293B]/40 border-[#3B82F6]/50'
                  : 'bg-[#1A1A1A] border-[#3A3A3A] opacity-60'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isUnlocked ? 'bg-[#3B82F6] text-white' : 'bg-[#303030] text-[#A3A3A3]'
                }`}
              >
                <Award size={20} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#ECECEC]">{ach.name}</h3>
                  {isUnlocked && (
                    <span className="flex items-center gap-1 text-[11px] text-[#22C55E]">
                      <CheckCircle2 size={13} />
                      Đã đạt
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#A3A3A3] mt-0.5">{ach.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
