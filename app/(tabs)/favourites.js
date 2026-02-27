import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.content, { paddingTop: Math.max(24, insets.top) }]}>
        <ThemedText type="title">Favourites</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your saved tools will appear here. Tap the heart on any tool to add it.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    opacity: 0.85,
  },
});
