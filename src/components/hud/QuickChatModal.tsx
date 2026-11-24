'use client';

import React from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface QuickChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMessage: (msg: string) => void;
}

export const QuickChatModal: React.FC<QuickChatModalProps> = ({
  isOpen,
  onClose,
  onSelectMessage,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Giao tiếp nhanh">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {VIETNAMESE_TEXT.quickChat.map((msg, idx) => (
          <button
            key={idx}
            onClick={() => {
              onSelectMessage(msg);
              onClose();
            }}
            className="p-3 text-left bg-[#1A1A1A] hover:bg-[#303030] border border-[#3A3A3A] rounded-xl text-sm font-medium text-[#ECECEC] active:scale-98 transition-all cursor-pointer"
          >
            {msg}
          </button>
        ))}
      </div>
    </Modal>
  );
};
