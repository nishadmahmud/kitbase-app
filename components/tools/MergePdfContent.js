import { useState } from 'react';
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
import { mergePdfUris } from '@/lib/pdf/merge';
import { formatFileSize, uint8ArrayToBase64 } from '@/lib/utils/file';

const PDF_MIME = 'application/pdf';

export default function MergePdfContent() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultUri, setResultUri] = useState(null);
  const [error, setError] = useState(null);

  const pickPdfs = async () => {
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: PDF_MIME,
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) return;

      const newFiles = result.assets.map((a, i) => ({
        id: `pdf-${Date.now()}-${i}`,
        uri: a.uri,
        name: a.name ?? 'Document.pdf',
        size: a.size ?? 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      setResultUri(null);
    } catch (e) {
      setError(e.message ?? 'Could not pick files');
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResultUri(null);
    setError(null);
  };

  const moveFile = (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= files.length) return;
    setFiles((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
    setResultUri(null);
  };

  const clearAll = () => {
    setFiles([]);
    setResultUri(null);
    setError(null);
  };

  const merge = async () => {
    if (files.length < 2) {
      setError('Select at least 2 PDF files.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bytes = await mergePdfUris(files);
      const filename = `kitbase-merged-${Date.now()}.pdf`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      const base64 = uint8ArrayToBase64(bytes);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setResultUri(path);
    } catch (e) {
      setError(e.message ?? 'Merge failed');
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
        dialogTitle: 'Save merged PDF',
      });
    } catch (e) {
      setError(e.message ?? 'Share failed');
    }
  };

  return (
    <View
      style={[
        styles.scrollContent,
        { paddingBottom: Math.max(24, insets.bottom) },
      ]}
    >
      <ThemedText style={styles.description}>
        Combine multiple PDF files into a single document. Select at least 2
        files, then tap Merge.
      </ThemedText>

      <Pressable
        onPress={pickPdfs}
        style={({ pressed }) => [
          styles.pickButton,
          { backgroundColor: cardBg, borderColor: cardBorder },
          pressed && styles.pickButtonPressed,
        ]}
      >
        <KitbaseIcon name="FileText" size={22} color={tint} />
        <ThemedText type="defaultSemiBold" style={[styles.pickButtonText, { color: tint }]}>
          Select PDF files
        </ThemedText>
      </Pressable>

      {files.length > 0 && (
        <View style={styles.thumbSection}>
          <View style={styles.thumbSectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.fileCount}>
              {files.length} file{files.length !== 1 ? 's' : ''} added
            </ThemedText>
            <Pressable onPress={clearAll} hitSlop={8}>
              <ThemedText style={styles.clearText}>Clear all</ThemedText>
            </Pressable>
          </View>
          <ThemedText style={styles.dragHint}>
            Tap ↑ ↓ to reorder
          </ThemedText>
          {files.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.thumbRow,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View style={[styles.thumbNumBadge, { backgroundColor: tint }]}>
                <ThemedText style={[styles.thumbNumText, { color: '#fff' }]}>{index + 1}</ThemedText>
              </View>
              <View style={styles.reorderWrap}>
                <Pressable
                  onPress={() => moveFile(index, -1)}
                  disabled={index === 0}
                  style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                  hitSlop={6}
                >
                  <KitbaseIcon name="ChevronUp" size={18} color={index === 0 ? cardBorder : tint} />
                </Pressable>
                <Pressable
                  onPress={() => moveFile(index, 1)}
                  disabled={index === files.length - 1}
                  style={[styles.reorderBtn, index === files.length - 1 && styles.reorderBtnDisabled]}
                  hitSlop={6}
                >
                  <KitbaseIcon name="ChevronDown" size={18} color={index === files.length - 1 ? cardBorder : tint} />
                </Pressable>
              </View>
              <View style={[styles.thumbIconWrap, { backgroundColor: cardBorder }]}>
                <KitbaseIcon name="FileText" size={22} color={tint} />
              </View>
              <View style={styles.thumbTextWrap}>
                <ThemedText style={styles.thumbFileName} numberOfLines={1} ellipsizeMode="middle">
                  {item.name}
                </ThemedText>
                {item.size > 0 && (
                  <ThemedText style={styles.thumbFileSize}>
                    {formatFileSize(item.size)}
                  </ThemedText>
                )}
              </View>
              <Pressable
                onPress={() => removeFile(item.id)}
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
        onPress={merge}
        disabled={files.length < 2 || loading}
        style={({ pressed }) => [
          styles.mergeButton,
          { backgroundColor: tint },
          (files.length < 2 || loading) && styles.mergeButtonDisabled,
          pressed && !loading && files.length >= 2 && styles.mergeButtonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <KitbaseIcon name="Merge" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.mergeButtonText}>
              Merge {files.length > 1 ? `${files.length} PDFs` : 'PDFs'}
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
            PDFs merged successfully!
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  description: {
    fontSize: 15,
    opacity: 0.9,
    marginBottom: 20,
  },
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
  pickButtonPressed: {
    opacity: 0.8,
  },
  pickButtonText: {
    fontSize: 16,
  },
  thumbSection: {
    marginBottom: 20,
  },
  thumbSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  fileCount: {
    fontSize: 14,
  },
  clearText: {
    fontSize: 13,
    color: '#ef4444',
  },
  dragHint: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 10,
  },
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
  thumbNumText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reorderWrap: {
    flexDirection: 'column',
    gap: 0,
  },
  reorderBtn: {
    padding: 2,
  },
  reorderBtnDisabled: {
    opacity: 0.4,
  },
  thumbIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  thumbTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  thumbFileName: {
    fontSize: 14,
  },
  thumbFileSize: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  thumbRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  mergeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  mergeButtonDisabled: {
    opacity: 0.5,
  },
  mergeButtonPressed: {
    opacity: 0.9,
  },
  mergeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  messageBox: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  successBox: {
    borderWidth: 1,
  },
  successText: {
    marginBottom: 12,
    fontSize: 15,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareButtonPressed: {
    opacity: 0.9,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 15,
  },
});
