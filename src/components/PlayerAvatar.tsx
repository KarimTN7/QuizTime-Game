import React from 'react';
import {
  Crown,
  Flame,
  Gamepad2,
  Ghost,
  Shield,
  Sparkles,
  Swords,
  Zap,
} from 'lucide-react';
import { BilingualText } from '../types/game';

export interface AvatarOption {
  id: string;
  label: BilingualText;
  bg: string;
  fg: string;
  unlockLevel: number;
  icon: 'prism' | 'crown' | 'flame' | 'swords' | 'zap' | 'shield' | 'ghost' | 'gamepad';
}

export const AVATAR_CATALOG: AvatarOption[] = [
  {
    id: 'prism_violet',
    label: { ar: 'منشور البنفسج', en: 'Violet Prism' },
    bg: '#8057FF',
    fg: '#FFFFFF',
    unlockLevel: 1,
    icon: 'prism',
  },
  {
    id: 'zap_cyan',
    label: { ar: 'شرارة السماوي', en: 'Cyan Spark' },
    bg: '#29C7FF',
    fg: '#0B0D19',
    unlockLevel: 1,
    icon: 'zap',
  },
  {
    id: 'gamepad_slate',
    label: { ar: 'نجم الألعاب', en: 'Arcade Core' },
    bg: '#1E2547',
    fg: '#29C7FF',
    unlockLevel: 1,
    icon: 'gamepad',
  },
  {
    id: 'shield_amber',
    label: { ar: 'درع العنبر', en: 'Amber Shield' },
    bg: '#FFB547',
    fg: '#0B0D19',
    unlockLevel: 1,
    icon: 'shield',
  },
  {
    id: 'swords_indigo',
    label: { ar: 'سيفا التحدي', en: 'Duelist Blades' },
    bg: '#4F46E5',
    fg: '#FFFFFF',
    unlockLevel: 2,
    icon: 'swords',
  },
  {
    id: 'flame_crimson',
    label: { ar: 'لهب المنافسة', en: 'Ember Crest' },
    bg: '#E11D48',
    fg: '#FFFFFF',
    unlockLevel: 3,
    icon: 'flame',
  },
  {
    id: 'ghost_teal',
    label: { ar: 'شبح التخفي', en: 'Stealth Shade' },
    bg: '#0D9488',
    fg: '#FFFFFF',
    unlockLevel: 4,
    icon: 'ghost',
  },
  {
    id: 'crown_gold',
    label: { ar: 'تاج الأسطورة', en: 'Legend Crown' },
    bg: '#D97706',
    fg: '#FFFFFF',
    unlockLevel: 5,
    icon: 'crown',
  },
];

interface PlayerAvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ avatarId, size = 'md' }) => {
  const item = AVATAR_CATALOG.find((a) => a.id === avatarId) ?? AVATAR_CATALOG[0];

  const dims =
    size === 'sm'
      ? 'w-8 h-8 rounded-lg'
      : size === 'lg'
        ? 'w-16 h-16 rounded-2xl'
        : 'w-10 h-10 rounded-xl';

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';

  const renderIcon = () => {
    switch (item.icon) {
      case 'crown':
        return <Crown className={iconSize} />;
      case 'flame':
        return <Flame className={iconSize} />;
      case 'swords':
        return <Swords className={iconSize} />;
      case 'zap':
        return <Zap className={iconSize} />;
      case 'shield':
        return <Shield className={iconSize} />;
      case 'ghost':
        return <Ghost className={iconSize} />;
      case 'gamepad':
        return <Gamepad2 className={iconSize} />;
      default:
        return <Sparkles className={iconSize} />;
    }
  };

  return (
    <div
      className={`${dims} flex items-center justify-center shrink-0`}
      style={{ backgroundColor: item.bg, color: item.fg }}
      aria-hidden="true"
    >
      {renderIcon()}
    </div>
  );
};
