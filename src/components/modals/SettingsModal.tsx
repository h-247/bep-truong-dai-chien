'use client';

import React, { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { sound } from '@/src/game/audio/synth';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLeftHanded: boolean;
  onToggleLeftHanded: (val: boolean) => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isLeftHanded,
  onToggleLeftHanded,
  onResetProgress,
}) => {
  const [sfxVol, setSfxVol] = useState(80);
  const [vibration, setVibration] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleVolumeChange = (val: number) => {
    setSfxVol(val);
    sound.setVolume(val);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={VIETNAMESE_TEXT.settings.title} maxWidth="md">
      <div className="flex flex-col gap-4">
        {/* SFX Volume */}
        <div>
          <div className="flex justify-between text-xs font-bold text-[#ECECEC] mb-1">
            <span>{VIETNAMESE_TEXT.settings.soundEffectsVolume}</span>
            <span>{sfxVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVol}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full accent-white cursor-pointer h-2 bg-[#1A1A1A] rounded-lg"
          />
        </div>

        {/* Left Handed Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl">
          <div>
            <div className="text-sm font-bold text-[#ECECEC]">
              {VIETNAMESE_TEXT.settings.leftHanded}
            </div>
            <div className="text-xs text-[#A3A3A3]">Đổi vị trí cần điều khiển sang bên phải</div>
          </div>
          <input
            type="checkbox"
            checked={isLeftHanded}
            onChange={(e) => onToggleLeftHanded(e.target.checked)}
            className="w-5 h-5 accent-white cursor-pointer"
          />
        </div>

        {/* Vibration Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl">
          <div>
            <div className="text-sm font-bold text-[#ECECEC]">
              {VIETNAMESE_TEXT.settings.vibration}
            </div>
            <div className="text-xs text-[#A3A3A3]">Rung phản hồi khi nhặt đồ và thao tác</div>
          </div>
          <input
            type="checkbox"
            checked={vibration}
            onChange={(e) => setVibration(e.target.checked)}
            className="w-5 h-5 accent-white cursor-pointer"
          />
        </div>

        {/* Reset Progress */}
        <div className="pt-2 border-t border-[#3A3A3A]">
          {!confirmReset ? (
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => setConfirmReset(true)}
            >
              {VIETNAMESE_TEXT.settings.resetProgress}
            </Button>
          ) : (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl flex flex-col gap-2">
              <p className="text-xs text-[#EF4444] font-medium">
                {VIETNAMESE_TEXT.settings.resetConfirm}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmReset(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                    onClose();
                  }}
                >
                  Xác nhận xóa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
