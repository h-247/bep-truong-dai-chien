'use client';

import React, { useState, useEffect } from 'react';
import { HomeScreen } from '@/src/features/home/HomeScreen';
import { LevelSelectScreen } from '@/src/features/campaign/LevelSelectScreen';
import { RoomBrowserScreen } from '@/src/features/multiplayer/RoomBrowserScreen';
import { RoomLobbyScreen } from '@/src/features/multiplayer/RoomLobbyScreen';
import { GameScreen } from '@/src/features/gameplay/GameScreen';

import { RecipeEncyclopediaModal } from '@/src/components/modals/RecipeEncyclopediaModal';
import { LeaderboardModal } from '@/src/components/modals/LeaderboardModal';
import { AchievementsModal } from '@/src/components/modals/AchievementsModal';
import { ProfileModal } from '@/src/components/modals/ProfileModal';
import { SettingsModal } from '@/src/components/modals/SettingsModal';
import { Modal } from '@/src/components/ui/Modal';
import { GameMode } from '@/src/types';
import { LEVELS } from '@/src/game/levels';

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'level_select' | 'room_browser' | 'room_lobby' | 'gameplay'
  >('home');

  // Game session parameters
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('level_1_1');

  // Online Multiplayer State
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [activeMemberId, setActiveMemberId] = useState<string>('');
  const [activeMemberToken, setActiveMemberToken] = useState<string>('');

  // Persistent Player Profile & Preferences
  const [playerName, setPlayerName] = useState<string>('Đầu bếp tài ba');
  const [characterId, setCharacterId] = useState<string>('chef_1');
  const [isLeftHanded, setIsLeftHanded] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);
  const [totalStars, setTotalStars] = useState<number>(0);
  const [unlockedLevelIds, setUnlockedLevelIds] = useState<string[]>(['level_1_1']);
  const [levelStars, setLevelStars] = useState<Record<string, number>>({});
  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(0);

  // Modals state
  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Load local progress on mount
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('bep_player_name');
      if (savedName) setPlayerName(savedName);

      const savedChar = localStorage.getItem('bep_character_id');
      if (savedChar) setCharacterId(savedChar);

      const savedLeftHand = localStorage.getItem('bep_left_handed');
      if (savedLeftHand) setIsLeftHanded(savedLeftHand === 'true');

      const savedUnlocked = localStorage.getItem('bep_unlocked_levels');
      if (savedUnlocked) setUnlockedLevelIds(JSON.parse(savedUnlocked));

      const savedStars = localStorage.getItem('bep_level_stars');
      if (savedStars) {
        const parsed = JSON.parse(savedStars);
        setLevelStars(parsed);
        const sum = Object.values(parsed).reduce((a: number, b: any) => a + (Number(b) || 0), 0) as number;
        setTotalStars(sum);
      }

      const savedHigh = localStorage.getItem('bep_high_score');
      if (savedHigh) setHighScore(Number(savedHigh));

      const savedOrders = localStorage.getItem('bep_completed_orders');
      if (savedOrders) setCompletedOrdersCount(Number(savedOrders));
    } catch {}
  }, []);

  // Save changes
  const handleSelectCharacter = (charId: string) => {
    setCharacterId(charId);
    try {
      localStorage.setItem('bep_character_id', charId);
    } catch {}
  };

  const handleToggleLeftHanded = (val: boolean) => {
    setIsLeftHanded(val);
    try {
      localStorage.setItem('bep_left_handed', String(val));
    } catch {}
  };

  const handleResetProgress = () => {
    setUnlockedLevelIds(['level_1_1']);
    setLevelStars({});
    setTotalStars(0);
    setHighScore(0);
    setCompletedOrdersCount(0);
    try {
      localStorage.removeItem('bep_unlocked_levels');
      localStorage.removeItem('bep_level_stars');
      localStorage.removeItem('bep_high_score');
      localStorage.removeItem('bep_completed_orders');
    } catch {}
  };

  // Screen Transitions
  const handleStartGame = (mode: GameMode, lvlId: string = 'level_1_1') => {
    setGameMode(mode);
    setSelectedLevelId(lvlId);
    setCurrentScreen('gameplay');
  };

  const handleJoinMultiplayerSuccess = (
    roomId: string,
    memberId: string,
    memberToken: string,
  ) => {
    setActiveRoomId(roomId);
    setActiveMemberId(memberId);
    setActiveMemberToken(memberToken);
    setCurrentScreen('room_lobby');
  };

  const handleNextLevel = () => {
    const currentIndex = LEVELS.findIndex((l) => l.id === selectedLevelId);
    if (currentIndex >= 0 && currentIndex < LEVELS.length - 1) {
      const nextId = LEVELS[currentIndex + 1].id;
      if (!unlockedLevelIds.includes(nextId)) {
        const updated = [...unlockedLevelIds, nextId];
        setUnlockedLevelIds(updated);
        try {
          localStorage.setItem('bep_unlocked_levels', JSON.stringify(updated));
        } catch {}
      }
      setSelectedLevelId(nextId);
    } else {
      setCurrentScreen('home');
    }
  };

  return (
    <main className="w-full h-full bg-[#212121] text-[#ECECEC] flex flex-col overflow-hidden">
      {/* Active Screen View */}
      {currentScreen === 'home' && (
        <HomeScreen
          onStartSinglePlayer={() => handleStartGame('single', 'level_1_1')}
          onStartAiCoop={() => handleStartGame('ai_coop', 'level_1_1')}
          onStartLocalCoop={() => handleStartGame('local_coop', 'level_1_1')}
          onOpenMultiplayer={() => setCurrentScreen('room_browser')}
          onOpenLevelSelect={() => setCurrentScreen('level_select')}
          onStartPractice={() => handleStartGame('practice', 'level_1_1')}
          onOpenRecipes={() => setIsRecipesOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          highScore={highScore}
          totalStars={totalStars}
        />
      )}

      {currentScreen === 'level_select' && (
        <LevelSelectScreen
          onBack={() => setCurrentScreen('home')}
          onSelectLevel={(lvlId) => handleStartGame('campaign', lvlId)}
          unlockedLevelIds={unlockedLevelIds}
          levelStars={levelStars}
        />
      )}

      {currentScreen === 'room_browser' && (
        <RoomBrowserScreen
          onBack={() => setCurrentScreen('home')}
          onJoinSuccess={handleJoinMultiplayerSuccess}
          playerName={playerName}
          characterId={characterId}
        />
      )}

      {currentScreen === 'room_lobby' && (
        <RoomLobbyScreen
          roomId={activeRoomId}
          memberId={activeMemberId}
          memberToken={activeMemberToken}
          onMatchStart={() => {
            setGameMode('online_coop');
            setCurrentScreen('gameplay');
          }}
          onLeaveRoom={() => setCurrentScreen('room_browser')}
        />
      )}

      {currentScreen === 'gameplay' && (
        <GameScreen
          mode={gameMode}
          levelId={selectedLevelId}
          playerName={playerName}
          characterId={characterId}
          isLeftHanded={isLeftHanded}
          onQuitToMenu={() => setCurrentScreen('home')}
          onNextLevel={handleNextLevel}
          onlineRoomId={activeRoomId}
          onlineMemberId={activeMemberId}
          onlineMemberToken={activeMemberToken}
        />
      )}

      {/* Global Modals */}
      <RecipeEncyclopediaModal
        isOpen={isRecipesOpen}
        onClose={() => setIsRecipesOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        playerName={playerName}
        selectedCharacterId={characterId}
        onSelectCharacter={handleSelectCharacter}
        stats={{
          totalScore: highScore,
          totalStars: totalStars,
          completedOrders: completedOrdersCount,
          completedLevels: unlockedLevelIds.length,
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isLeftHanded={isLeftHanded}
        onToggleLeftHanded={handleToggleLeftHanded}
        onResetProgress={handleResetProgress}
      />

      {/* Tutorial Modal */}
      <Modal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        title="Hướng dẫn chơi game"
        maxWidth="md"
      >
        <div className="flex flex-col gap-3 text-xs text-[#ECECEC] leading-relaxed">
          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#3A3A3A]">
            <h4 className="font-bold text-sm text-[#EAB308] mb-1">1. Quy trình nấu ăn</h4>
            <p>
              Nhận đơn khách hàng ở góc trên ➔ Lấy nguyên liệu từ thùng ➔ Cắt tại thớt ➔ Nấu trên
              chảo, nồi hoặc lò ➔ Bày lên đĩa sạch ➔ Đem đến quầy giao món (➔) để ghi điểm!
            </p>
          </div>

          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#3A3A3A]">
            <h4 className="font-bold text-sm text-[#EF4444] mb-1">2. Cảnh báo cháy bếp</h4>
            <p>
              Món ăn nấu trên bếp quá lâu sẽ bị khét và bốc cháy! Khi cháy bếp, hãy cầm bình cứu hỏa
              (🧯) lại gần và bấm &ldquo;Tương tác&rdquo; để dập lửa ngay lập tức.
            </p>
          </div>

          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#3A3A3A]">
            <h4 className="font-bold text-sm text-[#3B82F6] mb-1">3. Rửa đĩa bẩn</h4>
            <p>
              Giao món xong sẽ xuất hiện đĩa bẩn. Hãy nhặt đĩa bẩn cho vào bồn rửa và giữ nút
              &ldquo;Tương tác&rdquo; để rửa sạch rồi tái sử dụng.
            </p>
          </div>

          <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#3A3A3A]">
            <h4 className="font-bold text-sm text-[#22C55E] mb-1">4. Điều khiển di động & máy tính</h4>
            <p>
              <strong>Di động:</strong> Cần gạt joystick bên trái, các nút Nhặt/Đặt, Tương tác, Tăng tốc
              bên phải.
              <br />
              <strong>Máy tính:</strong> Phím W, A, S, D di chuyển, E nhặt/đặt, F tương tác, Space tăng
              tốc, Tab đổi đầu bếp, Q chat nhanh, R ping.
            </p>
          </div>
        </div>
      </Modal>
    </main>
  );
}
