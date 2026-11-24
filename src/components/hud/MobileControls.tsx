'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Hand,
  Flame,
  Zap,
  Users,
  MessageSquare,
  MapPin,
  Bot,
} from 'lucide-react';
import { InputManager } from '@/src/game/input/input-manager';

interface MobileControlsProps {
  inputManager: InputManager;
  isLeftHanded?: boolean;
  onOpenQuickChat: () => void;
  onOpenAiCommands?: () => void;
  onPing: () => void;
  hasAiChef?: boolean;
  canSwitchChef?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  inputManager,
  isLeftHanded = false,
  onOpenQuickChat,
  onOpenAiCommands,
  onPing,
  hasAiChef = false,
  canSwitchChef = false,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [touchActive, setTouchActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45; // Max joystick radius in px

  const handlePointerDown = (e: React.PointerEvent) => {
    if (touchIdRef.current !== null) return;
    touchIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setTouchActive(true);
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerId !== touchIdRef.current) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== touchIdRef.current) return;
    touchIdRef.current = null;
    setTouchActive(false);
    setKnobPos({ x: 0, y: 0 });
    inputManager.setVirtualJoystick(0, 0);
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxRadius) {
      setKnobPos({ x: dx, y: dy });
      inputManager.setVirtualJoystick(dx / maxRadius, dy / maxRadius);
    } else {
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * maxRadius;
      const ky = Math.sin(angle) * maxRadius;
      setKnobPos({ x: kx, y: ky });
      inputManager.setVirtualJoystick(Math.cos(angle), Math.sin(angle));
    }
  };

  return (
    <div
      className={`fixed bottom-0 inset-x-0 p-4 pointer-events-none flex items-end justify-between select-none ${
        isLeftHanded ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* 1. Virtual Joystick Base */}
      <div
        ref={joystickBaseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-32 h-32 rounded-full bg-[#1A1A1A]/80 border-2 border-[#3A3A3A] relative pointer-events-auto flex items-center justify-center touch-none backdrop-blur-sm shadow-xl"
        style={{ touchAction: 'none' }}
      >
        {/* Joystick Stick / Knob */}
        <div
          className={`w-14 h-14 rounded-full border border-white/20 shadow-md transition-transform duration-75 ${
            touchActive ? 'bg-[#3B82F6]' : 'bg-[#FFFFFF]/90'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* 2. Action Buttons Pad */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        {/* Secondary controls row */}
        <div className="flex items-center gap-2">
          {hasAiChef && onOpenAiCommands && (
            <button
              onClick={onOpenAiCommands}
              className="w-12 h-12 rounded-full bg-[#303030]/90 border border-[#3A3A3A] text-[#ECECEC] flex items-center justify-center active:scale-90 transition-transform shadow-md"
              title="Lệnh cho AI"
            >
              <Bot size={20} />
            </button>
          )}

          {canSwitchChef && (
            <button
              onClick={() => inputManager.triggerVirtualAction('switchChef')}
              className="w-12 h-12 rounded-full bg-[#303030]/90 border border-[#3A3A3A] text-[#ECECEC] flex items-center justify-center active:scale-90 transition-transform shadow-md"
              title="Đổi đầu bếp"
            >
              <Users size={20} />
            </button>
          )}

          <button
            onClick={onPing}
            className="w-12 h-12 rounded-full bg-[#303030]/90 border border-[#3A3A3A] text-[#EAB308] flex items-center justify-center active:scale-90 transition-transform shadow-md"
            title="Đánh dấu (Ping)"
          >
            <MapPin size={20} />
          </button>

          <button
            onClick={onOpenQuickChat}
            className="w-12 h-12 rounded-full bg-[#303030]/90 border border-[#3A3A3A] text-[#3B82F6] flex items-center justify-center active:scale-90 transition-transform shadow-md"
            title="Giao tiếp nhanh"
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* Primary Action Buttons: Nhặt/Đặt, Tương tác, Tăng tốc */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* Dash (Tăng tốc) */}
          <button
            onPointerDown={() => inputManager.triggerVirtualAction('dash')}
            className="col-span-2 h-12 rounded-2xl bg-[#EAB308] text-black font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-lg"
          >
            <Zap size={20} />
            <span>Tăng tốc</span>
          </button>

          {/* Interact (Tương tác / Cắt / Rửa / Cứu hỏa) */}
          <button
            onPointerDown={() => inputManager.setVirtualButton('interact', true)}
            onPointerUp={() => inputManager.setVirtualButton('interact', false)}
            onPointerLeave={() => inputManager.setVirtualButton('interact', false)}
            className="w-20 h-20 rounded-2xl bg-[#3B82F6] text-white font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-lg"
          >
            <Flame size={24} />
            <span className="text-xs">Tương tác</span>
          </button>

          {/* Pickup/Drop (Nhặt / Đặt) */}
          <button
            onPointerDown={() => inputManager.triggerVirtualAction('pickupDrop')}
            className="w-20 h-20 rounded-2xl bg-[#FFFFFF] text-black font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-lg"
          >
            <Hand size={24} />
            <span className="text-xs">Nhặt/Đặt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
