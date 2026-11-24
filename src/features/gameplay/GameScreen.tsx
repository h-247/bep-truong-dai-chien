'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '@/src/game/core/game-engine';
import { CanvasRenderer } from '@/src/game/rendering/canvas-renderer';
import { InputManager } from '@/src/game/input/input-manager';
import { AiChefController, AiCommand } from '@/src/game/ai/ai-chef';
import { MultiplayerNetworkClient } from '@/src/game/multiplayer/network-client';
import { OrderQueue } from '@/src/components/hud/OrderQueue';
import { MobileControls } from '@/src/components/hud/MobileControls';
import { QuickChatModal } from '@/src/components/hud/QuickChatModal';
import { AiCommandModal } from '@/src/components/hud/AiCommandModal';
import { MatchResultModal } from '@/src/components/modals/MatchResultModal';
import { LevelConfig, GameSnapshot, GameMode } from '@/src/types';
import { getLevelById } from '@/src/game/levels';
import { sound } from '@/src/game/audio/synth';
import { Pause, Play, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface GameScreenProps {
  mode: GameMode;
  levelId: string;
  playerName: string;
  characterId: string;
  isLeftHanded?: boolean;
  onQuitToMenu: () => void;
  onNextLevel?: () => void;
  // For online multiplayer
  onlineRoomId?: string;
  onlineMemberId?: string;
  onlineMemberToken?: string;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode,
  levelId,
  playerName,
  characterId,
  isLeftHanded = false,
  onQuitToMenu,
  onNextLevel,
  onlineRoomId,
  onlineMemberId,
  onlineMemberToken,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Engine & Renderer refs
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const aiControllersRef = useRef<AiChefController[]>([]);
  const networkClientRef = useRef<MultiplayerNetworkClient | null>(null);

  // Local state for HUD
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);
  const [isAiCommandOpen, setIsAiCommandOpen] = useState(false);
  const [currentAiCommand, setCurrentAiCommand] = useState<AiCommand>('auto');
  const [matchOver, setMatchOver] = useState(false);
  const [finalResults, setFinalResults] = useState<{
    score: number;
    stars: number;
    completedOrders: number;
    failedOrders: number;
    highestCombo: number;
  }>({ score: 0, stars: 0, completedOrders: 0, failedOrders: 0, highestCombo: 1 });

  const [activeChefIndex, setActiveChefIndex] = useState(0);

  const isOnline = mode === 'online_coop';
  const level = getLevelById(levelId) || getLevelById('level_1_1')!;

  // 1. Initialize input manager
  useEffect(() => {
    const input = new InputManager();
    inputManagerRef.current = input;
    return () => input.destroy();
  }, []);

  // 2. Initialize Game Engine / Network Client
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new CanvasRenderer(
      canvasRef.current,
      isOnline ? onlineMemberId : 'p1',
    );
    rendererRef.current = renderer;

    if (!isOnline) {
      // Offline mode (Single, AI, Local, Practice, Campaign)
      const playersList: Array<{ id: string; name: string; characterId: string; isAi: boolean }> = [
        { id: 'p1', name: playerName, characterId, isAi: false },
      ];

      if (mode === 'ai_coop') {
        playersList.push({
          id: 'ai_1',
          name: 'Phụ Bếp AI',
          characterId: 'chef_2',
          isAi: true,
        });
      } else if (mode === 'local_coop') {
        playersList.push({
          id: 'p2',
          name: 'Người Chơi 2',
          characterId: 'chef_2',
          isAi: false,
        });
      }

      const engine = new GameEngine({
        level: mode === 'practice' ? { ...level, timeLimit: 0 } : level,
        playerCount: playersList.length,
        players: playersList,
        isClientSideOnly: true,
      });
      engineRef.current = engine;

      // Setup AI controller if AI co-op
      if (mode === 'ai_coop') {
        const ai = new AiChefController(engine, 'ai_1');
        aiControllersRef.current = [ai];
      }

      setSnapshot(engine.getSnapshot());
    } else {
      // Online mode: Network client
      if (onlineRoomId && onlineMemberId && onlineMemberToken) {
        const client = new MultiplayerNetworkClient({
          roomId: onlineRoomId,
          memberId: onlineMemberId,
          memberToken: onlineMemberToken,
          onSnapshot: (snap) => {
            setSnapshot(snap);
            if (snap.isOver) {
              setMatchOver(true);
              setFinalResults({
                score: snap.score,
                stars: snap.starsEarned,
                completedOrders: 0,
                failedOrders: 0,
                highestCombo: snap.combo,
              });
            }
          },
          onMatchFinished: (results: any) => {
            setMatchOver(true);
            if (results) {
              setFinalResults({
                score: results.teamScore,
                stars: results.stars,
                completedOrders: results.completedOrders,
                failedOrders: results.failedOrders,
                highestCombo: results.highestCombo,
              });
            }
          },
          onError: () => {},
        });
        networkClientRef.current = client;
        client.start();
      }
    }

    return () => {
      networkClientRef.current?.stop();
    };
  }, [mode, levelId, isOnline, onlineRoomId, onlineMemberId, onlineMemberToken]);

  // 3. Canvas dynamic resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 4. Main Animation & Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const input = inputManagerRef.current;
      const renderer = rendererRef.current;
      const engine = engineRef.current;

      if (!isOnline && engine && !isPaused && !engine.isGameOver) {
        // Read Player 1 Input
        if (input) {
          const p1Input = input.getPlayer1Input();
          const targetPlayerId = activeChefIndex === 0 ? 'p1' : 'ai_1';

          engine.movePlayer(targetPlayerId, p1Input.dx, p1Input.dy, p1Input.dash);
          if (p1Input.pickupDrop) engine.pickupOrDrop(targetPlayerId);
          if (p1Input.interact) engine.interact(targetPlayerId);
          if (p1Input.switchChef && mode === 'ai_coop') {
            setActiveChefIndex((prev) => (prev === 0 ? 1 : 0));
          }
          if (p1Input.ping) {
            const p = engine.players.get(targetPlayerId);
            if (p) engine.addPing(targetPlayerId, p.x, p.y);
          }

          // Player 2 Input for local co-op
          if (mode === 'local_coop') {
            const p2Input = input.getPlayer2Input();
            engine.movePlayer('p2', p2Input.dx, p2Input.dy, p2Input.dash);
            if (p2Input.pickupDrop) engine.pickupOrDrop('p2');
            if (p2Input.interact) engine.interact('p2');
          }

          input.resetActionTriggers();
        }

        // Update AI Chef (if AI mode and AI not manually controlled)
        if (mode === 'ai_coop' && activeChefIndex === 0) {
          aiControllersRef.current.forEach((ai) => ai.update(dt));
        }

        // Advance engine tick
        engine.update(dt);
        const snap = engine.getSnapshot();
        setSnapshot(snap);

        if (engine.isGameOver) {
          setMatchOver(true);
          setFinalResults({
            score: engine.score,
            stars: engine.calculateStars(),
            completedOrders: engine.completedOrdersCount,
            failedOrders: engine.failedOrdersCount,
            highestCombo: engine.highestCombo,
          });
        }
      } else if (isOnline && networkClientRef.current && input) {
        // Read local input and forward to network client
        const p1Input = input.getPlayer1Input();
        networkClientRef.current.sendInput({
          dx: p1Input.dx,
          dy: p1Input.dy,
          dash: p1Input.dash,
          pickupDrop: p1Input.pickupDrop,
          interact: p1Input.interact,
        });
        input.resetActionTriggers();
      }

      // Render to Canvas
      if (renderer && snapshot) {
        renderer.render(snapshot, level.gridWidth, level.gridHeight, dt);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOnline, isPaused, snapshot, activeChefIndex, mode, level]);

  const handlePingAction = () => {
    if (!isOnline && engineRef.current) {
      const p = engineRef.current.players.get('p1');
      if (p) engineRef.current.addPing('p1', p.x, p.y);
    } else if (isOnline && networkClientRef.current && snapshot) {
      const me = snapshot.players.find((p) => p.id === onlineMemberId);
      if (me) {
        networkClientRef.current.sendInput({
          ping: { x: me.x, y: me.y, type: 'general' },
        });
      }
    }
  };

  const handleSendQuickChat = (msg: string) => {
    if (!isOnline && engineRef.current) {
      engineRef.current.addQuickChatMessage('p1', msg);
    } else if (isOnline && networkClientRef.current) {
      networkClientRef.current.sendInput({ chat: msg });
    }
  };

  const handleSelectAiCommand = (cmd: AiCommand) => {
    setCurrentAiCommand(cmd);
    aiControllersRef.current.forEach((ai) => ai.setCommand(cmd));
  };

  const timeDisplay = snapshot
    ? level.timeLimit === 0
      ? '∞'
      : `${Math.floor(snapshot.timeRemaining / 60)}:${String(
          Math.floor(snapshot.timeRemaining % 60),
        ).padStart(2, '0')}`
    : '--:--';

  const isLowTime = snapshot && level.timeLimit > 0 && snapshot.timeRemaining <= 30;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#1A1A1A]">
      {/* 1. Top HUD Bar */}
      <div className="absolute top-0 inset-x-0 z-30 p-2 sm:p-3 flex items-start justify-between pointer-events-none gap-2">
        {/* Left: Customer Order Queue */}
        <div className="flex-1 overflow-hidden">
          <OrderQueue orders={snapshot?.orders || []} />
        </div>

        {/* Right: Timer, Score, Combo & Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Timer Card */}
          <div
            className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-base sm:text-lg shadow-md ${
              isLowTime
                ? 'bg-[#EF4444] text-white border-white animate-pulse'
                : 'bg-[#262626]/90 text-[#ECECEC] border-[#3A3A3A]'
            }`}
          >
            {timeDisplay}
          </div>

          {/* Score & Combo Card */}
          <div className="px-3 py-1.5 rounded-xl bg-[#262626]/90 border border-[#3A3A3A] text-right shadow-md">
            <div className="text-sm sm:text-base font-extrabold text-[#22C55E]">
              {snapshot?.score || 0}
            </div>
            {snapshot && snapshot.combo > 1 && (
              <div className="text-[10px] font-bold text-[#EAB308]">
                x{snapshot.combo} COMBO
              </div>
            )}
          </div>

          {/* Pause / Menu Button */}
          {!isOnline && (
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-2.5 rounded-xl bg-[#262626]/90 border border-[#3A3A3A] text-[#ECECEC] hover:bg-[#303030] active:scale-95 transition-all cursor-pointer shadow-md"
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Central Canvas Game Viewport */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block touch-none" />
      </div>

      {/* 3. Mobile Touch Controls HUD */}
      {inputManagerRef.current && (
        <MobileControls
          inputManager={inputManagerRef.current}
          isLeftHanded={isLeftHanded}
          onOpenQuickChat={() => setIsQuickChatOpen(true)}
          onOpenAiCommands={() => setIsAiCommandOpen(true)}
          onPing={handlePingAction}
          hasAiChef={mode === 'ai_coop'}
          canSwitchChef={mode === 'ai_coop'}
        />
      )}

      {/* 4. Quick Chat Modal */}
      <QuickChatModal
        isOpen={isQuickChatOpen}
        onClose={() => setIsQuickChatOpen(false)}
        onSelectMessage={handleSendQuickChat}
      />

      {/* 5. AI Command Modal */}
      <AiCommandModal
        isOpen={isAiCommandOpen}
        onClose={() => setIsAiCommandOpen(false)}
        onSelectCommand={handleSelectAiCommand}
        currentCommand={currentAiCommand}
      />

      {/* 6. Pause Dialog */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#262626] border border-[#3A3A3A] rounded-2xl p-5 flex flex-col gap-3 text-center shadow-2xl">
            <h2 className="text-xl font-bold text-[#ECECEC]">Tạm dừng trò chơi</h2>
            <Button variant="primary" fullWidth onClick={() => setIsPaused(false)}>
              Tiếp tục chơi
            </Button>
            <Button variant="secondary" fullWidth onClick={onQuitToMenu}>
              Về trang chủ
            </Button>
          </div>
        </div>
      )}

      {/* 7. Match Result Modal */}
      <MatchResultModal
        isOpen={matchOver}
        score={finalResults.score}
        stars={finalResults.stars}
        completedOrders={finalResults.completedOrders}
        failedOrders={finalResults.failedOrders}
        highestCombo={finalResults.highestCombo}
        onRetry={() => {
          setMatchOver(false);
          // Re-init engine
          if (engineRef.current) {
            engineRef.current = new GameEngine({
              level,
              playerCount: 1,
              players: [{ id: 'p1', name: playerName, characterId, isAi: false }],
              isClientSideOnly: true,
            });
            setSnapshot(engineRef.current.getSnapshot());
          }
        }}
        onNextLevel={onNextLevel}
        onHome={onQuitToMenu}
      />
    </div>
  );
};
