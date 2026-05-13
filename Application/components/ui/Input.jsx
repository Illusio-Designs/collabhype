import { TextInput, View, Text } from 'react-native';
import { COLORS } from '@/lib/theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  error,
  className = '',
}) {
  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-zinc-700">{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.zinc[400]}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className={`rounded-xl border bg-white px-3 py-3 text-base text-zinc-900 ${
          error ? 'border-red-400' : 'border-zinc-300'
        } ${className}`}
      />
      {error && <Text className="mt-1 text-xs text-red-600">{error}</Text>}
    </View>
  );
}
