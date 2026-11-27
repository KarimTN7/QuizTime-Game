import React from 'react';
import { LogoVisualKey } from '../types/game';

interface LogoPuzzleVisualProps {
  logoKey: LogoVisualKey;
}

export const LogoPuzzleVisual: React.FC<LogoPuzzleVisualProps> = ({ logoKey }) => {
  const renderMark = () => {
    switch (logoKey) {
      case 'minecraft_block':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <polygon points="60,16 102,38 60,60 18,38" fill="#4ADE80" />
            <polygon points="18,38 60,60 60,104 18,82" fill="#785134" />
            <polygon points="102,38 60,60 60,104 102,82" fill="#5C3D28" />
            <polygon points="18,38 60,60 60,70 18,48" fill="#22C55E" />
            <polygon points="102,38 60,60 60,70 102,48" fill="#16A34A" />
          </svg>
        );
      case 'playstation_shapes':
        return (
          <svg viewBox="0 0 160 60" className="w-40 h-16">
            <polygon points="24,14 38,42 10,42" fill="none" stroke="#34D399" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="62" cy="28" r="14" fill="none" stroke="#F87171" strokeWidth="4" />
            <path d="M88,16 L112,40 M112,16 L88,40" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
            <rect x="126" y="15" width="24" height="24" rx="2" fill="none" stroke="#F472B6" strokeWidth="4" />
          </svg>
        );
      case 'xbox_orb':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <circle cx="60" cy="60" r="42" fill="#16A34A" />
            <path d="M31 32 C46 42, 74 78, 89 88" stroke="#0B0D19" strokeWidth="10" strokeLinecap="round" />
            <path d="M89 32 C74 42, 46 78, 31 88" stroke="#0B0D19" strokeWidth="10" strokeLinecap="round" />
          </svg>
        );
      case 'nintendo_switch':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <path d="M36 22 H54 V98 H36 A16 16 0 0 1 20 82 V38 A16 16 0 0 1 36 22 Z" fill="none" stroke="#F5F5FA" strokeWidth="6" />
            <circle cx="38" cy="44" r="6" fill="#F5F5FA" />
            <path d="M66 22 H84 A16 16 0 0 1 100 38 V82 A16 16 0 0 1 84 98 H66 V22 Z" fill="#EF4444" />
            <circle cx="82" cy="70" r="6" fill="#0B0D19" />
          </svg>
        );
      case 'valorant_v':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <polygon points="22,28 54,68 42,84 22,58" fill="#FB7185" />
            <polygon points="98,28 66,68 78,84 98,58" fill="#FB7185" />
            <polygon points="44,86 60,104 76,86 60,68" fill="#FB7185" />
          </svg>
        );
      case 'discord_visor':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <path d="M26 42 C36 32, 84 32, 94 42 L100 80 C88 88, 76 86, 72 80 L68 76 H52 L48 80 C44 86, 32 88, 20 80 Z" fill="#8057FF" />
            <circle cx="46" cy="59" r="7" fill="#F5F5FA" />
            <circle cx="74" cy="59" r="7" fill="#F5F5FA" />
          </svg>
        );
      case 'youtube_play':
        return (
          <svg viewBox="0 0 140 100" className="w-32 h-24">
            <rect x="14" y="18" width="112" height="64" rx="18" fill="#EF4444" />
            <polygon points="60,36 90,50 60,64" fill="#FFFFFF" />
          </svg>
        );
      case 'champions_star':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <circle cx="60" cy="60" r="42" fill="none" stroke="#F5F5FA" strokeWidth="3.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cx = 60 + Math.cos(rad) * 26;
              const cy = 60 + Math.sin(rad) * 26;
              return <circle key={deg} cx={cx} cy={cy} r="5" fill="#29C7FF" />;
            })}
            <circle cx="60" cy="60" r="9" fill="#F5F5FA" />
          </svg>
        );
      case 'olympic_rings':
        return (
          <svg viewBox="0 0 180 90" className="w-40 h-20">
            <circle cx="42" cy="36" r="18" fill="none" stroke="#38BDF8" strokeWidth="4.5" />
            <circle cx="90" cy="36" r="18" fill="none" stroke="#F5F5FA" strokeWidth="4.5" />
            <circle cx="138" cy="36" r="18" fill="none" stroke="#EF4444" strokeWidth="4.5" />
            <circle cx="66" cy="54" r="18" fill="none" stroke="#FACC15" strokeWidth="4.5" />
            <circle cx="114" cy="54" r="18" fill="none" stroke="#22C55E" strokeWidth="4.5" />
          </svg>
        );
      case 'android_bot':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <line x1="40" y1="30" x2="48" y2="46" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" />
            <line x1="80" y1="30" x2="72" y2="46" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" />
            <path d="M26 76 A34 34 0 0 1 94 76 Z" fill="#4ADE80" />
            <circle cx="46" cy="62" r="4.5" fill="#0B0D19" />
            <circle cx="74" cy="62" r="4.5" fill="#0B0D19" />
          </svg>
        );
      case 'mercedes_star':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <circle cx="60" cy="60" r="42" fill="none" stroke="#E2E8F0" strokeWidth="5" />
            <line x1="60" y1="60" x2="60" y2="18" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
            <line x1="60" y1="60" x2="24" y2="81" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
            <line x1="60" y1="60" x2="96" y2="81" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
          </svg>
        );
      case 'spotify_waves':
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <circle cx="60" cy="60" r="42" fill="#22C55E" />
            <path d="M36 47 C52 42, 72 44, 86 52" fill="none" stroke="#0B0D19" strokeWidth="6" strokeLinecap="round" />
            <path d="M40 61 C54 57, 70 59, 82 66" fill="none" stroke="#0B0D19" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M44 74 C55 71, 67 73, 77 79" fill="none" stroke="#0B0D19" strokeWidth="5" strokeLinecap="round" />
          </svg>
        );
      case 'audi_rings':
        return (
          <svg viewBox="0 0 200 80" className="w-44 h-18">
            <circle cx="44" cy="40" r="20" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
            <circle cx="80" cy="40" r="20" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
            <circle cx="116" cy="40" r="20" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
            <circle cx="152" cy="40" r="20" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 120 120" className="w-28 h-28">
            <polygon points="60,18 98,60 60,102 22,60" fill="none" stroke="#8057FF" strokeWidth="6" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full py-6 px-4 rounded-xl bg-[#0B0D19] border border-white/10 flex items-center justify-center">
      {renderMark()}
    </div>
  );
};
