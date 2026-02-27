import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@kitbase/theme';

export const ThemePreferenceContext = createContext(null);

export function ThemePreferenceProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setThemePreferenceState(value);
      }
      setLoaded(true);
    });
  }, []);

  const setThemePreference = useCallback((value) => {
    if (value !== 'light' && value !== 'dark' && value !== 'system') return;
    setThemePreferenceState(value);
    AsyncStorage.setItem(THEME_KEY, value);
  }, []);

  const colorScheme = themePreference === 'system' ? (systemScheme ?? 'light') : themePreference;

  const value = React.useMemo(
    () => ({
      colorScheme,
      themePreference: loaded ? themePreference : 'system',
      setThemePreference,
    }),
    [colorScheme, loaded, themePreference, setThemePreference]
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used inside ThemePreferenceProvider');
  }
  return ctx;
}
