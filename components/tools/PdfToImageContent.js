import { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { KitbaseIcon } from '@/components/kitbase-icon';
import { useThemeColor } from '@/hooks/use-theme-color';
import { pdfToImages } from '@/lib/pdf/to-image';
import { uint8ArrayToBase64 } from '@/lib/utils/file';

const PDF_MIME = 'application/pdf';
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PdfToImageContent() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');

  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultUri, setResultUri] = useState(null);
  const [error, setError] = useState(null);

  const pickPdf = async () => {
    setError(null);
    setResultUri(null);
    setImages([]);
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

  const convert = async () => {
    if (!file) {
      setError('Select a PDF first.');
      return;
    }
    setLoading(true);
    setError(null);
    setImages([]);
    setResultUri(null);
    try {
      let filePath = file.uri;
      if (filePath.startsWith('content://')) {
        const dest = `${FileSystem.cacheDirectory}pdf-to-img-${Date.now()}.pdf`;
        await FileSystem.copyAsync({ from: file.uri, to: dest });
        filePath = dest;
      }

      const results = await pdfToImages(filePath, 2.0);
      setImages(results);
    } catch (e) {
      setError(e.message ?? 'Conversion failed. Make sure you are using a dev build, not Expo Go.');
    } finally {
      setLoading(false);
    }
  };

  const shareAll = async () => {
    if (images.length === 0) return;
    try {
      const zip = new JSZip();
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const base64 = await FileSystem.readAsStringAsync(img.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        zip.file(`page-${i + 1}.jpg`, base64, { base64: true });
      }
      const zipBytes = await zip.generateAsync({ type: 'uint8array' });
      const zipPath = `${FileSystem.cacheDirectory}kitbase-pdf-images-${Date.now()}.zip`;
      const zipBase64 = uint8ArrayToBase64(zipBytes);
      await FileSystem.writeAsStringAsync(zipPath, zipBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setResultUri(zipPath);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(zipPath, {
        mimeType: 'application/zip',
        dialogTitle: 'Save page images (ZIP)',
      });
    } catch (e) {
      setError(e.message ?? 'Share failed');
    }
  };

  const shareSingle = async (uri, index) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: `Save page ${index + 1}`,
      });
    } catch (e) {
      setError(e.message ?? 'Share failed');
    }
  };

  const thumbWidth = (SCREEN_WIDTH - 60) / 2;

  return (
    <View style={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom) }]}>
      <ThemedText style={styles.description}>
        Convert each PDF page into a high-quality image. Select a PDF, then tap Convert.
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

      <Pressable
        onPress={convert}
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
            <KitbaseIcon name="Image" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Convert to Images
            </ThemedText>
          </>
        )}
      </Pressable>

      {error ? (
        <ThemedView style={[styles.messageBox, styles.errorBox]}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : null}

      {images.length > 0 && (
        <>
          <View style={styles.resultHeader}>
            <ThemedText type="defaultSemiBold">
              {images.length} page{images.length !== 1 ? 's' : ''} converted
            </ThemedText>
            <Pressable
              onPress={shareAll}
              style={({ pressed }) => [
                styles.shareAllBtn,
                { backgroundColor: tint },
                pressed && { opacity: 0.9 },
              ]}
            >
              <KitbaseIcon name="Share" size={16} color="#fff" />
              <ThemedText style={styles.shareAllText}>Download ZIP</ThemedText>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {images.map((img, idx) => (
              <Pressable
                key={idx}
                onPress={() => shareSingle(img.uri, idx)}
                style={[styles.thumbCard, { backgroundColor: cardBg, borderColor: cardBorder, width: thumbWidth }]}
              >
                <Image
                  source={{ uri: img.uri }}
                  style={[styles.thumbImage, { width: thumbWidth - 2, height: (thumbWidth - 2) * 1.4 }]}
                  contentFit="contain"
                />
                <View style={styles.thumbFooter}>
                  <ThemedText style={styles.thumbLabel}>Page {idx + 1}</ThemedText>
                  <KitbaseIcon name="Share" size={14} color={tint} />
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  shareAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  shareAllText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  thumbCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbImage: {
    backgroundColor: '#f1f5f9',
  },
  thumbFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  thumbLabel: { fontSize: 13 },
});
