import React, { useState } from 'react';
import {
  Award,
  Gamepad2,
  Grid2x2,
  Home,
  Languages,
  LogIn,
  Menu,
  Play,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavSection } from '../types/game';
import { BrandLogo } from './BrandLogo';
import { PlayerAvatar } from './PlayerAvatar';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    language,
    setLanguage,
    t,
    activeSection,
    navigateTo,
    matchDraft,
    openPlayHub,
    firebaseUser,
    userProfile,
    friendRequests,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingInvitesCount = firebaseUser
    ? friendRequests.filter((r) => r.toUid === firebaseUser.uid && r.status === 'pending').length
    : 0;

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: t.nav.home, icon: <Home className="w-4 h-4 shrink-0" /> },
    { id: 'singleplayer', label: t.nav.singleplayer, icon: <Gamepad2 className="w-4 h-4 shrink-0" /> },
    { id: 'multiplayer', label: t.nav.multiplayer, icon: <Users className="w-4 h-4 shrink-0" /> },
    { id: 'categories', label: t.nav.categories, icon: <Grid2x2 className="w-4 h-4 shrink-0" /> },
    { id: 'leaderboard', label: t.nav.leaderboard, icon: <Award className="w-4 h-4 shrink-0" /> },
    {
      id: 'profile',
      label: t.nav.profile,
      icon: <User className="w-4 h-4 shrink-0" />,
      badge: pendingInvitesCount > 0 ? pendingInvitesCount : undefined,
    },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-4 h-4 shrink-0" /> },
  ];

  const handleNavClick = (section: NavSection) => {
    navigateTo(section);
    setMobileMenuOpen(false);
  };

  const queueText = matchDraft.allCategoriesSelected
    ? t.nav.allModeActive
    : `${matchDraft.selectedCategoryIds.length} ${t.nav.categoriesSelectedCount}`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F4F6FB] text-[#111428] dark:bg-[#0B0D19] dark:text-[#F5F5FA]">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-white dark:bg-[#12162A] border-e border-slate-200 dark:border-white/8">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-200 dark:border-white/8">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8057FF] rounded-lg"
          >
            <BrandLogo size={36} />
            <div>
              <div className="text-lg font-extrabold tracking-tight leading-none text-[#111428] dark:text-[#F5F5FA]">
                {t.brandName}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#9399B2] mt-1">
                {t.brandSubtitle}
              </div>
            </div>
          </button>
        </div>

        <div className="px-3 pt-4">
          <button
            type="button"
            onClick={openPlayHub}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-sm font-extrabold transition-colors flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29C7FF]"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>{t.nav.startPlaying}</span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8057FF] ${
                  active
                    ? 'bg-[#8057FF]/15 text-[#8057FF] dark:bg-white/10 dark:text-white'
                    : 'text-slate-600 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-[#F5F5FA] hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span className="text-xs font-mono-tabular font-extrabold text-[#FFB547] shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Signed-in Player / Queue / Language Switcher */}
        <div className="p-4 border-t border-slate-200 dark:border-white/8 space-y-3">
          {userProfile ? (
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              className="w-full text-start p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8 hover:border-[#8057FF]/50 transition-colors flex items-center gap-2.5"
            >
              <PlayerAvatar avatarId={userProfile.avatarId} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#111428] dark:text-[#F5F5FA] truncate">
                  {userProfile.displayName}
                </div>
                <div className="text-[11px] text-[#29C7FF] font-mono-tabular">
                  Lv.{userProfile.level} · {userProfile.xp} XP
                </div>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              className="w-full min-h-[38px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 hover:border-[#8057FF] text-xs font-bold text-[#111428] dark:text-[#F5F5FA] flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-[#29C7FF] shrink-0" />
              <span>{t.nav.signIn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick('categories')}
            className="w-full text-start p-3 rounded-lg bg-slate-50 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8 hover:border-[#8057FF]/50 transition-colors"
          >
            <div className="text-[11px] font-medium text-slate-500 dark:text-[#9399B2]">
              {t.nav.selectedQueue}
            </div>
            <div className="text-xs font-semibold text-[#111428] dark:text-[#F5F5FA] mt-0.5 truncate tabular-nums">
              {queueText}
            </div>
          </button>

          <div
            className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/8"
            role="group"
            aria-label="Language Switcher"
          >
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                language === 'ar'
                  ? 'bg-[#8057FF] text-white'
                  : 'text-slate-600 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-white'
              }`}
            >
              {t.common.arabic}
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                language === 'en'
                  ? 'bg-[#8057FF] text-white'
                  : 'text-slate-600 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-white'
              }`}
            >
              {t.common.english}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Compact Sticky Header */}
      <header className="lg:hidden sticky top-0 z-40 h-14 px-3 sm:px-4 flex items-center justify-between gap-2 bg-white/95 dark:bg-[#12162A]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/8">
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8057FF] rounded-lg"
        >
          <BrandLogo size={28} />
          <span className="text-base font-extrabold tracking-tight text-[#111428] dark:text-[#F5F5FA]">
            {t.brandName}
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openPlayHub}
            className="h-9 px-3 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-xs font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>{t.nav.startPlaying}</span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="h-9 px-2.5 rounded-lg bg-slate-100 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 text-xs font-semibold text-[#111428] dark:text-[#F5F5FA] flex items-center gap-1 whitespace-nowrap shrink-0"
            aria-label="Switch language"
          >
            <Languages className="w-3.5 h-3.5 text-[#29C7FF]" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-[#0B0D19] border border-slate-200 dark:border-white/10 flex items-center justify-center text-[#111428] dark:text-[#F5F5FA]"
            aria-label={mobileMenuOpen ? t.nav.menuClose : t.nav.menuOpen}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-white dark:bg-[#12162A] border-e border-slate-200 dark:border-white/10 flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/8">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={30} />
                <span className="font-extrabold text-base text-[#111428] dark:text-[#F5F5FA]">
                  {t.brandName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 dark:text-[#9399B2] hover:bg-slate-100 dark:hover:bg-white/5"
                aria-label={t.nav.menuClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openPlayHub();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-sm font-extrabold flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>{t.nav.startPlaying}</span>
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#8057FF] text-white'
                        : 'text-slate-700 dark:text-[#9399B2] hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span className="text-xs font-mono-tabular font-extrabold text-[#FFB547]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-white/8 space-y-2">
              {userProfile ? (
                <button
                  type="button"
                  onClick={() => handleNavClick('profile')}
                  className="w-full flex items-center gap-2.5 text-start"
                >
                  <PlayerAvatar avatarId={userProfile.avatarId} size="sm" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#111428] dark:text-[#F5F5FA] truncate">
                      {userProfile.displayName}
                    </div>
                    <div className="text-[11px] text-[#29C7FF] font-mono-tabular">
                      Lv.{userProfile.level}
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavClick('profile')}
                  className="w-full min-h-[38px] px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#0B0D19] text-xs font-bold text-[#111428] dark:text-[#F5F5FA] flex items-center justify-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#29C7FF]" />
                  <span>{t.nav.signIn}</span>
                </button>
              )}
              <div className="text-xs text-slate-500 dark:text-[#9399B2]">
                {t.nav.selectedQueue}:{' '}
                <span className="font-semibold text-[#111428] dark:text-[#F5F5FA]">
                  {queueText}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area + Clean Footer */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
          {children}
        </main>

        <footer className="border-t border-slate-200 dark:border-white/8 bg-white/60 dark:bg-[#12162A]/60">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA]">
                {t.brandName}
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9399B2] mt-1">
                {t.footer.tagline}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600 dark:text-[#9399B2]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className="hover:text-[#8057FF] dark:hover:text-[#29C7FF] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
