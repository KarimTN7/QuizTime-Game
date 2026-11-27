import React, { useState } from 'react';
import { Gamepad2, Globe2, KeyRound, Users, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PlayHubModal: React.FC = () => {
  const {
    playHubOpen,
    closePlayHub,
    t,
    navigateTo,
    setPendingJoinRoomCode,
  } = useApp();
  const [roomCodeInput, setRoomCodeInput] = useState('');

  if (!playHubOpen) return null;

  const handleSingleplayer = () => {
    closePlayHub();
    navigateTo('singleplayer');
  };

  const handlePublicMultiplayer = () => {
    closePlayHub();
    navigateTo('multiplayer');
  };

  const handlePlayWithFriends = () => {
    closePlayHub();
    setPendingJoinRoomCode('__CREATE_PRIVATE__');
    navigateTo('multiplayer');
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = roomCodeInput.trim().toUpperCase();
    if (!cleaned) return;
    closePlayHub();
    setPendingJoinRoomCode(cleaned);
    navigateTo('multiplayer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="play-hub-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/12 p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="play-hub-title"
              className="text-xl sm:text-2xl font-extrabold text-[#111428] dark:text-[#F5F5FA]"
            >
              {t.playHub.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-1">
              {t.playHub.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={closePlayHub}
            className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#0B0D19] flex items-center justify-center text-slate-500 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-white shrink-0"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleSingleplayer}
            className="text-start p-5 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 hover:border-[#8057FF] transition-colors space-y-2.5"
          >
            <div className="w-10 h-10 rounded-lg bg-[#8057FF]/15 text-[#8057FF] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.playHub.singleplayerTitle}
            </div>
            <p className="text-xs text-slate-600 dark:text-[#9399B2] leading-relaxed">
              {t.playHub.singleplayerDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={handlePublicMultiplayer}
            className="text-start p-5 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 hover:border-[#29C7FF] transition-colors space-y-2.5"
          >
            <div className="w-10 h-10 rounded-lg bg-[#29C7FF]/15 text-[#29C7FF] flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.playHub.multiplayerTitle}
            </div>
            <p className="text-xs text-slate-600 dark:text-[#9399B2] leading-relaxed">
              {t.playHub.multiplayerDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={handlePlayWithFriends}
            className="text-start p-5 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 hover:border-[#FFB547] transition-colors space-y-2.5"
          >
            <div className="w-10 h-10 rounded-lg bg-[#FFB547]/15 text-[#FFB547] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
              {t.playHub.friendsTitle}
            </div>
            <p className="text-xs text-slate-600 dark:text-[#9399B2] leading-relaxed">
              {t.playHub.friendsDesc}
            </p>
          </button>

          <form
            onSubmit={handleJoinRoom}
            className="p-5 rounded-xl bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
                {t.playHub.joinRoomTitle}
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#9399B2]">{t.playHub.joinRoomDesc}</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={10}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder={t.playHub.joinCodePlaceholder}
                className="flex-1 min-w-0 min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/12 text-xs font-mono-tabular uppercase text-[#111428] dark:text-[#F5F5FA] focus:outline-none focus:ring-2 focus:ring-[#8057FF]"
              />
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-xs font-bold whitespace-nowrap shrink-0"
              >
                {t.playHub.joinBtn}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
