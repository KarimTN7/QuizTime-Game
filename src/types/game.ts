export type Language = 'ar' | 'en';

export type NavSection =
  | 'home'
  | 'singleplayer'
  | 'multiplayer'
  | 'categories'
  | 'leaderboard'
  | 'profile'
  | 'settings';

export type CategoryGroup =
  | 'all'
  | 'games_media'
  | 'sports_music'
  | 'knowledge_tech'
  | 'culture_life';

export type QuestionModeId =
  | 'guess_the_game'
  | 'true_false'
  | 'guess_the_logo'
  | 'guess_the_sound'
  | 'who_am_i'
  | 'speed_round';

export type SingleplayerModeId =
  | 'classic'
  | 'endless'
  | 'time_attack'
  | 'practice'
  | 'daily_challenge'
  | 'category_challenge';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type MultiplayerPlaylist = 'private' | 'quick' | 'competitive' | 'casual';

export type RoomState =
  | 'WAITING'
  | 'STARTING'
  | 'IN_PROGRESS'
  | 'ROUND_RESULTS'
  | 'FINISHED';

export interface BilingualText {
  ar: string;
  en: string;
}

export interface SubcategoryCluster {
  id: string;
  title: BilingualText;
  items: BilingualText[];
}

export interface CategoryDefinition {
  id: string;
  index: number;
  group: Exclude<CategoryGroup, 'all'>;
  name: BilingualText;
  description: BilingualText;
  accentHex: string;
  iconKey: string;
  featured?: boolean;
  clusters: SubcategoryCluster[];
}

export interface QuestionModeDefinition {
  id: QuestionModeId;
  name: BilingualText;
  tagline: BilingualText;
  description: BilingualText;
  mechanics: BilingualText[];
  defaultTimeSec: number;
  basePoints: number;
  accentHex: string;
}

export interface UserSettings {
  language: Language;
  soundVolume: number;
  musicVolume: number;
  animationsEnabled: boolean;
  darkTheme: boolean;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
  profilePublic: boolean;
}

export interface MatchDraftConfig {
  mode: SingleplayerModeId;
  difficulty: DifficultyLevel;
  rounds: number;
  timeLimitSec: number;
  allCategoriesSelected: boolean;
  selectedCategoryIds: string[];
  selectedTopics: string[];
  selectedQuestionTypes: QuestionModeId[];
}

export type LogoVisualKey =
  | 'minecraft_block'
  | 'playstation_shapes'
  | 'xbox_orb'
  | 'nintendo_switch'
  | 'valorant_v'
  | 'apple_tech'
  | 'android_bot'
  | 'spotify_waves'
  | 'discord_visor'
  | 'youtube_play'
  | 'nike_swoosh'
  | 'mercedes_star'
  | 'audi_rings'
  | 'champions_star'
  | 'olympic_rings'
  | 'real_crest';

export type SoundCueKey =
  | 'coin_arcade'
  | 'level_up_fanfare'
  | 'power_down_retro'
  | 'boss_warning_alarm'
  | 'radar_ping_sonar'
  | 'victory_chord_major'
  | 'countdown_tick_urgent'
  | 'sword_clash_metallic'
  | 'ocean_wave_synth'
  | 'piano_mystery_motif';

export interface TriviaQuestion {
  id: string;
  categoryId: string;
  subcategory: BilingualText;
  topicTag: string;
  questionType: QuestionModeId;
  difficulty: DifficultyLevel;
  prompt: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  hints?: BilingualText[];
  logoKey?: LogoVisualKey;
  soundKey?: SoundCueKey;
  soundCaption?: BilingualText;
  explanation: BilingualText;
  points: number;
}

export interface ClientTriviaQuestion {
  id: string;
  categoryId: string;
  subcategory: BilingualText;
  topicTag: string;
  questionType: QuestionModeId;
  difficulty: DifficultyLevel;
  prompt: BilingualText;
  options: BilingualText[];
  hints?: BilingualText[];
  logoKey?: LogoVisualKey;
  soundKey?: SoundCueKey;
  soundCaption?: BilingualText;
  points: number;
}

export interface MatchResultSummary {
  id: string;
  mode: string;
  isMultiplayer: boolean;
  categorySummary: string;
  score: number;
  correctCount: number;
  totalCount: number;
  bestStreak: number;
  won: boolean;
  xpEarned: number;
  playedAt: string;
}

export interface PublicUserProfile {
  uid: string;
  displayName: string;
  avatarId: string;
  level: number;
  xp: number;
  totalScore: number;
  totalMatches: number;
  wins: number;
  losses: number;
  bestScore: number;
  currentStreak: number;
  lastPlayedDate?: string;
  favoriteCategory?: string;
  achievements: string[];
  unlockedAvatars: string[];
}

export interface FriendRequestRecord {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  fromAvatarId: string;
  kind: 'friend_request' | 'room_invite';
  roomCode?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface RoomPlayerState {
  playerId: string;
  uid?: string;
  name: string;
  avatarId: string;
  score: number;
  streak: number;
  ready: boolean;
  isHost: boolean;
  connected: boolean;
  hasAnsweredCurrent: boolean;
  lastPointsEarned: number;
  lastAnswerCorrect: boolean | null;
}

export interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  kind: 'chat' | 'reaction' | 'system';
  createdAt: number;
}

export interface RoomSettings {
  allCategoriesSelected: boolean;
  selectedCategoryIds: string[];
  selectedTopics: string[];
  selectedQuestionTypes: QuestionModeId[];
  difficulty: DifficultyLevel | 'mixed';
  rounds: number;
  timeLimitSec: number;
  locked: boolean;
  maxPlayers: number;
}

export interface MultiplayerRoomSnapshot {
  code: string;
  playlist: MultiplayerPlaylist;
  state: RoomState;
  hostPlayerId: string;
  settings: RoomSettings;
  players: RoomPlayerState[];
  currentRound: number;
  totalRounds: number;
  phaseEndsAt: number | null;
  serverTime: number;
  currentQuestion: ClientTriviaQuestion | null;
  roundReveal: {
    correctIndex: number;
    explanation: BilingualText;
    roundWinnerName: string | null;
  } | null;
  chat: RoomChatMessage[];
}
