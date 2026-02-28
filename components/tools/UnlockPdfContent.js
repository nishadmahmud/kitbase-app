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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { KitbaseIcon } from '@/components/kitbase-icon';
import { useThemeColor } from '@/hooks/use-theme-color';
import { unlockPdfUri } from '@/lib/pdf/unlock';
import { uint8ArrayToBase64 } from '@/lib/utils/file';

const PDF_MIME = 'application/pdf';

export default function UnlockPdfContent() {
  const insets = useSafeAreaInsets();
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
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

  const unlock = async () => {
    if (!file) {
      setError('Select a PDF first.');
      return;
    }
    if (!password.trim()) {
      setError('Enter the PDF password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bytes = await unlockPdfUri(file.uri, password.trim());
      const filename = `kitbase-unlocked-${Date.now()}.pdf`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      const base64 = uint8ArrayToBase64(bytes);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setResultUri(path);
    } catch (e) {
      setError(e.message ?? 'Unlock failed. Wrong password?');
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
        dialogTitle: 'Save unlocked PDF',
      });
    } catch (e) {
      setError(e.message ?? 'Share failed');
    }
  };

  return (
    <View style={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom) }]}>
      <ThemedText style={styles.description}>
        Remove password protection from a PDF. Enter the current password to unlock.
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

      <ThemedText style={styles.label}>Password</ThemedText>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter PDF password"
        secureTextEntry
        style={[styles.input, { backgroundColor: cardBg, borderColor: cardBorder, color: textColor }]}
        placeholderTextColor="#888"
      />

      <Pressable
        onPress={unlock}
        disabled={!file || !password.trim() || loading}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: tint },
          (!file || !password.trim() || loading) && styles.actionButtonDisabled,
          pressed && file && password.trim() && !loading && styles.actionButtonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <KitbaseIcon name="Unlock" size={20} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              Unlock & Share
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
            PDF unlocked!
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
  label: { fontSize: 14, marginBottom: 8 },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
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
