import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitbaseIcon } from '@/components/kitbase-icon';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { categories, popularTools } from '@/constants/tools';

function SearchSection() {
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <Link href="/(tabs)/all-tools" asChild>
      <Pressable
        style={({ pressed }) => [
          styles.searchFakeBar,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            borderWidth: 1,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.searchFakeRow}>
          <KitbaseIcon name="Search" size={20} color={iconColor} style={styles.searchFakeIcon} />
          <ThemedText style={styles.searchFakePlaceholder} numberOfLines={1}>
            Search PDF, image, dev tools…
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

function HeroSection() {
  const heroBg = useThemeColor({}, 'subtle');

  return (
    <ThemedView style={[styles.heroContainer, { backgroundColor: heroBg }]}>
      <ThemedText type="title">All your everyday tools.</ThemedText>
      <ThemedText type="title" style={styles.heroSubtitle}>
        One clean place.
      </ThemedText>
      <ThemedText style={styles.heroDescription}>
        PDF, images, text, and developer utilities – fast, private, and free. No uploads, no ads,
        just pure utility.
      </ThemedText>

      <View style={styles.heroButtonsRow}>
        <Link href="/(tabs)/all-tools" asChild>
          <ThemedView style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonText}>Browse tools</ThemedText>
          </ThemedView>
        </Link>
        <Link href="/(tabs)/all-tools" asChild>
          <ThemedView style={styles.secondaryButton}>
            <ThemedText style={styles.secondaryButtonText}>Popular tools</ThemedText>
          </ThemedView>
        </Link>
      </View>
    </ThemedView>
  );
}

function PopularToolsSection() {
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const iconColor = useThemeColor({}, 'icon');
  const getCat = (slug) => categories.find((c) => c.slug === slug);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">Most popular</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>Tools used every day on kitbase.tech</ThemedText>
      </View>

      <View style={styles.popularGrid}>
        {popularTools.map((tool) => {
          const catInfo = getCat(tool.category);
          return (
            <ThemedView
              key={tool.name}
              style={[styles.toolCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: cardBorder }]}>
                <KitbaseIcon name={tool.iconName} size={20} color={iconColor} />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.toolTitle} numberOfLines={1}>
                {tool.name}
              </ThemedText>
              <ThemedText style={styles.toolCategory} numberOfLines={1}>
                {catInfo ? catInfo.name : tool.category}
              </ThemedText>
              <ThemedText style={styles.toolDescription} numberOfLines={2}>
                {tool.description}
              </ThemedText>
            </ThemedView>
          );
        })}
      </View>
    </View>
  );
}

function CategoriesSection() {
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Browse categories
      </ThemedText>
      <View style={styles.categoriesGrid}>
        {categories.map((cat) => (
          <View key={cat.slug} style={styles.categoryCardWrap}>
            <Link href={`/category/${cat.slug}`} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.categoryCard,
                  { backgroundColor: cardBg, borderColor: cardBorder, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={[styles.categoryIconBubble, { backgroundColor: `${cat.color}1A` }]}>
                  <KitbaseIcon name={cat.iconName} size={20} color={cat.color} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.categoryTitle} numberOfLines={1}>
                  {cat.name}
                </ThemedText>
                <ThemedText style={styles.categoryDescription} numberOfLines={2}>
                  {cat.description}
                </ThemedText>
                <View style={styles.categoryTagsRow}>
                  {cat.tags.slice(0, 3).map((tag) => (
                    <ThemedText key={tag} style={styles.categoryTag}>
                      {tag}
                    </ThemedText>
                  ))}
                </View>
              </Pressable>
            </Link>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(24, insets.top) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection />
        <SearchSection />
        <PopularToolsSection />
        <CategoriesSection />
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
    gap: 24,
  },
  heroContainer: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  heroSubtitle: {
    color: '#64748b',
  },
  heroDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  searchFakeBar: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    width: '100%',
  },
  searchFakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchFakeIcon: {
    opacity: 0.8,
  },
  searchFakePlaceholder: {
    flex: 1,
    fontSize: 16,
    opacity: 0.7,
    minWidth: 0,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  toolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    fontSize: 14,
    marginBottom: 0,
  },
  toolCategory: {
    fontSize: 11,
    opacity: 0.85,
    marginBottom: 0,
  },
  toolDescription: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCardWrap: {
    width: '48%',
  },
  categoryCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  categoryIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 14,
  },
  categoryDescription: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.9,
  },
  categoryTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  categoryTag: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    opacity: 0.8,
  },
});

