/**
 * GitHub Profile Analyzer App
 * Cross-platform mobile app for analyzing GitHub profiles
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import UserInputScreen from '../src/screens/UserInputScreen';
import ProfileOverviewScreen from '../src/screens/ProfileOverviewScreen';
import AnalyticsScreen from '../src/screens/AnalyticsScreen';

type ScreenType = 'input' | 'profile' | 'analytics';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('analytics');
  const [selectedUsername, setSelectedUsername] = useState<string>('altusrossouw');

  const handleUserSelected = (username: string) => {
    setSelectedUsername(username);
    setCurrentScreen('profile');
  };

  const handleViewAnalytics = () => {
    setCurrentScreen('analytics');
  };

  const handleBackToProfile = () => {
    setCurrentScreen('profile');
  };

  const handleBackToInput = () => {
    setCurrentScreen('input');
    setSelectedUsername('');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'input':
        return <UserInputScreen onUserSelected={handleUserSelected} />;
      case 'profile':
        return (
          <ProfileOverviewScreen
            username={selectedUsername}
            onBackPress={handleBackToInput}
            onViewAnalytics={handleViewAnalytics}
          />
        );
      case 'analytics':
        return (
          <AnalyticsScreen
            username={selectedUsername}
            onBackPress={handleBackToProfile}
          />
        );
      default:
        return <UserInputScreen onUserSelected={handleUserSelected} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderCurrentScreen()}
    </SafeAreaProvider>
  );
}

export default App;
