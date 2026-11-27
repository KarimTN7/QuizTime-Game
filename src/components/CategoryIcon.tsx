import React from 'react';
import {
  Atom,
  BookOpen,
  Building2,
  Car,
  Compass,
  Cpu,
  Film,
  Flame,
  Gamepad2,
  Globe2,
  Hash,
  Landmark,
  Leaf,
  Medal,
  Music2,
  Palette,
  ScrollText,
  Sparkles,
  Trophy,
  Tv,
  Type,
  Utensils,
} from 'lucide-react';

interface CategoryIconProps {
  iconKey: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconKey, className = 'w-5 h-5' }) => {
  switch (iconKey) {
    case 'gamepad':
      return <Gamepad2 className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'film':
      return <Film className={className} />;
    case 'tv':
      return <Tv className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'medal':
      return <Medal className={className} />;
    case 'music':
      return <Music2 className={className} />;
    case 'atom':
      return <Atom className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    case 'globe':
      return <Globe2 className={className} />;
    case 'scroll':
      return <ScrollText className={className} />;
    case 'utensils':
      return <Utensils className={className} />;
    case 'leaf':
      return <Leaf className={className} />;
    case 'book':
      return <BookOpen className={className} />;
    case 'hash':
      return <Hash className={className} />;
    case 'building':
      return <Building2 className={className} />;
    case 'car':
      return <Car className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'type':
      return <Type className={className} />;
    case 'landmark':
      return <Landmark className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'palette':
      return <Palette className={className} />;
    default:
      return <Compass className={className} />;
  }
};
