'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Crown,
  Bot,
  Play,
  LogOut,
  UserPlus,
  UserMinus,
  Settings,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';
import { getChefById } from '@/src/game/characters';
import { getLevelById } from '@/src/game/levels';

interface RoomLobbyScreenProps {
  roomId: string;
  memberId: string;
  memberToken: string;
  onMatchStart: () => void;
  onLeaveRoom: () => void;
}

export const RoomLobbyScreen: React.FC<RoomLobbyScreenProps> = ({
  roomId,
  memberId,
  memberToken,
  onMatchStart,
  onLeaveRoom,
}) => {
  const [room, setRoom] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRoomState = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) {
        onLeaveRoom();
        return;
      }
      const data = (await res.json()) as { room?: any };
      if (data.room) {
        setRoom(data.room);
        const me = data.room.members?.find((m: any) => m.id === memberId);
        if (me) {
          setIsReady(me.isReady);
        }
        if (data.room.status === 'playing') {
          onMatchStart();
        }
      }
    } catch {
      // Poll error handled silently
    }
  };

  useEffect(() => {
    fetchRoomState();
    const interval = setInterval(fetchRoomState, 1500);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleCopyCode = () => {
    if (!room) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(room.code).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const nextReady = !isReady;
      const res = await fetch(`/api/rooms/${roomId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          memberToken,
          isReady: nextReady,
        }),
      });
      if (res.ok) {
        setIsReady(nextReady);
        fetchRoomState();
      }
    } catch {
      setErrorMsg('Không thể đổi trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAi = async () => {
    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostToken: memberToken,
          action: 'add_ai',
        }),
      });
      fetchRoomState();
    } catch {}
  };

  const handleRemoveAi = async () => {
    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostToken: memberToken,
          action: 'remove_ai',
        }),
      });
      fetchRoomState();
    } catch {}
  };

  const handleStartGame = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken: memberToken }),
      });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (data.error) {
        setErrorMsg(data.error);
      } else if (data.success) {
        onMatchStart();
      }
    } catch {
      setErrorMsg('Lỗi khi bắt đầu trận đấu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, memberToken }),
      });
    } catch {}
    onLeaveRoom();
  };

  if (!room) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-sm text-[#A3A3A3] animate-pulse">
          {VIETNAMESE_TEXT.multiplayer.connecting}
        </div>
      </div>
    );
  }

  const isHost = room.hostId === memberId;
  const members: any[] = room.members || [];
  const humanCount = members.filter((m) => !m.isAi).length;
  const allHumanReady = members.every((m) => m.isAi || m.isReady);
  const canStart = isHost && members.length >= 2 && allHumanReady;
  const levelInfo = getLevelById(room.levelId) || getLevelById('level_1_1')!;

  return (
    <div className="h-full w-full flex flex-col p-4 max-w-xl mx-auto overflow-hidden">
      {/* Top Bar: Room Code & Map info */}
      <div className="flex items-center justify-between p-3.5 bg-[#262626] border border-[#3A3A3A] rounded-2xl mb-3 shadow-md">
        <div>
          <div className="text-xs text-[#A3A3A3] font-semibold">
            {VIETNAMESE_TEXT.multiplayer.roomCode}
          </div>
          <div className="text-2xl font-black font-mono tracking-widest text-[#FFFFFF]">
            {room.code}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyCode}
            className="gap-1.5 text-xs font-bold"
          >
            {copied ? <Check size={16} className="text-[#22C55E]" /> : <Copy size={16} />}
            <span>{copied ? VIETNAMESE_TEXT.multiplayer.copied : VIETNAMESE_TEXT.multiplayer.copyRoomCode}</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleLeave}
            className="p-2.5"
            title="Rời phòng"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>

      {/* Selected Kitchen Details */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl text-xs mb-3">
        <span className="text-[#A3A3A3]">Bản đồ: <strong className="text-[#ECECEC]">{levelInfo.nameVi}</strong></span>
        <span className="text-[#3B82F6] font-semibold">{members.length}/{room.maxPlayers} người chơi</span>
      </div>

      {/* Error message banner */}
      {errorMsg && (
        <div className="p-3 mb-3 bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* 8 Player Slots Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 pr-1">
        {Array.from({ length: room.maxPlayers }).map((_, idx) => {
          const member = members[idx];
          if (member) {
            const chef = getChefById(member.characterId);
            return (
              <Card
                key={member.id}
                className="p-3 flex flex-col items-center justify-between text-center relative border-[#3A3A3A]"
              >
                {/* Host Crown badge */}
                {member.isHost && (
                  <div className="absolute top-2 left-2 text-[#EAB308]">
                    <Crown size={16} />
                  </div>
                )}

                {/* AI Badge */}
                {member.isAi && (
                  <div className="absolute top-2 right-2 text-[#10B981]">
                    <Bot size={16} />
                  </div>
                )}

                {/* Chef Avatar */}
                <div
                  className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center relative my-1 shadow-md"
                  style={{ backgroundColor: chef.color }}
                >
                  <div className="w-6 h-6 rounded-full bg-white border border-slate-300 absolute -top-1" />
                </div>

                {/* Name */}
                <div className="font-bold text-xs text-[#ECECEC] truncate max-w-full">
                  {member.name}
                  {member.id === memberId && ' (Bạn)'}
                </div>

                {/* Status Badge */}
                <span
                  className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    member.isReady
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
                      : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                  }`}
                >
                  {member.isReady ? VIETNAMESE_TEXT.multiplayer.ready : VIETNAMESE_TEXT.multiplayer.notReady}
                </span>
              </Card>
            );
          }

          // Empty Slot
          return (
            <div
              key={idx}
              className="p-3 border-2 border-dashed border-[#3A3A3A] rounded-2xl flex flex-col items-center justify-center text-center text-[#555555] min-h-[120px]"
            >
              <div className="w-8 h-8 rounded-full border border-dashed border-[#444444] flex items-center justify-center text-xs mb-1 font-bold">
                {idx + 1}
              </div>
              <span className="text-[11px] font-medium">Trống</span>
            </div>
          );
        })}
      </div>

      {/* Host AI Controls */}
      {isHost && (
        <div className="flex gap-2 mb-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddAi}
            disabled={members.length >= room.maxPlayers}
            className="flex-1 gap-1 text-xs"
          >
            <UserPlus size={14} />
            <span>{VIETNAMESE_TEXT.multiplayer.addAiChef}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRemoveAi}
            disabled={!members.some((m) => m.isAi)}
            className="flex-1 gap-1 text-xs"
          >
            <UserMinus size={14} />
            <span>{VIETNAMESE_TEXT.multiplayer.removeAiChef}</span>
          </Button>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={isReady ? 'secondary' : 'success'}
          size="lg"
          onClick={handleToggleReady}
          disabled={actionLoading}
          className="flex-1 font-bold text-base shadow-lg"
        >
          {isReady ? VIETNAMESE_TEXT.multiplayer.notReady : VIETNAMESE_TEXT.multiplayer.ready}
        </Button>

        {isHost && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartGame}
            disabled={!canStart || actionLoading}
            className="flex-1 font-bold text-base shadow-lg gap-2"
          >
            <Play size={20} className="fill-black" />
            <span>{VIETNAMESE_TEXT.multiplayer.startGame}</span>
          </Button>
        )}
      </div>

      {isHost && !canStart && (
        <p className="text-[11px] text-center text-[#EAB308] mt-2 font-medium">
          {members.length < 2
            ? VIETNAMESE_TEXT.multiplayer.needAtLeastTwoPlayers
            : VIETNAMESE_TEXT.multiplayer.allPlayersMustBeReady}
        </p>
      )}
    </div>
  );
};
