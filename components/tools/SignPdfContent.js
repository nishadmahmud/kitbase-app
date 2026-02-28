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
import { signPdfUri } from '@/lib/pdf/sign';
import { uint8ArrayToBase64 } from '@/lib/utils/file';

const PDF_MIME = 'application/pdf';
const IMAGE_MIME = ['image/png', 'image/jpeg', 'image/jpg'];

export default function SignPdfContent() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');

  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUri, setResultUri] = useState(null);
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

  const pickSignature = async () => {
    setError(null);
    setResultUri(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: IMAGE_MIME,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setSignature({
        uri: asset.uri,
        name: asset.name ?? 'signature.png',
      });
    } catch (e) {
      setError(e.message ?? 'Could not pick signature image');
    }
  };

  const applySignature = async () => {
    if (!file) {
      setError('Select a PDF first.');
      return;
    }
    if (!signature) {
      setError('Select a signature image.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bytes = await signPdfUri(file.uri, signature.uri, {
        position: 'bottom-right',
        scale: 0.5,
        margin: 24,
      });
      const filename = `kitbase-signed-${Date.now()}.pdf`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      const base64 = uint8ArrayToBase64(bytes);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setResultUri(path);
    } catch (e) {
      setError(e.message ?? 'Failed to sign PDF');
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
        dialogTitle: 'Save signed PDF',
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
        Apply a signature image to each page of your PDF. The signature will be placed in the bottom-right corner.
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
        <ThemedText
          type="defaultSemiBold"
          style={[styles.pickButtonText, { color: tint }]}
        >
          {file ? file.name : 'Select PDF'}
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={pickSignature}
        style={({ pressed }) => [
          styles.pickButton,
          { backgroundColor: cardBg, borderColor: cardBorder },
          pressed && styles.pickButtonPressed,
        ]}
      >
        <KitbaseIcon name="PenTool" size={22} color={tint} />
        <ThemedText
          type="defaultSemiBold"
          style={[styles.pickButtonText, { color: tint }]}
        >
          {signature ? signature.name : 'Select signature image (PNG/JPG)'}
        </ThemedText>
      </Pressable>

      <ThemedText style={styles.hint}>
        Tip: Use a transparent PNG of your handwritten signature for best results.
      </ThemedText>

      <Pressable
        onPress={applySignature}
        disabled={!file || !signature || loading}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: tint },
          (!file || !signature || loading) && styles.actionButtonDisabled,
          pressed && file && signature && !loading && styles.actionButtonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <KitbaseIcon name="PenTool" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Apply signature
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
        <ThemedView
          style={[styles.messageBox, styles.successBox, { borderColor: cardBorder }]}
        >
          <ThemedText type="defaultSemiBold" style={styles.successText}>
            PDF signed!
          </ThemedText>
          <Pressable
            onPress={shareResult}
            style={({ pressed }) => [
              styles.shareButton,
              { backgroundColor: tint },
              pressed && styles.shareButtonPressed,
            ]}
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
    marginBottom: 12,
  },
  pickButtonPressed: {
    opacity: 0.8,
  },
  pickButtonText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 16,
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
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonPressed: {
    opacity: 0.9,
  },
  actionButtonText: {
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

