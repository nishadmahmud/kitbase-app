import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTICS_KEY = '@kitbase/haptics';

const HapticsPreferenceContext = createContext(null);

export function HapticsPreferenceProvider({ children }) {
  const [hapticsOn, setHapticsOnState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(HAPTICS_KEY).then((value) => {
      if (value === 'false') setHapticsOnState(false);
      if (value === 'true') setHapticsOnState(true);
      setLoaded(true);
    });
  }, []);

  const setHapticsOn = (value) => {
    setHapticsOnState(!!value);
    AsyncStorage.setItem(HAPTICS_KEY, value ? 'true' : 'false');
  };

  return (
    <HapticsPreferenceContext.Provider value={{ hapticsOn: loaded ? hapticsOn : true, setHapticsOn }}>
      {children}
    </HapticsPreferenceContext.Provider>
  );
}

export function useHapticsPreference() {
  const ctx = useContext(HapticsPreferenceContext);
  if (!ctx) return { hapticsOn: true, setHapticsOn: () => {} };
  return ctx;
}
