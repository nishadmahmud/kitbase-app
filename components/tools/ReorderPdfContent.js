import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { KitbaseIcon } from '@/components/kitbase-icon';
import { useThemeColor } from '@/hooks/use-theme-color';
import { reorderPdfUri } from '@/lib/pdf/reorder';
import { getPdfPageCountUri } from '@/lib/pdf/split';
import { uint8ArrayToBase64 } from '@/lib/utils/file';

const PDF_MIME = 'application/pdf';

export default function ReorderPdfContent() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');

  const [file, setFile] = useState(null);
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultUri, setResultUri] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setOrder([]);
      return;
    }
    let cancelled = false;
    getPdfPageCountUri(file.uri)
      .then((count) => {
        if (!cancelled) setOrder(Array.from({ length: count }, (_, i) => i));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Could not read page count');
      });
    return () => { cancelled = true; };
  }, [file]);

  const pickPdf = async () => {
    setError(null);
    setResultUri(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: PDF_MIME,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setFile({ uri: asset.uri, name: asset.name ?? 'Document.pdf' });
    } catch (e) {
      setError(e.message ?? 'Could not pick file');
    }
  };

  const movePage = (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= order.length) return;
    setOrder((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
    setResultUri(null);
  };

  const reorder = async () => {
    if (!file || order.length === 0) {
      setError('Select a PDF first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bytes = await reorderPdfUri(file.uri, order);
      const filename = `kitbase-reordered-${Date.now()}.pdf`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      const base64 = uint8ArrayToBase64(bytes);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setResultUri(path);
    } catch (e) {
      setError(e.message ?? 'Reorder failed');
    } finally {
      setLoading(false);
    }
  };

  const shareResult = async () => {
    if (!resultUri) return;
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(resultUri, {
        mimeType: PDF_MIME,
        dialogTitle: 'Save reordered PDF',
      });
    } catch (e) {
      setError(e.message ?? 'Share failed');
    }
  };

  return (
    <View style={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom) }]}>
      <ThemedText style={styles.description}>
        Change the order of pages. Select a PDF, drag pages with ↑ ↓, then tap Reorder.
      </ThemedText>

      <Pressable
        onPress={pickPdf}
        style={({ pressed }) => [
          styles.pickButton,
          { backgroundColor: cardBg, borderColor: cardBorder },
          pressed && styles.pickButtonPressed,
        ]}
      >
        <KitbaseIcon name="FileText" size={22} color={tint} />
        <ThemedText type="defaultSemiBold" style={[styles.pickButtonText, { color: tint }]}>
          {file ? file.name : 'Select PDF'}
        </ThemedText>
      </Pressable>

      {order.length > 0 && (
        <View style={styles.pageSection}>
          <ThemedText style={styles.dragHint}>Tap ↑ ↓ to reorder pages</ThemedText>
          {order.map((pageIdx, index) => (
            <View
              key={index}
              style={[styles.pageRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
            >
              <View style={[styles.pageNumBadge, { backgroundColor: tint }]}>
                <ThemedText style={[styles.pageNumText, { color: '#fff' }]}>{index + 1}</ThemedText>
              </View>
              <View style={styles.reorderWrap}>
                <Pressable
                  onPress={() => movePage(index, -1)}
                  disabled={index === 0}
                  style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                  hitSlop={6}
                >
                  <KitbaseIcon name="ChevronUp" size={18} color={index === 0 ? cardBorder : tint} />
                </Pressable>
                <Pressable
                  onPress={() => movePage(index, 1)}
                  disabled={index === order.length - 1}
                  style={[styles.reorderBtn, index === order.length - 1 && styles.reorderBtnDisabled]}
                  hitSlop={6}
                >
                  <KitbaseIcon name="ChevronDown" size={18} color={index === order.length - 1 ? cardBorder : tint} />
                </Pressable>
              </View>
              <ThemedText style={styles.pageLabel}>Page {pageIdx + 1}</ThemedText>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={reorder}
        disabled={!file || order.length === 0 || loading}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: tint },
          (!file || order.length === 0 || loading) && styles.actionButtonDisabled,
          pressed && file && !loading && styles.actionButtonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <KitbaseIcon name="ArrowUpDown" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Reorder PDF
            </ThemedText>
          </>
        )}
      </Pressable>

      {error ? (
        <ThemedView style={[styles.messageBox, styles.errorBox]}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : null}

      {resultUri ? (
        <ThemedView style={[styles.messageBox, styles.successBox, { borderColor: cardBorder }]}>
          <ThemedText type="defaultSemiBold" style={styles.successText}>
            Pages reordered!
          </ThemedText>
          <Pressable
            onPress={shareResult}
            style={({ pressed }) => [styles.shareButton, { backgroundColor: tint }, pressed && styles.shareButtonPressed]}
          >
            <KitbaseIcon name="Share" size={18} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.shareButtonText}>
              Share / Save PDF
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  description: { fontSize: 15, opacity: 0.9, marginBottom: 20 },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  pickButtonPressed: { opacity: 0.8 },
  pickButtonText: { fontSize: 16 },
  pageSection: { marginBottom: 16 },
  dragHint: { fontSize: 12, opacity: 0.7, marginBottom: 10 },
  pageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  pageNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumText: { fontSize: 12, fontWeight: '700' },
  reorderWrap: { flexDirection: 'column', gap: 0 },
  reorderBtn: { padding: 2 },
  reorderBtnDisabled: { opacity: 0.4 },
  pageLabel: { flex: 1, fontSize: 14 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  actionButtonDisabled: { opacity: 0.5 },
  actionButtonPressed: { opacity: 0.9 },
  actionButtonText: { color: '#fff', fontSize: 16 },
  messageBox: { padding: 14, borderRadius: 12, marginBottom: 12 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)' },
  errorText: { fontSize: 14, color: '#ef4444' },
  successBox: { borderWidth: 1 },
  successText: { marginBottom: 12, fontSize: 15 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareButtonPressed: { opacity: 0.9 },
  shareButtonText: { color: '#fff', fontSize: 15 },
});
