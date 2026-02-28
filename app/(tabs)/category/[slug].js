import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitbaseIcon } from '@/components/kitbase-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getToolsByCategory, getCategoryBySlug } from '@/constants/tools';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const iconColor = useThemeColor({}, 'icon');

  const category = slug ? getCategoryBySlug(slug) : null;
  const tools = category ? getToolsByCategory(slug) : [];

  const openTool = (tool) => {
    const toolPath = tool.href.replace(/^\/tools\/?/, '') || '';
    const target = toolPath ? `/(tabs)/tool/${toolPath}` : '/(tabs)/tool';
    router.push(target);
  };

  if (!category) {
    return (
      <ThemedView style={styles.screen}>
        <View style={[styles.notFound, { paddingTop: Math.max(24, insets.top) }]}>
          <ThemedText type="title">Category not found</ThemedText>
          <ThemedText style={styles.notFoundSubtitle}>
            The requested category could not be found.
          </ThemedText>
          <Link href="/(tabs)/all-tools" asChild>
            <ThemedText style={styles.notFoundLink}>Browse all tools</ThemedText>
          </Link>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(24, insets.top) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.breadcrumb}>
          <Link href="/(tabs)" asChild>
            <ThemedText style={styles.breadcrumbLink}>Home</ThemedText>
          </Link>
          <ThemedText style={styles.breadcrumbSep}>›</ThemedText>
          <Link href="/(tabs)/all-tools" asChild>
            <ThemedText style={styles.breadcrumbLink}>All Tools</ThemedText>
          </Link>
          <ThemedText style={styles.breadcrumbSep}>›</ThemedText>
          <ThemedText type="defaultSemiBold">{category.name}</ThemedText>
        </View>

        <ThemedView
          style={[styles.categoryHeaderCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
          <View style={[styles.categoryHeaderIcon, { backgroundColor: cardBorder }]}>
            <KitbaseIcon name={category.iconName} size={28} color={category.color} />
          </View>
          <View style={styles.categoryHeaderText}>
            <ThemedText type="title" style={styles.categoryTitle}>
              {category.name}
            </ThemedText>
            <ThemedText style={styles.categoryMeta}>
              {tools.length} tools · {category.tags.join(', ')}
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.toolsGrid}>
          {tools.map((tool) => (
            <Pressable
              key={tool.href}
              onPress={() => openTool(tool)}
              style={({ pressed }) => [
                styles.toolCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: cardBorder }]}>
                <KitbaseIcon name={tool.iconName} size={20} color={iconColor} />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.toolName} numberOfLines={1}>
                {tool.name}
              </ThemedText>
              <ThemedText style={styles.toolDescription} numberOfLines={2}>
                {tool.description}
              </ThemedText>
            </Pressable>
          ))}
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
  notFound: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  notFoundSubtitle: {
    fontSize: 15,
    opacity: 0.85,
    textAlign: 'center',
  },
  notFoundLink: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.9,
  },
  breadcrumb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  breadcrumbLink: {
    fontSize: 13,
    opacity: 0.85,
  },
  breadcrumbSep: {
    fontSize: 13,
    opacity: 0.6,
  },
  categoryHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    marginBottom: 20,
  },
  categoryHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryHeaderText: {
    flex: 1,
  },
  categoryTitle: {
    marginBottom: 4,
  },
  categoryMeta: {
    fontSize: 13,
    opacity: 0.85,
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
  },
  toolDescription: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
  },
});
