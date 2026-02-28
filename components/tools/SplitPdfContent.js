import { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { KitbaseIcon } from '@/components/kitbase-icon';
import { useThemeColor } from '@/hooks/use-theme-color';
import { splitPdfUri } from '@/lib/pdf/split';
import { uint8ArrayToBase64 } from '@/lib/utils/file';

const PDF_MIME = 'application/pdf';

export default function SplitPdfContent() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('extract-all');
  const [fixedCount, setFixedCount] = useState('2');
  const [loading, setLoading] = useState(false);
  const [resultUri, setResultUri] = useState(null);
  const [resultCount, setResultCount] = useState(null);
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
      setFile({ uri: asset.uri, name: asset.name ?? 'Document.pdf' });
    } catch (e) {
      setError(e.message ?? 'Could not pick file');
    }
  };

  const split = async () => {
    if (!file) {
      setError('Select a PDF first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const options =
        mode === 'fixed-range'
          ? { mode: 'fixed-range', fixedCount: Math.max(1, parseInt(fixedCount, 10) || 1) }
          : { mode: 'extract-all' };
      const results = await splitPdfUri(file.uri, file.name.replace(/\.pdf$/i, ''), options);
      setResultCount(results.length);

      const zip = new JSZip();
      for (const { name, bytes } of results) {
        zip.file(name, bytes);
      }
      const zipBlob = await zip.generateAsync({ type: 'uint8array' });
      const zipPath = `${FileSystem.cacheDirectory}kitbase-split-${Date.now()}.zip`;
      const base64 = uint8ArrayToBase64(zipBlob);
      await FileSystem.writeAsStringAsync(zipPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setResultUri(zipPath);
    } catch (e) {
      setError(e.message ?? 'Split failed');
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
        mimeType: 'application/zip',
        dialogTitle: 'Save split PDFs (ZIP)',
      });
    } catch (e) {
      setError(e.message ?? 'Share failed');
    }
  };

  return (
    <View style={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom) }]}>
      <ThemedText style={styles.description}>
        Split a PDF into separate files. Extract every page as its own PDF, or split every N pages.
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

      <View style={[styles.modeRow, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Pressable
          onPress={() => setMode('extract-all')}
          style={[styles.modeOption, mode === 'extract-all' && { backgroundColor: tint }]}
        >
          <ThemedText style={mode === 'extract-all' ? styles.modeTextActive : styles.modeText}>
            One per page
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setMode('fixed-range')}
          style={[styles.modeOption, mode === 'fixed-range' && { backgroundColor: tint }]}
        >
          <ThemedText style={mode === 'fixed-range' ? styles.modeTextActive : styles.modeText}>
            Every N pages
          </ThemedText>
        </Pressable>
      </View>

      {mode === 'fixed-range' && (
        <View style={styles.inputRow}>
          <ThemedText style={styles.inputLabel}>Pages per file:</ThemedText>
          <TextInput
            value={fixedCount}
            onChangeText={setFixedCount}
            keyboardType="number-pad"
            style={[styles.input, { backgroundColor: cardBg, borderColor: cardBorder, color: textColor }]}
            placeholder="2"
          />
        </View>
      )}

      <Pressable
        onPress={split}
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
            <KitbaseIcon name="Split" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Split PDF
            </ThemedText>
          </>
        )}
      </Pressable>

      {error ? (
        <ThemedView style={[styles.messageBox, styles.errorBox]}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : null}

      {resultUri && resultCount != null ? (
        <ThemedView style={[styles.messageBox, styles.successBox, { borderColor: cardBorder }]}>
          <ThemedText type="defaultSemiBold" style={styles.successText}>
            Split into {resultCount} file(s). Saved as ZIP.
          </ThemedText>
          <Pressable
            onPress={shareResult}
            style={({ pressed }) => [styles.shareButton, { backgroundColor: tint }, pressed && styles.shareButtonPressed]}
          >
            <KitbaseIcon name="Share" size={18} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.shareButtonText}>
              Share ZIP
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
  modeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  modeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeText: { fontSize: 14 },
  modeTextActive: { fontSize: 14, color: '#fff', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  inputLabel: { fontSize: 14 },
  input: {
    width: 70,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
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
