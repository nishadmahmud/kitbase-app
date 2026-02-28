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
import { compressPdfUri } from '@/lib/pdf/split';
import { formatFileSize, uint8ArrayToBase64 } from '@/lib/utils/file';

const PDF_MIME = 'application/pdf';

export default function CompressPdfContent() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUri, setResultUri] = useState(null);
  const [resultSize, setResultSize] = useState(null);
  const [error, setError] = useState(null);

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
      setFile({ uri: asset.uri, name: asset.name ?? 'Document.pdf', size: asset.size ?? 0 });
    } catch (e) {
      setError(e.message ?? 'Could not pick file');
    }
  };

  const compress = async () => {
    if (!file) {
      setError('Select a PDF first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bytes = await compressPdfUri(file.uri);
      setResultSize(bytes.byteLength);
      const filename = `kitbase-compressed-${Date.now()}.pdf`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      const base64 = uint8ArrayToBase64(bytes);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setResultUri(path);
    } catch (e) {
      setError(e.message ?? 'Compress failed');
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
        dialogTitle: 'Save compressed PDF',
      });
    } catch (e) {
      setError(e.message ?? 'Share failed');
    }
  };

  return (
    <View style={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom) }]}>
      <ThemedText style={styles.description}>
        Reduce PDF file size. Select a PDF, then tap Optimize.
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

      {file && (
        <ThemedText style={styles.fileSize}>
          Size: {formatFileSize(file.size)}
        </ThemedText>
      )}

      <Pressable
        onPress={compress}
        disabled={!file || loading}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: tint },
          (!file || loading) && styles.actionButtonDisabled,
          pressed && file && !loading && styles.actionButtonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <KitbaseIcon name="Minus" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Optimize PDF
            </ThemedText>
          </>
        )}
      </Pressable>

      {error ? (
        <ThemedView style={[styles.messageBox, styles.errorBox]}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : null}

      {resultUri && resultSize != null ? (
        <ThemedView style={[styles.messageBox, styles.successBox, { borderColor: cardBorder }]}>
          <ThemedText type="defaultSemiBold" style={styles.successText}>
            Compressed! New size: {formatFileSize(resultSize)}
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
    marginBottom: 12,
  },
  pickButtonPressed: { opacity: 0.8 },
  pickButtonText: { fontSize: 16 },
  fileSize: { fontSize: 13, opacity: 0.8, marginBottom: 16 },
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
