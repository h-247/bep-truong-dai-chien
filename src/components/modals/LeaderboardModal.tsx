'use client';

import React, { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Trophy, Users, User } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<'single' | 'multi'>('single');

  const singleRankings = [
    { rank: 1, name: 'Bếp Trưởng Vàng', level: '1-4', score: 580, stars: 3 },
    { rank: 2, name: 'Nguyễn Văn Minh', level: '1-4', score: 520, stars: 3 },
    { rank: 3, name: 'Lê Hoàng Anh', level: '1-4', score: 480, stars: 3 },
    { rank: 4, name: 'Trần Bảo Ngọc', level: '1-3', score: 410, stars: 3 },
    { rank: 5, name: 'Phạm Hữu Đạt', level: '1-2', score: 350, stars: 3 },
  ];

  const multiRankings = [
    { rank: 1, team: 'Biệt Đội 8 Đầu Bếp', players: 8, level: '5-4', score: 1420, stars: 3 },
    { rank: 2, team: 'Cặp Đôi Bếp Trưởng', players: 2, level: '2-4', score: 980, stars: 3 },
    { rank: 3, team: 'Bếp Hỗn Loạn FC', players: 4, level: '3-4', score: 890, stars: 3 },
    { rank: 4, team: 'Đội Bếp Thần Tốc', players: 6, level: '4-4', score: 860, stars: 3 },
    { rank: 5, team: 'Chiến Binh Chảo Lửa', players: 4, level: '2-3', score: 720, stars: 3 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bảng xếp hạng cao thủ" maxWidth="md">
      {/* Tabs */}
      <div className="flex border-b border-[#3A3A3A] mb-4">
        <button
          onClick={() => setTab('single')}
          className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'single'
              ? 'border-b-2 border-[#FFFFFF] text-[#FFFFFF]'
              : 'text-[#A3A3A3] hover:text-[#ECECEC]'
          }`}
        >
          <User size={16} />
          <span>Chơi đơn</span>
        </button>
        <button
          onClick={() => setTab('multi')}
          className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'multi'
              ? 'border-b-2 border-[#FFFFFF] text-[#FFFFFF]'
              : 'text-[#A3A3A3] hover:text-[#ECECEC]'
          }`}
        >
          <Users size={16} />
          <span>Chơi trực tuyến</span>
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {tab === 'single'
          ? singleRankings.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      item.rank === 1
                        ? 'bg-[#EAB308] text-black'
                        : item.rank === 2
                        ? 'bg-[#94A3B8] text-black'
                        : item.rank === 3
                        ? 'bg-[#B45309] text-white'
                        : 'bg-[#303030] text-[#A3A3A3]'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-[#ECECEC]">{item.name}</div>
                    <div className="text-xs text-[#A3A3A3]">Màn {item.level}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#22C55E]">{item.score} đ</div>
                  <div className="text-xs text-[#EAB308]">{'★'.repeat(item.stars)}</div>
                </div>
              </div>
            ))
          : multiRankings.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      item.rank === 1
                        ? 'bg-[#EAB308] text-black'
                        : item.rank === 2
                        ? 'bg-[#94A3B8] text-black'
                        : item.rank === 3
                        ? 'bg-[#B45309] text-white'
                        : 'bg-[#303030] text-[#A3A3A3]'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-[#ECECEC]">{item.team}</div>
                    <div className="text-xs text-[#A3A3A3]">
                      {item.players} người • Màn {item.level}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#22C55E]">{item.score} đ</div>
                  <div className="text-xs text-[#EAB308]">{'★'.repeat(item.stars)}</div>
                </div>
              </div>
            ))}
      </div>
    </Modal>
  );
};
