/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Match web app's slate/gray aesthetic and blue accent
const tintColorLight = '#2563eb'; // blue-600
const tintColorDark = '#60a5fa'; // blue-400

export const Colors = {
  light: {
    text: '#0f172a', // gray-900
    background: '#f8fafc', // slate-50
    tint: tintColorLight,
    icon: '#64748b', // slate-500
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    cardBorder: '#e2e8f0', // slate-200
    subtle: '#f1f5f9', // slate-100
  },
  dark: {
    text: '#e5e7eb', // gray-200
    background: '#020617', // gray-950
    tint: tintColorDark,
    icon: '#9ca3af', // gray-400
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorDark,
    card: '#020617',
    cardBorder: '#1f2937', // gray-800
    subtle: '#030712', // gray-950-ish
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

