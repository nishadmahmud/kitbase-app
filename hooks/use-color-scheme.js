import { createContext, useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { ThemePreferenceContext } from '../context/ThemePreferenceContext';

// Fallback so we never call useContext(undefined) - keeps hook order stable
const SafeContext = ThemePreferenceContext ?? createContext(null);

export function useColorScheme() {
  const ctx = useContext(SafeContext);
  const system = useRNColorScheme();
  if (ctx && ctx.colorScheme) return ctx.colorScheme;
  return system ?? 'light';
}

