import { useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { KitbaseIcon } from '@/components/kitbase-icon';
import { useThemeColor } from '@/hooks/use-theme-color';
import { imagesToPdfUris } from '@/lib/pdf/from-image';
import { uint8ArrayToBase64 } from '@/lib/utils/file';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/jpg'];

export default function ImageToPdfContent() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultUri, setResultUri] = useState(null);
  const [error, setError] = useState(null);

  const pickImages = async () => {
    setError(null);
    setResultUri(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: IMAGE_MIME,
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled) return;
      const newImages = result.assets.map((a, i) => ({
        id: `img-${Date.now()}-${i}`,
        uri: a.uri,
        name: a.name ?? `image-${i + 1}.jpg`,
      }));
      setImages((prev) => [...prev, ...newImages]);
    } catch (e) {
      setError(e.message ?? 'Could not pick images');
    }
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setResultUri(null);
  };

  const moveImage = (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    setImages((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
    setResultUri(null);
  };

  const clearAll = () => {
    setImages([]);
    setResultUri(null);
    setError(null);
  };

  const createPdf = async () => {
    if (images.length === 0) {
      setError('Add at least one image.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const input = images.map((img) => ({ uri: img.uri, name: img.name }));
      const bytes = await imagesToPdfUris(input);
      const filename = `kitbase-images-${Date.now()}.pdf`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      const base64 = uint8ArrayToBase64(bytes);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setResultUri(path);
    } catch (e) {
      setError(e.message ?? 'Create PDF failed');
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
        mimeType: 'application/pdf',
        dialogTitle: 'Save PDF',
      });
    } catch (e) {
      setError(e.message ?? 'Share failed');
    }
  };

  return (
    <View style={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom) }]}>
      <ThemedText style={styles.description}>
        Create a PDF from images (JPG/PNG). Order of images = page order. Tap ↑ ↓ to reorder.
      </ThemedText>

      <Pressable
        onPress={pickImages}
        style={({ pressed }) => [
          styles.pickButton,
          { backgroundColor: cardBg, borderColor: cardBorder },
          pressed && styles.pickButtonPressed,
        ]}
      >
        <KitbaseIcon name="Image" size={22} color={tint} />
        <ThemedText type="defaultSemiBold" style={[styles.pickButtonText, { color: tint }]}>
          Select images
        </ThemedText>
      </Pressable>

      {images.length > 0 && (
        <View style={styles.thumbSection}>
          <View style={styles.thumbSectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.fileCount}>
              {images.length} image{images.length !== 1 ? 's' : ''}
            </ThemedText>
            <Pressable onPress={clearAll} hitSlop={8}>
              <ThemedText style={styles.clearText}>Clear all</ThemedText>
            </Pressable>
          </View>
          <ThemedText style={styles.dragHint}>Tap ↑ ↓ to reorder</ThemedText>
          {images.map((item, index) => (
            <View
              key={item.id}
              style={[styles.thumbRow, { backgroundColor: cardBg, borderColor: cardBorder }]}
            >
              <View style={[styles.thumbNumBadge, { backgroundColor: tint }]}>
                <ThemedText style={[styles.thumbNumText, { color: '#fff' }]}>{index + 1}</ThemedText>
              </View>
              <View style={styles.reorderWrap}>
                <Pressable
                  onPress={() => moveImage(index, -1)}
                  disabled={index === 0}
                  style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                  hitSlop={6}
                >
                  <KitbaseIcon name="ChevronUp" size={18} color={index === 0 ? cardBorder : tint} />
                </Pressable>
                <Pressable
                  onPress={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  style={[styles.reorderBtn, index === images.length - 1 && styles.reorderBtnDisabled]}
                  hitSlop={6}
                >
                  <KitbaseIcon name="ChevronDown" size={18} color={index === images.length - 1 ? cardBorder : tint} />
                </Pressable>
              </View>
              <View style={[styles.thumbIconWrap, { backgroundColor: cardBorder }]}>
                <KitbaseIcon name="Image" size={22} color={tint} />
              </View>
              <ThemedText style={styles.thumbFileName} numberOfLines={1} ellipsizeMode="middle">
                {item.name}
              </ThemedText>
              <Pressable
                onPress={() => removeImage(item.id)}
                hitSlop={8}
                style={[styles.thumbRemove, { backgroundColor: cardBg, borderColor: cardBorder }]}
              >
                <KitbaseIcon name="X" size={14} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={createPdf}
        disabled={images.length === 0 || loading}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: tint },
          (images.length === 0 || loading) && styles.actionButtonDisabled,
          pressed && images.length > 0 && !loading && styles.actionButtonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <KitbaseIcon name="FileText" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Create PDF
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
            PDF created!
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
    marginBottom: 20,
  },
  pickButtonPressed: { opacity: 0.8 },
  pickButtonText: { fontSize: 16 },
  thumbSection: { marginBottom: 20 },
  thumbSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  fileCount: { fontSize: 14 },
  clearText: { fontSize: 13, color: '#ef4444' },
  dragHint: { fontSize: 12, opacity: 0.7, marginBottom: 10 },
  thumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  thumbNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbNumText: { fontSize: 12, fontWeight: '700' },
  reorderWrap: { flexDirection: 'column', gap: 0 },
  reorderBtn: { padding: 2 },
  reorderBtnDisabled: { opacity: 0.4 },
  thumbIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  thumbFileName: { flex: 1, fontSize: 14, minWidth: 0 },
  thumbRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
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
