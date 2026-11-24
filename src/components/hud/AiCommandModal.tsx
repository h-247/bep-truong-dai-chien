'use client';

import React from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { AiCommand } from '@/src/game/ai/ai-chef';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface AiCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (cmd: AiCommand) => void;
  currentCommand: AiCommand;
}

export const AiCommandModal: React.FC<AiCommandModalProps> = ({
  isOpen,
  onClose,
  onSelectCommand,
  currentCommand,
}) => {
  const commands: Array<{ id: AiCommand; label: string; desc: string }> = [
    {
      id: 'auto',
      label: VIETNAMESE_TEXT.aiCommands.autoAssist,
      desc: 'Tự động tính toán công việc ưu tiên và phối hợp nhịp nhàng.',
    },
    {
      id: 'prep_ingredients',
      label: VIETNAMESE_TEXT.aiCommands.prepIngredients,
      desc: 'Tập trung lấy và thái gọt nguyên liệu cho đơn hàng.',
    },
    {
      id: 'cook_food',
      label: VIETNAMESE_TEXT.aiCommands.cookFood,
      desc: 'Trông bếp, xào nấu và canh không để món ăn bị cháy.',
    },
    {
      id: 'wash_plates',
      label: VIETNAMESE_TEXT.aiCommands.washPlates,
      desc: 'Tập trung dọn dẹp bồn rửa và rửa sạch đĩa bẩn.',
    },
    {
      id: 'deliver_order',
      label: VIETNAMESE_TEXT.aiCommands.deliverOrder,
      desc: 'Bày đĩa và mang món hoàn chỉnh ra quầy giao.',
    },
    {
      id: 'follow_me',
      label: VIETNAMESE_TEXT.aiCommands.followMe,
      desc: 'Đi theo vị trí của người chơi chính.',
    },
    {
      id: 'stay_still',
      label: VIETNAMESE_TEXT.aiCommands.stayStill,
      desc: 'Đứng yên tại chỗ để nhường lối đi.',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉ đạo Phụ Bếp AI">
      <div className="flex flex-col gap-2">
        {commands.map((cmd) => {
          const isSelected = currentCommand === cmd.id;
          return (
            <button
              key={cmd.id}
              onClick={() => {
                onSelectCommand(cmd.id);
                onClose();
              }}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#FFFFFF]'
                  : 'bg-[#1A1A1A] hover:bg-[#303030] border-[#3A3A3A] text-[#ECECEC]'
              }`}
            >
              <div className="font-bold text-sm flex items-center justify-between">
                <span>{cmd.label}</span>
                {isSelected && <span className="text-xs text-[#3B82F6]">Đang chọn</span>}
              </div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">{cmd.desc}</div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
