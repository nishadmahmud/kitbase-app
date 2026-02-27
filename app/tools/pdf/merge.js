import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
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
import { formatFileSize } from '@/lib/utils/file';

const PDF_MIME = 'application/pdf';

export default function MergePdfScreen() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');
  const destructive = useThemeColor({}, 'text'); // fallback; we'll use red for remove

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

      const newFiles = result.assets.map((a) => ({
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

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultUri(null);
    setError(null);
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
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(24, insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <ThemedView style={[styles.fileListCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.fileListHeader}>
              <ThemedText type="defaultSemiBold" style={styles.fileCount}>
                {files.length} file{files.length !== 1 ? 's' : ''} added
              </ThemedText>
              <Pressable onPress={clearAll} hitSlop={8}>
                <ThemedText style={styles.clearText}>Clear all</ThemedText>
              </Pressable>
            </View>
            {files.map((file, i) => (
              <View key={`${file.uri}-${i}`} style={[styles.fileRow, i < files.length - 1 && styles.fileRowBorder, { borderColor: cardBorder }]}>
                <KitbaseIcon name="FileText" size={18} color={cardBorder} />
                <View style={styles.fileInfo}>
                  <ThemedText style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </ThemedText>
                  {file.size > 0 && (
                    <ThemedText style={styles.fileSize}>{formatFileSize(file.size)}</ThemedText>
                  )}
                </View>
                <Pressable onPress={() => removeFile(i)} hitSlop={8} style={styles.removeWrap}>
                  <KitbaseIcon name="X" size={18} color="#ef4444" />
                </Pressable>
              </View>
            ))}
          </ThemedView>
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
      </ScrollView>
    </ThemedView>
  );
}

const BASE64_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function uint8ArrayToBase64(bytes) {
  const len = bytes.byteLength;
  let result = '';
  for (let i = 0; i < len; i += 3) {
    const a = bytes[i];
    const b = i + 1 < len ? bytes[i + 1] : 0;
    const c = i + 2 < len ? bytes[i + 2] : 0;
    result += BASE64_CHAR[a >> 2];
    result += BASE64_CHAR[((a & 3) << 4) | (b >> 4)];
    result += i + 1 < len ? BASE64_CHAR[((b & 15) << 2) | (c >> 6)] : '=';
    result += i + 2 < len ? BASE64_CHAR[c & 63] : '=';
  }
  return result;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  fileListCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  fileListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  fileCount: {
    fontSize: 14,
  },
  clearText: {
    fontSize: 13,
    color: '#ef4444',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  fileRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: 14,
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  removeWrap: {
    padding: 4,
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
