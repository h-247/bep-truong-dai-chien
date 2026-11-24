'use client';

import React from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { CHEF_CHARACTERS } from '@/src/game/characters';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  selectedCharacterId: string;
  onSelectCharacter: (charId: string) => void;
  stats: {
    totalScore: number;
    totalStars: number;
    completedOrders: number;
    completedLevels: number;
  };
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  playerName,
  selectedCharacterId,
  onSelectCharacter,
  stats,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hồ sơ đầu bếp" maxWidth="md">
      {/* Player Stats Overview */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl text-center">
          <div className="text-xl font-bold text-[#EAB308]">{stats.totalScore}</div>
          <div className="text-xs text-[#A3A3A3]">Tổng điểm số</div>
        </div>
        <div className="p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl text-center">
          <div className="text-xl font-bold text-[#22C55E]">{stats.totalStars} ★</div>
          <div className="text-xs text-[#A3A3A3]">Tổng sao đạt được</div>
        </div>
        <div className="p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl text-center">
          <div className="text-xl font-bold text-[#3B82F6]">{stats.completedOrders}</div>
          <div className="text-xs text-[#A3A3A3]">Đơn hoàn thành</div>
        </div>
        <div className="p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl text-center">
          <div className="text-xl font-bold text-[#ECECEC]">{stats.completedLevels}/20</div>
          <div className="text-xs text-[#A3A3A3]">Màn đã mở khóa</div>
        </div>
      </div>

      {/* Select Chef Character */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-[#ECECEC] mb-2 uppercase tracking-wide">
          Chọn ngoại hình đầu bếp
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CHEF_CHARACTERS.map((chef) => {
            const isSelected = selectedCharacterId === chef.id;
            return (
              <button
                key={chef.id}
                onClick={() => onSelectCharacter(chef.id)}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#303030] border-[#FFFFFF]'
                    : 'bg-[#1A1A1A] border-[#3A3A3A] hover:bg-[#2A2A2A]'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center relative shadow-sm"
                  style={{ backgroundColor: chef.color }}
                >
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-300 absolute -top-1" />
                </div>
                <span className="text-[10px] font-bold text-[#ECECEC] truncate max-w-full">
                  {chef.nameVi.split(' ')[2]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={onClose}>
        Xác nhận
      </Button>
    </Modal>
  );
};
