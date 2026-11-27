import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { TRANSLATIONS, TranslationBundle } from '../i18n/translations';
import { auth } from '../services/firebaseClient';
import {
  ensureUserProfile,
  fetchFriendRequests,
  fetchMatchHistory,
  hasCompletedDailyToday,
  recordMatchAndUpdateProgression,
} from '../services/profileService';
import { getUtcDateKey } from '../shared/questionBank';
import { stripBasePath, withBasePath } from '../utils/basePath';
import {
  FriendRequestRecord,
  Language,
  MatchDraftConfig,
  MatchResultSummary,
  NavSection,
  PublicUserProfile,
  UserSettings,
} from '../types/game';

const SETTINGS_STORAGE_KEY = 'quiztime_user_settings_v1';
const DRAFT_STORAGE_KEY = 'quiztime_match_draft_v1';
const LOCAL_HISTORY_KEY = 'quiztime_local_match_history_v1';

const LEGACY_SETTINGS_KEY = 'sijal_user_settings_v1';
const LEGACY_DRAFT_KEY = 'sijal_match_draft_v1';
const LEGACY_HISTORY_KEY = 'sijal_local_match_history_v1';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'ar',
  soundVolume: 80,
  musicVolume: 45,
  animationsEnabled: true,
  darkTheme: true,
  reducedMotion: false,
  notificationsEnabled: true,
  profilePublic: true,
};

const DEFAULT_MATCH_DRAFT: MatchDraftConfig = {
  mode: 'classic',
  difficulty: 'medium',
  rounds: 8,
  timeLimitSec: 20,
  allCategoriesSelected: true,
  selectedCategoryIds: [],
  selectedTopics: [],
  selectedQuestionTypes: [
    'guess_the_game',
    'true_false',
    'guess_the_logo',
    'guess_the_sound',
    'who_am_i',
    'speed_round',
  ],
};

const VALID_SECTIONS: NavSection[] = [
  'home',
  'singleplayer',
  'multiplayer',
  'categories',
  'leaderboard',
  'profile',
  'settings',
];

function getInitialSectionFromLocation(): NavSection {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  if (params.get('room')) return 'multiplayer';

  const cleanPath = stripBasePath(window.location.pathname).toLowerCase();
  if (cleanPath.startsWith('join/')) return 'multiplayer';
  if (VALID_SECTIONS.includes(cleanPath as NavSection)) {
    return cleanPath as NavSection;
  }

  const hash = window.location.hash.replace('#', '') as NavSection;
  return VALID_SECTIONS.includes(hash) ? hash : 'home';
}

function getInitialRoomCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const queryCode = params.get('room');
  if (queryCode) {
    return queryCode.trim().toUpperCase().slice(0, 10);
  }
  const cleanPath = stripBasePath(window.location.pathname);
  if (cleanPath.toLowerCase().startsWith('join/')) {
    const seg = cleanPath.slice(5).trim().toUpperCase().slice(0, 10);
    return seg || null;
  }
  return null;
}

