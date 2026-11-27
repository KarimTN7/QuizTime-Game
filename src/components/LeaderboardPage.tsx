import React, { useEffect, useState } from 'react';
import { Award, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchDailyLeaderboard, fetchGlobalLeaderboard } from '../services/profileService';
import { getUtcDateKey } from '../shared/questionBank';
import { PublicUserProfile } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';

type LeaderboardTab = 'global' | 'daily';

export const LeaderboardPage: React.FC = () => {
  const { t, firebaseUser, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [globalRows, setGlobalRows] = useState<PublicUserProfile[]>([]);
  const [dailyRows, setDailyRows] = useState<
    Array<{
      userId: string;
      displayName: string;
      avatarId: string;
      score: number;
      correctCount: number;
      totalCount: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    setLoading(true);
    if (activeTab === 'global') {
      void fetchGlobalLeaderboard()
        .then(setGlobalRows)
        .finally(() => setLoading(false));
    } else {
      void fetchDailyLeaderboard(getUtcDateKey())
        .then(setDailyRows)
        .finally(() => setLoading(false));
    }
  }, [firebaseUser, activeTab]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA]">
          {t.leaderboardPage.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-[#9399B2] max-w-2xl">
          {t.leaderboardPage.subtitle}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-[#12162A] border border-slate-200 dark:border-white/8 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'global'
              ? 'bg-[#8057FF] text-white'
              : 'text-slate-600 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-[#F5F5FA]'
          }`}
        >
          {t.leaderboardPage.globalTab}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'daily'
              ? 'bg-[#8057FF] text-white'
              : 'text-slate-600 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-[#F5F5FA]'
          }`}
        >
          {t.leaderboardPage.dailyTab}
        </button>
      </div>

      {!firebaseUser ? (
        <section className="p-10 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 text-center space-y-4">
          <Award className="w-9 h-9 text-[#FFB547] mx-auto" />
          <p className="text-sm text-slate-600 dark:text-[#9399B2] max-w-md mx-auto">
            {t.leaderboardPage.signInToView}
          </p>
          <button
            type="button"
            onClick={() => navigateTo('profile')}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#8057FF] text-white text-xs font-bold inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.nav.signIn}</span>
          </button>
        </section>
      ) : (
        <section className="rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/8 text-xs font-semibold text-slate-500 dark:text-[#9399B2]">
                  <th className="py-3.5 px-5 text-start">{t.leaderboardPage.columns.rank}</th>
                  <th className="py-3.5 px-5 text-start">{t.leaderboardPage.columns.player}</th>
                  <th className="py-3.5 px-5 text-start">
                    {activeTab === 'global'
                      ? t.leaderboardPage.columns.level
                      : t.gameplay.accuracyLabel}
                  </th>
                  <th className="py-3.5 px-5 text-start">
                    {activeTab === 'global' ? t.leaderboardPage.columns.wins : ''}
                  </th>
                  <th className="py-3.5 px-5 text-end">{t.leaderboardPage.columns.score}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500 dark:text-[#9399B2]">
                      {t.common.loading}
                    </td>
                  </tr>
                ) : activeTab === 'global' ? (
                  globalRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-14 px-6 text-center">
                        <Award className="w-8 h-8 text-[#FFB547] mx-auto mb-3" />
                        <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
                          {t.leaderboardPage.emptyTitle}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-1.5">
                          {t.leaderboardPage.emptyBody}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    globalRows.map((row, idx) => (
                      <tr
                        key={row.uid}
                        className="border-b border-slate-100 dark:border-white/6 last:border-b-0 text-sm"
                      >
                        <td className="py-3.5 px-5 font-mono-tabular font-extrabold text-[#FFB547]">
                          #{idx + 1}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <PlayerAvatar avatarId={row.avatarId} size="sm" />
                            <span className="font-bold text-[#111428] dark:text-[#F5F5FA]">
                              {row.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono-tabular text-slate-600 dark:text-[#9399B2]">
                          {row.level}
                        </td>
                        <td className="py-3.5 px-5 font-mono-tabular text-emerald-500 font-bold">
                          {row.wins}
                        </td>
                        <td className="py-3.5 px-5 text-end font-mono-tabular font-extrabold text-[#29C7FF]">
                          {row.totalScore}
                        </td>
                      </tr>
                    ))
                  )
                ) : dailyRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 px-6 text-center">
                      <Award className="w-8 h-8 text-[#FFB547] mx-auto mb-3" />
                      <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
                        {t.leaderboardPage.emptyTitle}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-1.5">
                        {t.leaderboardPage.emptyBody}
                      </p>
                    </td>
                  </tr>
                ) : (
                  dailyRows.map((row, idx) => (
                    <tr
                      key={row.userId}
                      className="border-b border-slate-100 dark:border-white/6 last:border-b-0 text-sm"
                    >
                      <td className="py-3.5 px-5 font-mono-tabular font-extrabold text-[#FFB547]">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar avatarId={row.avatarId} size="sm" />
                          <span className="font-bold text-[#111428] dark:text-[#F5F5FA]">
                            {row.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono-tabular text-slate-600 dark:text-[#9399B2]">
                        {row.correctCount}/{row.totalCount}
                      </td>
                      <td className="py-3.5 px-5" />
                      <td className="py-3.5 px-5 text-end font-mono-tabular font-extrabold text-[#29C7FF]">
                        {row.score}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
