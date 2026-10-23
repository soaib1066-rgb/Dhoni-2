import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Users, Play, RotateCcw, BookOpen, Smartphone, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';
import { toBanglaNumber } from '../utils/banglaFormatter';

interface HomeScreenProps {
  hasSavedGame: boolean;
  onResumeGame: () => void;
  onStartBotGame: () => void;
  onStartMultiplayerGame: (playerCount: number) => void;
  onOpenRules: () => void;
  onOpenAndroidExport: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  hasSavedGame,
  onResumeGame,
  onStartBotGame,
  onStartMultiplayerGame,
  onOpenRules,
  onOpenAndroidExport,
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedMultiplayerCount, setSelectedMultiplayerCount] = useState<number>(2);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-emerald-950/40 to-slate-950 relative overflow-hidden select-none">
      {/* Subtle background ambient lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top action bar */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-20">
        <button
          type="button"
          onClick={onToggleSound}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white transition-colors shadow-sm"
          title={soundEnabled ? 'শব্দ বন্ধ' : 'শব্দ চালু'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
        </button>

        <button
          type="button"
          onClick={onOpenAndroidExport}
          className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          title="Android APK ও সোর্স কোড"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Android APK</span>
        </button>
      </div>

      {/* Hero Center Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col items-center text-center gap-6 relative z-10"
      >
        {/* Game Icon Logo */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 border-2 border-emerald-400/50 flex items-center justify-center shadow-xl shadow-emerald-950/60 p-2">
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-300">
              {/* Golden Dice and Crown Logo */}
              <rect x="18" y="22" width="64" height="64" rx="14" fill="#047857" stroke="#34D399" strokeWidth="3" />
              <circle cx="34" cy="38" r="5" fill="#FCD34D" />
              <circle cx="66" cy="38" r="5" fill="#FCD34D" />
              <circle cx="50" cy="54" r="5" fill="#FCD34D" />
              <circle cx="34" cy="70" r="5" fill="#FCD34D" />
              <circle cx="66" cy="70" r="5" fill="#FCD34D" />
              {/* Crown accent on top */}
              <path d="M30 18 L38 25 L50 14 L62 25 L70 18 L68 28 L32 28 Z" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow border border-amber-300">
            2D সংস্করণ
          </div>
        </div>

        {/* Title Lockup */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-300 tracking-tight">
            ধনী হবার মজার খেলা
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-medium">
            বাংলাদেশের ঐতিহ্যবাহী বোর্ড গেম · অফলাইন ও এআই মোড
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* Resume game button if exists */}
          {hasSavedGame && (
            <button
              type="button"
              onClick={onResumeGame}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 border border-amber-400/40 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>চলমান খেলা চালিয়ে যান (Resume)</span>
            </button>
          )}

          {/* Mode A: Bot Mode */}
          <button
            type="button"
            onClick={onStartBotGame}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-3 border border-emerald-400/40 active:scale-95 transition-all"
          >
            <Bot className="w-5 h-5 text-emerald-200" />
            <span>বটের সঙ্গে খেলুন (AI বনাম আপনি)</span>
          </button>

          {/* Mode B: Multiplayer pass and play */}
          <div className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
                <Users className="w-4 h-4 text-sky-400" />
                <span>বন্ধুদের সঙ্গে খেলুন</span>
              </div>
              <span className="text-xs text-slate-400">একই ডিভাইসে</span>
            </div>

            {/* Player Count Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">খেলোয়াড় সংখ্যা:</span>
              <div className="flex items-center gap-1.5 ml-auto">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSelectedMultiplayerCount(count)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                      selectedMultiplayerCount === count
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-900/40 scale-105'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {toBanglaNumber(count)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartMultiplayerGame(selectedMultiplayerCount)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-950/40 flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-sky-400/30"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{toBanglaNumber(selectedMultiplayerCount)} জন খেলোয়াড় শুরু করুন</span>
            </button>
          </div>
        </div>

        {/* Secondary options */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <button
            type="button"
            onClick={onOpenRules}
            className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>খেলার নিয়মাবলী</span>
          </button>

          <button
            type="button"
            onClick={onOpenAndroidExport}
            className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Android APK গাইড</span>
          </button>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <div className="mt-6 text-xs text-slate-400 text-center z-10">
        ধনী হবার মজার খেলা · বাংলা 2D বোর্ড গেম · অফলাইন সংস্করণ
      </div>
    </div>
  );
};
