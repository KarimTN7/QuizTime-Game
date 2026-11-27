/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppShell } from './components/AppShell';
import { CategoriesPage } from './components/CategoriesPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/HomePage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { MultiplayerPage } from './components/MultiplayerPage';
import { PlayHubModal } from './components/PlayHubModal';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { SingleplayerPage } from './components/SingleplayerPage';
import { AppProvider, useApp } from './context/AppContext';

const ActiveView: React.FC = () => {
  const { activeSection } = useApp();

  switch (activeSection) {
    case 'home':
      return <HomePage />;
    case 'singleplayer':
      return <SingleplayerPage />;
    case 'multiplayer':
      return <MultiplayerPage />;
    case 'categories':
      return <CategoriesPage />;
    case 'leaderboard':
      return <LeaderboardPage />;
    case 'profile':
      return <ProfilePage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <HomePage />;
  }
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppShell>
          <ActiveView />
        </AppShell>
        <PlayHubModal />
      </AppProvider>
    </ErrorBoundary>
  );
}
