import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

import { useHapticsPreference } from '@/context/HapticsPreferenceContext';

export function HapticTab(props) {
  const { hapticsOn } = useHapticsPreference();

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (hapticsOn && process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

