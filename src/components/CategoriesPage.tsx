import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Search,
  Shuffle,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, TOTAL_SUBCATEGORIES_COUNT } from '../data/categories';
import { CategoryGroup } from '../types/game';
import { CategoryIcon } from './CategoryIcon';

export const CategoriesPage: React.FC = () => {
  const {
    language,
    t,
    matchDraft,
    toggleCategorySelection,
    enableAllCategoriesMode,
    clearCategorySelection,
    navigateTo,
    setPendingJoinRoomCode,
    focusedCategoryId,
    setFocusedCategoryId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<CategoryGroup>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    gaming: true,
  });

  // Expand focused category when navigated from Home
  useEffect(() => {
    if (focusedCategoryId) {
      setExpandedIds((prev) => ({ ...prev, [focusedCategoryId]: true }));
      const el = document.getElementById(`cat-${focusedCategoryId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setFocusedCategoryId(null);
    }
  }, [focusedCategoryId, setFocusedCategoryId]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CATEGORIES.filter((cat) => {
      if (groupFilter !== 'all' && cat.group !== groupFilter) {
        return false;
      }
      if (!q) return true;
      if (
        cat.name.ar.toLowerCase().includes(q) ||
        cat.name.en.toLowerCase().includes(q) ||
        cat.description.ar.toLowerCase().includes(q) ||
        cat.description.en.toLowerCase().includes(q)
      ) {
        return true;
      }
      return cat.clusters.some(
        (cluster) =>
          cluster.title.ar.toLowerCase().includes(q) ||
          cluster.title.en.toLowerCase().includes(q) ||
          cluster.items.some(
            (item) =>
              item.ar.toLowerCase().includes(q) || item.en.toLowerCase().includes(q)
          )
      );
    });
  }, [searchQuery, groupFilter]);

  const filterTabs: { id: CategoryGroup; label: string }[] = [
    { id: 'all', label: t.categoriesPage.filterAll },
    { id: 'games_media', label: t.categoriesPage.filterGamesMedia },
    { id: 'sports_music', label: t.categoriesPage.filterSportsMusic },
    { id: 'knowledge_tech', label: t.categoriesPage.filterKnowledgeTech },
    { id: 'culture_life', label: t.categoriesPage.filterCultureLife },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111428] dark:text-[#F5F5FA]">
          {t.categoriesPage.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-[#9399B2] max-w-2xl">
          {t.categoriesPage.subtitle}
        </p>
        <div className="text-xs font-mono-tabular text-slate-500 dark:text-[#9399B2]">
          22 {t.home.statsStrip.categoriesTitle} · {TOTAL_SUBCATEGORIES_COUNT} {t.categoriesPage.topicsCount}
        </div>
      </header>

      {/* Special ALL Categories Mode Card */}
      <section className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8057FF]/15 text-[#8057FF] flex items-center justify-center shrink-0">
            <Shuffle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA]">
                {t.categoriesPage.allModeTitle}
              </h2>
              <span className="text-xs font-mono-tabular text-[#29C7FF]">
                {matchDraft.allCategoriesSelected ? `· ${t.common.selected}` : ''}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-1 max-w-2xl">
              {t.categoriesPage.allModeDescription}
            </p>
            <div className="text-xs text-slate-500 dark:text-[#9399B2] mt-2">
              {t.categoriesPage.allModeMeta}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={enableAllCategoriesMode}
            className={`min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              matchDraft.allCategoriesSelected
                ? 'bg-[#8057FF] text-white'
                : 'bg-slate-100 dark:bg-[#0B0D19] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/12 hover:border-[#8057FF]'
            }`}
          >
            {matchDraft.allCategoriesSelected ? t.common.selected : t.common.selectAllMode}
          </button>
        </div>
      </section>

      {/* Search & Group Filter Toolbar */}
      <section className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#9399B2] absolute top-1/2 -translate-y-1/2 start-4 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.categoriesPage.searchPlaceholder}
            className="w-full min-h-[46px] ps-11 pe-10 py-2.5 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 text-sm text-[#111428] dark:text-[#F5F5FA] placeholder:text-slate-400 dark:placeholder:text-[#9399B2]/70 focus:outline-none focus:ring-2 focus:ring-[#8057FF]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 -translate-y-1/2 end-3 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-[#111428] dark:hover:text-white"
              aria-label={t.categoriesPage.resetSearch}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-[#12162A] border border-slate-200 dark:border-white/8 w-full sm:w-fit">
          {filterTabs.map((tab) => {
            const active = groupFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGroupFilter(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#8057FF] text-white'
                    : 'text-slate-600 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-[#F5F5FA]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Selection Action Bar */}
      <section className="p-4 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm">
          <span className="text-slate-500 dark:text-[#9399B2]">
            {t.categoriesPage.selectedSummary}:{' '}
          </span>
          <span className="font-bold text-[#111428] dark:text-[#F5F5FA] tabular-nums">
            {matchDraft.allCategoriesSelected
              ? t.nav.allModeActive
              : `${matchDraft.selectedCategoryIds.length} ${t.nav.categoriesSelectedCount}`}
          </span>
          {!matchDraft.allCategoriesSelected && matchDraft.selectedCategoryIds.length > 0 && (
            <button
              type="button"
              onClick={clearCategorySelection}
              className="ms-3 text-xs font-semibold text-slate-500 dark:text-[#9399B2] hover:text-[#FFB547] underline"
            >
              {t.common.clearSelection}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo('singleplayer')}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-[#8057FF] hover:bg-[#6D42F5] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
            <span>{t.categoriesPage.useInSingleplayer}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPendingJoinRoomCode('__CREATE_PRIVATE__');
              navigateTo('multiplayer');
            }}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#0B0D19] hover:bg-slate-200 dark:hover:bg-[#171C36] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/10 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 text-[#29C7FF] shrink-0" />
            <span>{t.categoriesPage.useInMultiplayer}</span>
          </button>
        </div>
      </section>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="p-10 rounded-xl bg-white dark:bg-[#12162A] border border-slate-200 dark:border-white/8 text-center">
          <h3 className="text-base font-bold text-[#111428] dark:text-[#F5F5FA]">
            {t.categoriesPage.noResultsTitle}
          </h3>
          <p className="text-sm text-slate-500 dark:text-[#9399B2] mt-1">
            {t.categoriesPage.noResultsBody}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setGroupFilter('all');
            }}
            className="mt-4 min-h-[40px] px-4 py-2 rounded-lg bg-[#8057FF] text-white text-xs font-bold"
          >
            {t.categoriesPage.resetSearch}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((cat) => {
            const isSelected = matchDraft.selectedCategoryIds.includes(cat.id);
            const isExpanded = Boolean(expandedIds[cat.id]) || searchQuery.trim().length > 0;
            const totalItems = cat.clusters.reduce((sum, cl) => sum + cl.items.length, 0);

            return (
              <article
                id={`cat-${cat.id}`}
                key={cat.id}
                className={`rounded-xl bg-white dark:bg-[#12162A] border transition-colors ${
                  isSelected
                    ? 'border-[#8057FF]'
                    : 'border-slate-200 dark:border-white/8'
                }`}
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.accentHex}1A`,
                        color: cat.accentHex,
                      }}
                    >
                      <CategoryIcon iconKey={cat.iconKey} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#9399B2]">
                        <span className="font-mono-tabular">
                          #{String(cat.index).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {totalItems} {t.categoriesPage.topicsCount}
                        </span>
                        {cat.featured && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#FFB547] font-semibold">
                              {t.categoriesPage.featuredMarker}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-[#111428] dark:text-[#F5F5FA] mt-0.5">
                        {cat.name[language]}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-[#9399B2] mt-1 leading-relaxed">
                        {cat.description[language]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleCategorySelection(cat.id)}
                      className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#8057FF] text-white'
                          : 'bg-slate-100 dark:bg-[#0B0D19] text-[#111428] dark:text-[#F5F5FA] border border-slate-200 dark:border-white/10 hover:border-[#8057FF]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      <span>{isSelected ? t.common.selected : t.common.select}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(cat.id)}
                      className="min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-[#9399B2] hover:text-[#111428] dark:hover:text-[#F5F5FA] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                      aria-expanded={isExpanded}
                    >
                      <span>
                        {isExpanded
                          ? t.categoriesPage.collapseTopics
                          : t.categoriesPage.expandTopics}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Subcategory Clusters (whitespace + hairline divider, zero nested cards) */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-4 border-t border-slate-100 dark:border-white/8 space-y-5">
                    {cat.clusters.map((cluster) => (
                      <div key={cluster.id}>
                        <h4 className="text-xs font-bold text-[#29C7FF] mb-2.5">
                          {cluster.title[language]}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-700 dark:text-[#F5F5FA]/85">
                          {cluster.items.map((item, itemIdx) => {
                            const query = searchQuery.trim().toLowerCase();
                            const isMatch =
                              query.length > 0 &&
                              (item.ar.toLowerCase().includes(query) ||
                                item.en.toLowerCase().includes(query));
                            return (
                              <div
                                key={itemIdx}
                                className={`truncate py-0.5 ${
                                  isMatch ? 'text-[#FFB547] font-bold' : ''
                                }`}
                                title={item[language]}
                              >
                                {item[language]}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
