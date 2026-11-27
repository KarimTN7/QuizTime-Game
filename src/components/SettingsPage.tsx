import React from 'react';
import { Bell, Eye, Languages, Moon, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  icon: React.ReactNode;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  checked,
  onChange,
  icon,
}) => (
  <div className="py-4 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-white/8 last:border-b-0">
    <div className="flex items-start gap-3 min-w-0">
      <div className="text-slate-500 dark:text-[#9399B2] mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-[#111428] dark:text-[#F5F5FA]">{label}</div>
        <div className="text-xs text-slate-500 dark:text-[#9399B2] mt-0.5">{description}</div>
      </div>
    </div>

    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8057FF] ${
        checked ? 'bg-[#8057FF]' : 'bg-slate-300 dark:bg-white/15'
      }`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white transition-transform duration-150 ${
          checked ? 'ltr:translate-x-6 rtl:-translate-x-6' : 'ltr:translate-x-1 rtl:-translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, settings, updateSettings, resetSettings, t } = useApp();

  return (
    <div className="space-y-8 max-w-3xl">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA]">
            {t.settingsPage.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#9399B2]">{t.settingsPage.subtitle}</p>
        </div>
        <span className="text-xs font-semibold text-[#29C7FF] whitespace-nowrap">
          {t.settingsPage.savedFeedback}
        </span>
      </header>

      {/* Language & Direction */}
      <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex items-center gap-2.5">
          <Languages className="w-5 h-5 text-[#29C7FF]" />
          <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
            {t.settingsPage.languageSection}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9399B2]">
          {t.settingsPage.languageDesc}
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm pt-1">
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              language === 'ar'
                ? 'bg-[#8057FF] text-white'
                : 'bg-slate-100 dark:bg-[#0B0D19] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/10'
            }`}
          >
            {t.common.arabic} (RTL)
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              language === 'en'
                ? 'bg-[#8057FF] text-white'
                : 'bg-slate-100 dark:bg-[#0B0D19] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/10'
            }`}
          >
            {t.common.english} (LTR)
          </button>
        </div>
      </section>

      {/* Audio */}
      <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-5">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-5 h-5 text-[#8057FF]" />
          <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
            {t.settingsPage.audioSection}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label htmlFor="sound-vol" className="font-semibold text-[#111428] dark:text-[#F5F5FA]">
                {t.settingsPage.soundVolume}
              </label>
              <span className="font-mono-tabular text-xs font-bold text-[#29C7FF]">
                {settings.soundVolume}%
              </span>
            </div>
            <input
              id="sound-vol"
              type="range"
              min={0}
              max={100}
              value={settings.soundVolume}
              onChange={(e) => updateSettings({ soundVolume: Number(e.target.value) })}
              className="w-full accent-[#8057FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label htmlFor="music-vol" className="font-semibold text-[#111428] dark:text-[#F5F5FA]">
                {t.settingsPage.musicVolume}
              </label>
              <span className="font-mono-tabular text-xs font-bold text-[#29C7FF]">
                {settings.musicVolume}%
              </span>
            </div>
            <input
              id="music-vol"
              type="range"
              min={0}
              max={100}
              value={settings.musicVolume}
              onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
              className="w-full accent-[#8057FF] cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Appearance & Motion */}
      <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10">
        <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA] mb-2">
          {t.settingsPage.appearanceSection}
        </h2>

        <ToggleRow
          icon={<Moon className="w-4 h-4" />}
          label={t.settingsPage.darkTheme}
          description={t.settingsPage.darkThemeDesc}
          checked={settings.darkTheme}
          onChange={(val) => updateSettings({ darkTheme: val })}
        />

        <ToggleRow
          icon={<Sparkles className="w-4 h-4" />}
          label={t.settingsPage.animations}
          description={t.settingsPage.animationsDesc}
          checked={settings.animationsEnabled}
          onChange={(val) => updateSettings({ animationsEnabled: val })}
        />

        <ToggleRow
          icon={<Sparkles className="w-4 h-4" />}
          label={t.settingsPage.reducedMotion}
          description={t.settingsPage.reducedMotionDesc}
          checked={settings.reducedMotion}
          onChange={(val) => updateSettings({ reducedMotion: val })}
        />
      </section>

      {/* Notifications, Privacy & Account */}
      <section className="p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 space-y-4">
        <h2 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
          {t.settingsPage.accountSection}
        </h2>

        <div>
          <ToggleRow
            icon={<Bell className="w-4 h-4" />}
            label={t.settingsPage.notifications}
            description={t.settingsPage.notificationsDesc}
            checked={settings.notificationsEnabled}
            onChange={(val) => updateSettings({ notificationsEnabled: val })}
          />

          <ToggleRow
            icon={<Eye className="w-4 h-4" />}
            label={t.settingsPage.publicProfile}
            description={t.settingsPage.publicProfileDesc}
            checked={settings.profilePublic}
            onChange={(val) => updateSettings({ profilePublic: val })}
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={resetSettings}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#0B0D19] hover:bg-slate-200 dark:hover:bg-[#171C36] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/10 text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.settingsPage.resetDefaults}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
