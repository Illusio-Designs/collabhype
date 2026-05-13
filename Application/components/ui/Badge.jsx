import { Text, View } from 'react-native';

const VARIANTS = {
  default: 'bg-zinc-100',
  brand: 'bg-brand-50',
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  danger: 'bg-red-100',
  info: 'bg-sky-100',
};

const TEXT = {
  default: 'text-zinc-700',
  brand: 'text-brand-700',
  success: 'text-green-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  info: 'text-sky-700',
};

export default function Badge({ children, variant = 'default' }) {
  return (
    <View className={`self-start rounded-full px-2 py-0.5 ${VARIANTS[variant]}`}>
      <Text className={`text-[11px] font-semibold ${TEXT[variant]}`}>{children}</Text>
    </View>
  );
}
