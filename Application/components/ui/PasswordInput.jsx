import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS } from '@/lib/theme';

// Same shape as Input but with a built-in eye toggle to show/hide the value.

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoCapitalize = 'none',
  className = '',
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-zinc-700">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.zinc[400]}
          secureTextEntry={!visible}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          className={`rounded-xl border bg-white px-3 py-3 pr-11 text-base text-zinc-900 ${
            error ? 'border-red-400' : 'border-zinc-300'
          } ${className}`}
          {...rest}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          className="absolute right-1 top-1 h-11 w-10 items-center justify-center rounded-lg active:bg-zinc-100"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={6}
        >
          {visible ? (
            <EyeOff size={18} color={COLORS.zinc[500]} />
          ) : (
            <Eye size={18} color={COLORS.zinc[500]} />
          )}
        </Pressable>
      </View>
      {error && <Text className="mt-1 text-xs text-red-600">{error}</Text>}
    </View>
  );
}
