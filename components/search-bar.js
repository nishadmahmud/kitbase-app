import { StyleSheet, View, TextInput } from 'react-native';

import { KitbaseIcon } from '@/components/kitbase-icon';
import { useThemeColor } from '@/hooks/use-theme-color';

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search tools…',
  editable = true,
  onFocus,
}) {
  const cardBg = useThemeColor({}, 'card');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.wrap, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <KitbaseIcon name="Search" size={20} color={iconColor} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={iconColor}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        onFocus={onFocus}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  icon: {
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
});