function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw =
      window.localStorage.getItem(SETTINGS_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadDraft(): MatchDraftConfig {
  if (typeof window === 'undefined') return DEFAULT_MATCH_DRAFT;
  try {
    const raw =
      window.localStorage.getItem(DRAFT_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!raw) return DEFAULT_MATCH_DRAFT;
    return { ...DEFAULT_MATCH_DRAFT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MATCH_DRAFT;
  }
}

function loadLocalHistory(): MatchResultSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw =
      window.localStorage.getItem(LOCAL_HISTORY_KEY) ||
      window.localStorage.getItem(LEGACY_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface AppContextValue {
  language: Language;
  isRtl: boolean;
  t: TranslationBundle;
  activeSection: NavSection;
  navigateTo: (section: NavSection, focusCategoryId?: string) => void;
  focusedCategoryId: string | null;
  setFocusedCategoryId: (id: string | null) => void;
  playHubOpen: boolean;
  openPlayHub: () => void;
  closePlayHub: () => void;
  autoStartSingleplayer: boolean;
  setAutoStartSingleplayer: (val: boolean) => void;
  pendingJoinRoomCode: string | null;
  setPendingJoinRoomCode: (code: string | null) => void;
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  resetSettings: () => void;
  setLanguage: (lang: Language) => void;
  matchDraft: MatchDraftConfig;
  updateMatchDraft: (patch: Partial<MatchDraftConfig>) => void;
  toggleCategorySelection: (categoryId: string) => void;
  enableAllCategoriesMode: () => void;
  clearCategorySelection: () => void;
  firebaseUser: User | null;
  userProfile: PublicUserProfile | null;
  authLoading: boolean;
  matchHistory: MatchResultSummary[];
  friendRequests: FriendRequestRecord[];
  dailyCompletedToday: boolean;
  refreshProfileAndSocial: () => Promise<void>;
  recordMatchOutcome: (
    match: Omit<MatchResultSummary, 'id' | 'playedAt'>,
    options?: { isDaily?: boolean; primaryCategoryId?: string; wasHost?: boolean }
  ) => Promise<string[]>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [matchDraft, setMatchDraft] = useState<MatchDraftConfig>(loadDraft);
  const [activeSection, setActiveSection] = useState<NavSection>(getInitialSectionFromLocation);
  const [focusedCategoryId, setFocusedCategoryId] = useState<string | null>(null);
  const [playHubOpen, setPlayHubOpen] = useState(false);
  const [autoStartSingleplayer, setAutoStartSingleplayer] = useState(false);
  const [pendingJoinRoomCode, setPendingJoinRoomCode] = useState<string | null>(
    getInitialRoomCodeFromUrl
  );

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState<MatchResultSummary[]>(loadLocalHistory);
  const [friendRequests, setFriendRequests] = useState<FriendRequestRecord[]>([]);
  const [dailyCompletedToday, setDailyCompletedToday] = useState(false);

  const language = settings.language;
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  const loadUserCloudData = useCallback(async (user: User) => {
    try {
      const profile = await ensureUserProfile(user);
      setUserProfile(profile);
      const [history, requests, doneToday] = await Promise.all([
        fetchMatchHistory(user.uid),
        fetchFriendRequests(user.uid),
        hasCompletedDailyToday(user.uid, getUtcDateKey()),
      ]);
      setMatchHistory(history);
      setFriendRequests(requests);
      setDailyCompletedToday(doneToday);
    } catch (err) {
      console.error('Failed loading user cloud state:', err);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        void loadUserCloudData(user).finally(() => setAuthLoading(false));
      } else {
        setUserProfile(null);
        setFriendRequests([]);
        setMatchHistory(loadLocalHistory());
        setDailyCompletedToday(false);
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, [loadUserCloudData]);

  const refreshProfileAndSocial = useCallback(async () => {
    if (firebaseUser) {
      await loadUserCloudData(firebaseUser);
    }
  }, [firebaseUser, loadUserCloudData]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = isRtl ? 'rtl' : 'ltr';
    if (settings.darkTheme) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (settings.reducedMotion || !settings.animationsEnabled) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [language, isRtl, settings]);

  useEffect(() => {
    const sectionTitles: Record<NavSection, string> = {
      home: `${t.brandName} — ${t.brandSubtitle}`,
      singleplayer: `${t.nav.singleplayer} | ${t.brandName}`,
      multiplayer: `${t.nav.multiplayer} | ${t.brandName}`,
      categories: `${t.nav.categories} | ${t.brandName}`,
      leaderboard: `${t.nav.leaderboard} | ${t.brandName}`,
      profile: `${t.nav.profile} | ${t.brandName}`,
      settings: `${t.nav.settings} | ${t.brandName}`,
    };
    document.title = sectionTitles[activeSection] || `${t.brandName} — ${t.brandSubtitle}`;
  }, [activeSection, t]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(matchDraft));
    } catch {
      // Ignore storage errors
    }
  }, [matchDraft]);

  useEffect(() => {
    const syncFromLocation = () => {
      setActiveSection(getInitialSectionFromLocation());
      const code = getInitialRoomCodeFromUrl();
      if (code) {
        setPendingJoinRoomCode(code);
      }
    };
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, []);

  const navigateTo = useCallback(
    (section: NavSection, categoryId?: string) => {
      setActiveSection(section);
      if (categoryId) {
        setFocusedCategoryId(categoryId);
      }
      const targetPath = withBasePath(section === 'home' ? '/' : `/${section}`);
      if (window.location.pathname !== targetPath || window.location.hash) {
        window.history.pushState({ section }, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' });
    },
    [settings.reducedMotion]
  );

  const openPlayHub = useCallback(() => setPlayHubOpen(true), []);
  const closePlayHub = useCallback(() => setPlayHubOpen(false), []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const setLanguage = useCallback(
    (lang: Language) => {
      updateSettings({ language: lang });
    },
    [updateSettings]
  );

  const updateMatchDraft = useCallback((patch: Partial<MatchDraftConfig>) => {
    setMatchDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleCategorySelection = useCallback((categoryId: string) => {
    setMatchDraft((prev) => {
      const exists = prev.selectedCategoryIds.includes(categoryId);
      const nextIds = exists
        ? prev.selectedCategoryIds.filter((id) => id !== categoryId)
        : [...prev.selectedCategoryIds, categoryId];
      return {
        ...prev,
        allCategoriesSelected: nextIds.length === 0,
        selectedCategoryIds: nextIds,
        selectedTopics: [],
      };
    });
  }, []);

  const enableAllCategoriesMode = useCallback(() => {
    setMatchDraft((prev) => ({
      ...prev,
      allCategoriesSelected: true,
      selectedCategoryIds: [],
      selectedTopics: [],
    }));
  }, []);

  const clearCategorySelection = useCallback(() => {
    setMatchDraft((prev) => ({
      ...prev,
      allCategoriesSelected: false,
      selectedCategoryIds: [],
      selectedTopics: [],
    }));
  }, []);

  const recordMatchOutcome = useCallback(
    async (
      match: Omit<MatchResultSummary, 'id' | 'playedAt'>,
      options?: { isDaily?: boolean; primaryCategoryId?: string; wasHost?: boolean }
    ): Promise<string[]> => {
      const localEntry: MatchResultSummary = {
        ...match,
        id: `local_${Date.now()}`,
        playedAt: new Date().toISOString(),
      };

      if (firebaseUser && userProfile) {
        const { updatedProfile, newlyUnlocked } = await recordMatchAndUpdateProgression(
          userProfile,
          match,
          {
            isDaily: options?.isDaily,
            dailyDateKey: options?.isDaily ? getUtcDateKey() : undefined,
            primaryCategoryId: options?.primaryCategoryId,
            wasHost: options?.wasHost,
          }
        );
        setUserProfile(updatedProfile);
        setMatchHistory((prev) => [localEntry, ...prev].slice(0, 20));
        if (options?.isDaily) setDailyCompletedToday(true);
        return newlyUnlocked;
      } else {
        setMatchHistory((prev) => {
          const next = [localEntry, ...prev].slice(0, 20);
          try {
            window.localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(next));
          } catch {
            // Ignore
          }
          return next;
        });
        return [];
      }
    },
    [firebaseUser, userProfile]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      language,
      isRtl,
      t,
      activeSection,
      navigateTo,
      focusedCategoryId,
      setFocusedCategoryId,
      playHubOpen,
      openPlayHub,
      closePlayHub,
      autoStartSingleplayer,
      setAutoStartSingleplayer,
      pendingJoinRoomCode,
      setPendingJoinRoomCode,
      settings,
      updateSettings,
      resetSettings,
      setLanguage,
      matchDraft,
      updateMatchDraft,
      toggleCategorySelection,
      enableAllCategoriesMode,
      clearCategorySelection,
      firebaseUser,
      userProfile,
      authLoading,
      matchHistory,
      friendRequests,
      dailyCompletedToday,
      refreshProfileAndSocial,
      recordMatchOutcome,
    }),
    [
      language,
      isRtl,
      t,
      activeSection,
      navigateTo,
      focusedCategoryId,
      playHubOpen,
      openPlayHub,
      closePlayHub,
      autoStartSingleplayer,
      pendingJoinRoomCode,
      settings,
      updateSettings,
      resetSettings,
      setLanguage,
      matchDraft,
      updateMatchDraft,
      toggleCategorySelection,
      enableAllCategoriesMode,
      clearCategorySelection,
      firebaseUser,
      userProfile,
      authLoading,
      matchHistory,
      friendRequests,
      dailyCompletedToday,
      refreshProfileAndSocial,
      recordMatchOutcome,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
