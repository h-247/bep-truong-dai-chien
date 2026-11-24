'use client';

import React from 'react';
import {
  Play,
  User,
  Bot,
  Users,
  Globe,
  Compass,
  BookOpen,
  Trophy,
  Award,
  Settings,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { VIETNAMESE_TEXT } from '@/src/locales/vi';

interface HomeScreenProps {
  onStartSinglePlayer: () => void;
  onStartAiCoop: () => void;
  onStartLocalCoop: () => void;
  onOpenMultiplayer: () => void;
  onOpenLevelSelect: () => void;
  onStartPractice: () => void;
  onOpenRecipes: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  highScore: number;
  totalStars: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartSinglePlayer,
  onStartAiCoop,
  onStartLocalCoop,
  onOpenMultiplayer,
  onOpenLevelSelect,
  onStartPractice,
  onOpenRecipes,
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenProfile,
  onOpenSettings,
  onOpenTutorial,
  highScore,
  totalStars,
}) => {
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-between p-4 max-w-md mx-auto overflow-y-auto no-scrollbar">
      {/* 1. Header & Branding */}
      <div className="w-full flex flex-col items-center text-center mt-2 mb-4">
        {/* Logo / Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#EF4444] via-[#F59E0B] to-[#3B82F6] flex items-center justify-center shadow-xl mb-3 border border-white/20">
          <Flame size={36} className="text-white drop-shadow-md" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#ECECEC] uppercase">
          {VIETNAMESE_TEXT.appName}
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1 max-w-xs font-medium">
          {VIETNAMESE_TEXT.tagline}
        </p>

        {/* Stats summary banner */}
        <div className="flex items-center gap-4 mt-3 py-1.5 px-4 bg-[#262626] border border-[#3A3A3A] rounded-full text-xs font-semibold text-[#ECECEC] shadow-sm">
          <span className="flex items-center gap-1 text-[#EAB308]">
            ★ {totalStars} sao
          </span>
          <span className="w-1 h-1 rounded-full bg-[#4A4A4A]" />
          <span className="text-[#A3A3A3]">
            Kỷ lục: <strong className="text-[#ECECEC]">{highScore}</strong>
          </span>
        </div>
      </div>

      {/* 2. Main Game Mode Selection */}
      <div className="w-full flex flex-col gap-2.5 my-auto">
        {/* Quick Play (Chơi ngay) */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onStartSinglePlayer}
          className="gap-2.5 shadow-xl text-lg font-bold"
        >
          <Play size={24} className="fill-black" />
          <span>{VIETNAMESE_TEXT.nav.playNow}</span>
        </Button>

        {/* Online Multiplayer (Chơi trực tuyến 2–8 người) */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onOpenMultiplayer}
          className="justify-between border-[#3B82F6]/50 bg-[#1E293B]/60 hover:bg-[#1E293B] text-[#FFFFFF]"
        >
          <div className="flex items-center gap-2.5">
            <Globe size={20} className="text-[#3B82F6]" />
            <span className="font-bold">{VIETNAMESE_TEXT.nav.onlineCoop}</span>
          </div>
          <span className="text-xs bg-[#3B82F6] text-white px-2 py-0.5 rounded-full font-semibold">
            2–8 người
          </span>
        </Button>

        {/* AI Co-op (Chơi với AI) */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onStartAiCoop}
          className="justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Bot size={20} className="text-[#10B981]" />
            <span>{VIETNAMESE_TEXT.nav.aiCoop}</span>
          </div>
          <span className="text-xs text-[#A3A3A3]">Tự động hỗ trợ</span>
        </Button>

        {/* Local Co-op (Chơi cùng bạn trên 1 máy) */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onStartLocalCoop}
          className="justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Users size={20} className="text-[#F59E0B]" />
            <span>{VIETNAMESE_TEXT.nav.localCoop}</span>
          </div>
          <span className="text-xs text-[#A3A3A3]">2 người 1 máy</span>
        </Button>

        {/* Campaign / Level Selection (Chọn cấp độ) */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onOpenLevelSelect}
          className="justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Compass size={20} className="text-[#EC4899]" />
            <span>{VIETNAMESE_TEXT.nav.selectLevel}</span>
          </div>
          <span className="text-xs text-[#A3A3A3]">20 màn chơi</span>
        </Button>

        {/* Practice Mode (Luyện tập không giới hạn giờ) */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onStartPractice}
          className="justify-between"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen size={20} className="text-[#A855F7]" />
            <span>{VIETNAMESE_TEXT.nav.practice}</span>
          </div>
          <span className="text-xs text-[#A3A3A3]">Không giới hạn giờ</span>
        </Button>
      </div>

      {/* 3. Bottom Utility Quick Buttons */}
      <div className="w-full grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-[#3A3A3A]">
        <button
          onClick={onOpenRecipes}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[#A3A3A3] hover:text-[#ECECEC] hover:bg-[#262626] transition-colors cursor-pointer"
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-medium">{VIETNAMESE_TEXT.nav.recipes}</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[#A3A3A3] hover:text-[#ECECEC] hover:bg-[#262626] transition-colors cursor-pointer"
        >
          <Trophy size={20} />
          <span className="text-[10px] font-medium">Bảng điểm</span>
        </button>

        <button
          onClick={onOpenAchievements}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[#A3A3A3] hover:text-[#ECECEC] hover:bg-[#262626] transition-colors cursor-pointer"
        >
          <Award size={20} />
          <span className="text-[10px] font-medium">{VIETNAMESE_TEXT.nav.achievements}</span>
        </button>

        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[#A3A3A3] hover:text-[#ECECEC] hover:bg-[#262626] transition-colors cursor-pointer"
        >
          <User size={20} />
          <span className="text-[10px] font-medium">{VIETNAMESE_TEXT.nav.profile}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[#A3A3A3] hover:text-[#ECECEC] hover:bg-[#262626] transition-colors cursor-pointer"
        >
          <Settings size={20} />
          <span className="text-[10px] font-medium">{VIETNAMESE_TEXT.nav.settings}</span>
        </button>
      </div>
    </div>
  );
};
