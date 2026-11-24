'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, RefreshCw, Lock, Users, Search } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Modal } from '@/src/components/ui/Modal';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';
import { LEVELS } from '@/src/game/levels';

interface RoomBrowserScreenProps {
  onBack: () => void;
  onJoinSuccess: (roomId: string, memberId: string, memberToken: string) => void;
  playerName: string;
  characterId: string;
}

export const RoomBrowserScreen: React.FC<RoomBrowserScreenProps> = ({
  onBack,
  onJoinSuccess,
  playerName,
  characterId,
}) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Join by code state
  const [codeQuery, setCodeQuery] = useState('');

  // Create room modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState(`Phòng của ${playerName}`);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [selectedLevelId, setSelectedLevelId] = useState('level_1_1');
  const [difficulty, setDifficulty] = useState('normal');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [password, setPassword] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/rooms');
      const data = (await res.json()) as { rooms?: any[] };
      setRooms(data.rooms || []);
    } catch {
      setErrorMsg('Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoinByCode = async (codeToJoin: string) => {
    if (!codeToJoin.trim()) return;
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToJoin.trim(),
          name: playerName,
          characterId,
        }),
      });

      const data = (await res.json()) as { error?: string; room?: { id: string }; memberId?: string; memberToken?: string };
      if (data.error) {
        setErrorMsg(data.error);
      } else if (data.room && data.memberId && data.memberToken) {
        onJoinSuccess(data.room.id, data.memberId, data.memberToken);
      }
    } catch {
      setErrorMsg('Lỗi kết nối tới máy chủ phòng.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          hostName: playerName,
          characterId,
          maxPlayers,
          levelId: selectedLevelId,
          difficulty,
          visibility,
          password: password || undefined,
        }),
      });

      const data = (await res.json()) as { error?: string; room?: { id: string }; memberId?: string; memberToken?: string };
      if (data.error) {
        setErrorMsg(data.error);
      } else if (data.room && data.memberId && data.memberToken) {
        setIsCreateOpen(false);
        onJoinSuccess(data.room.id, data.memberId, data.memberToken);
      }
    } catch {
      setErrorMsg('Không thể tạo phòng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-4 max-w-xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-[#262626] border border-[#3A3A3A] text-[#ECECEC] hover:bg-[#303030] active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#ECECEC]">{VIETNAMESE_TEXT.nav.onlineCoop}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchRooms}
            disabled={loading}
            className="p-2.5"
            title="Làm mới"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 font-bold"
          >
            <Plus size={18} />
            <span>{VIETNAMESE_TEXT.multiplayer.createRoom}</span>
          </Button>
        </div>
      </div>

      {/* Join by Room Code Bar */}
      <Card className="p-3 mb-3 flex items-center gap-2 bg-[#1A1A1A]">
        <input
          type="text"
          value={codeQuery}
          onChange={(e) => setCodeQuery(e.target.value.toUpperCase())}
          placeholder="Nhập mã phòng 6 ký tự..."
          maxLength={6}
          className="flex-1 bg-transparent border-none text-[#ECECEC] placeholder-[#666666] font-mono tracking-widest text-base focus:outline-none uppercase"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleJoinByCode(codeQuery)}
          disabled={codeQuery.length < 3 || loading}
        >
          {VIETNAMESE_TEXT.multiplayer.joinRoom}
        </Button>
      </Card>

      {/* Error message banner */}
      {errorMsg && (
        <div className="p-3 mb-3 bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Public Rooms List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
        <h2 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-0.5">
          {VIETNAMESE_TEXT.multiplayer.roomList} ({rooms.length})
        </h2>

        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#A3A3A3]">
            <Users size={40} className="text-[#3A3A3A] mb-2" />
            <p className="text-sm font-medium">Chưa có phòng công khai nào.</p>
            <p className="text-xs mt-1">Hãy tạo phòng mới và mời bạn bè tham gia!</p>
          </div>
        ) : (
          rooms.map((room) => {
            const isFull = room.playerCount >= room.maxPlayers;
            return (
              <Card
                key={room.id}
                className="flex items-center justify-between p-3.5 hover:border-[#4A4A4A] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#ECECEC]">{room.name}</span>
                    {room.hasPassword && <Lock size={14} className="text-[#EAB308]" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#A3A3A3] mt-1">
                    <span>Chủ phòng: {room.hostName}</span>
                    <span>•</span>
                    <span className="text-[#3B82F6]">Mã: {room.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#ECECEC]">
                    {room.playerCount}/{room.maxPlayers}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isFull || loading}
                    onClick={() => handleJoinByCode(room.code)}
                  >
                    {isFull ? VIETNAMESE_TEXT.multiplayer.roomFull : VIETNAMESE_TEXT.multiplayer.joinRoom}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={VIETNAMESE_TEXT.multiplayer.createRoom}
        maxWidth="md"
      >
        <div className="flex flex-col gap-3.5">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-bold text-[#ECECEC] mb-1">Tên phòng</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={32}
              className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-3.5 py-2.5 text-sm text-[#ECECEC] focus:outline-none focus:border-[#FFFFFF]"
            />
          </div>

          {/* Max Players (2 to 8) */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#ECECEC] mb-1">
              <span>{VIETNAMESE_TEXT.multiplayer.maxPlayers}</span>
              <span className="text-[#3B82F6]">{maxPlayers} người chơi</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full accent-white cursor-pointer h-2 bg-[#1A1A1A] rounded-lg"
            />
          </div>

          {/* Select Map */}
          <div>
            <label className="block text-xs font-bold text-[#ECECEC] mb-1">
              {VIETNAMESE_TEXT.multiplayer.selectMap}
            </label>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-3.5 py-2.5 text-sm text-[#ECECEC] focus:outline-none focus:border-[#FFFFFF]"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id} className="bg-[#262626] text-white">
                  {lvl.nameVi} ({lvl.worldNameVi})
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setVisibility('public')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                visibility === 'public'
                  ? 'bg-[#303030] border-[#FFFFFF] text-white'
                  : 'bg-[#1A1A1A] border-[#3A3A3A] text-[#A3A3A3]'
              }`}
            >
              {VIETNAMESE_TEXT.multiplayer.publicRoom}
            </button>
            <button
              onClick={() => setVisibility('private')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                visibility === 'private'
                  ? 'bg-[#303030] border-[#FFFFFF] text-white'
                  : 'bg-[#1A1A1A] border-[#3A3A3A] text-[#A3A3A3]'
              }`}
            >
              {VIETNAMESE_TEXT.multiplayer.privateRoom}
            </button>
          </div>

          {/* Password (optional) */}
          {visibility === 'private' && (
            <div>
              <label className="block text-xs font-bold text-[#ECECEC] mb-1">
                Mật khẩu phòng (tùy chọn)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Để trống nếu không khóa..."
                className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-3.5 py-2 text-sm text-[#ECECEC] focus:outline-none"
              />
            </div>
          )}

          <Button
            variant="primary"
            fullWidth
            onClick={handleCreateRoom}
            disabled={loading || !roomName.trim()}
            className="mt-2"
          >
            {VIETNAMESE_TEXT.multiplayer.createRoom}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
