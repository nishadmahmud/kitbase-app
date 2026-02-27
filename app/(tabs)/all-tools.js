import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitbaseIcon } from '@/components/kitbase-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { categories, getToolsByCategory } from '@/constants/tools';

export default function AllToolsScreen() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(16, insets.top) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">All Tools</ThemedText>
          <ThemedText style={styles.subtitle}>
            Browse every tool available on Kitbase.
          </ThemedText>
        </View>

        <View style={styles.sections}>
          {categories.map((cat) => {
            const categoryTools = getToolsByCategory(cat.slug);
            return (
              <View key={cat.slug} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <View
                    style={[
                      styles.categoryIconWrap,
                      { backgroundColor: cardBg, borderColor: cardBorder },
                    ]}
                  >
                    <KitbaseIcon name={cat.iconName} size={22} color={cat.color} />
                  </View>
                  <View style={styles.categoryHeaderText}>
                    <ThemedText type="subtitle">{cat.name}</ThemedText>
                    <ThemedText style={styles.toolCount}>
                      {categoryTools.length} tools
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.toolsGrid}>
                  {categoryTools.map((tool) => (
                    <ThemedView
                      key={tool.href}
                      style={[
                        styles.toolCard,
                        { backgroundColor: cardBg, borderColor: cardBorder },
                      ]}
                    >
                      <View
                        style={[
                          styles.toolIconWrap,
                          { backgroundColor: cardBorder },
                        ]}
                      >
                        <KitbaseIcon
                          name={tool.iconName}
                          size={20}
                          color={iconColor}
                        />
                      </View>
                      <ThemedText type="defaultSemiBold" style={styles.toolName} numberOfLines={1}>
                        {tool.name}
                      </ThemedText>
                      <ThemedText style={styles.toolDescription} numberOfLines={2}>
                        {tool.description}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    opacity: 0.85,
  },
  sections: {
    gap: 28,
  },
  categorySection: {
    gap: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  categoryHeaderText: {
    gap: 2,
  },
  toolCount: {
    fontSize: 13,
    opacity: 0.8,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolCard: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  toolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolName: {
    fontSize: 14,
    marginBottom: 0,
  },
  toolDescription: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
  },
});
