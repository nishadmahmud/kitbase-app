import { StyleSheet, View, ScrollView } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getToolByHref, getCategoryBySlug } from '@/constants/tools';
import MergePdfContent from '@/components/tools/MergePdfContent';
import CompressPdfContent from '@/components/tools/CompressPdfContent';
import SplitPdfContent from '@/components/tools/SplitPdfContent';
import ReorderPdfContent from '@/components/tools/ReorderPdfContent';
import ImageToPdfContent from '@/components/tools/ImageToPdfContent';
import ProtectPdfContent from '@/components/tools/ProtectPdfContent';
import UnlockPdfContent from '@/components/tools/UnlockPdfContent';
import WatermarkPdfContent from '@/components/tools/WatermarkPdfContent';
import SignPdfContent from '@/components/tools/SignPdfContent';
import PdfToImageContent from '@/components/tools/PdfToImageContent';

const IMPLEMENTED_TOOLS = {
  '/tools/pdf/merge': MergePdfContent,
  '/tools/pdf/compress': CompressPdfContent,
  '/tools/pdf/split': SplitPdfContent,
  '/tools/pdf/reorder': ReorderPdfContent,
  '/tools/pdf/from-image': ImageToPdfContent,
  '/tools/pdf/protect': ProtectPdfContent,
  '/tools/pdf/unlock': UnlockPdfContent,
  '/tools/pdf/watermark': WatermarkPdfContent,
  '/tools/pdf/sign': SignPdfContent,
  '/tools/pdf/to-image': PdfToImageContent,
};

export default function ToolScreen() {
  const { path } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const pathArray = Array.isArray(path) ? path : path ? [path] : [];
  const href = pathArray.length > 0 ? `/tools/${pathArray.join('/')}` : null;
  const tool = href ? getToolByHref(href) : null;
  const category = tool ? getCategoryBySlug(tool.category) : null;
  const ToolContent = tool ? IMPLEMENTED_TOOLS[tool.href] : null;

  if (!tool || !category) {
    return (
      <ThemedView style={styles.screen}>
        <View style={[styles.notFound, { paddingTop: Math.max(24, insets.top) }]}>
          <ThemedText type="title">Tool not found</ThemedText>
          <ThemedText style={styles.notFoundSubtitle}>
            The requested tool could not be found.
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
          <Link href={`/(tabs)/category/${category.slug}`} asChild>
            <ThemedText style={styles.breadcrumbLink}>{category.name}</ThemedText>
          </Link>
          <ThemedText style={styles.breadcrumbSep}>›</ThemedText>
          <ThemedText type="defaultSemiBold">{tool.name}</ThemedText>
        </View>

        {ToolContent ? (
          <View style={styles.toolContentWrap}>
            <ToolContent />
          </View>
        ) : (
          <ThemedView style={styles.comingSoon}>
            <ThemedText type="subtitle" style={styles.comingSoonTitle}>
              Coming soon
            </ThemedText>
            <ThemedText style={styles.comingSoonText}>
              {tool.name} will be available in a future update.
            </ThemedText>
            <Link href={`/(tabs)/category/${category.slug}`} asChild>
              <ThemedText style={styles.comingSoonLink}>
                Back to {category.name}
              </ThemedText>
            </Link>
          </ThemedView>
        )}
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
  comingSoon: {
    paddingVertical: 24,
    gap: 12,
  },
  comingSoonTitle: {
    marginBottom: 4,
  },
  comingSoonText: {
    fontSize: 15,
    opacity: 0.9,
  },
  comingSoonLink: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.9,
  },
  toolContentWrap: {
    marginTop: 0,
  },
});

