import { Pressable, View, Text } from 'react-native';

// Small RN-native switch — animated thumb that slides between two pill states.
// Wrap with a label row when used in forms.

export default function Switch({ value, onValueChange, label, description, disabled }) {
  const handleToggle = () => {
    if (disabled) return;
    onValueChange?.(!value);
  };

  return (
    <Pressable
      onPress={handleToggle}
      className="flex-row items-center justify-between gap-3 py-1"
      disabled={disabled}
    >
      {(label || description) && (
        <View className="flex-1">
          {label && (
            <Text className="text-sm font-medium text-zinc-800">{label}</Text>
          )}
          {description && (
            <Text className="mt-0.5 text-xs text-zinc-500">{description}</Text>
          )}
        </View>
      )}
      <View
        className={`h-7 w-12 rounded-full px-0.5 ${
          value ? 'bg-brand-700' : 'bg-zinc-200'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <View
          className={`mt-0.5 h-6 w-6 rounded-full bg-white shadow-sm ${
            value ? 'self-end' : 'self-start'
          }`}
        />
      </View>
    </Pressable>
  );
}
