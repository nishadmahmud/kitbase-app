import { StyleSheet, View, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KitbaseIcon } from '@/components/kitbase-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { categories, popularTools } from '@/constants/tools';

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
              <ThemedText type="defaultSemiBold" style={styles.toolTitle}>
                {tool.name}
              </ThemedText>
              <ThemedText style={styles.toolCategory}>{catInfo ? catInfo.name : tool.category}</ThemedText>
              <ThemedText style={styles.toolDescription}>{tool.description}</ThemedText>
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
          <ThemedView
            key={cat.slug}
            style={[styles.categoryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <View style={[styles.categoryIconBubble, { backgroundColor: `${cat.color}1A` }]}>
              <KitbaseIcon name={cat.iconName} size={22} color={cat.color} />
            </View>
            <View style={styles.categoryText}>
              <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>
                {cat.name}
              </ThemedText>
              <ThemedText style={styles.categoryDescription}>{cat.description}</ThemedText>
              <View style={styles.categoryTagsRow}>
                {cat.tags.slice(0, 3).map((tag) => (
                  <ThemedText key={tag} style={styles.categoryTag}>
                    {tag}
                  </ThemedText>
                ))}
              </View>
            </View>
          </ThemedView>
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
    gap: 12,
  },
  toolCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  toolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    marginBottom: 2,
  },
  toolCategory: {
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  categoriesGrid: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 12,
  },
  categoryIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
  },
  categoryText: {
    flex: 1,
    gap: 4,
  },
  categoryTitle: {
    fontSize: 15,
  },
  categoryDescription: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
  categoryTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  categoryTag: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    opacity: 0.8,
  },
});

