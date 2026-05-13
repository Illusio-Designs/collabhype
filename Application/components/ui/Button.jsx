import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { COLORS } from '@/lib/theme';

// Pressable button with brand variants + sizes. Mirrors the web Button API
// so screens read consistently across platforms.

const VARIANTS = {
  primary: {
    bg: 'bg-brand-700 active:bg-brand-800',
    text: 'text-white',
    spinner: '#ffffff',
  },
  secondary: {
    bg: 'bg-zinc-900 active:bg-zinc-800',
    text: 'text-white',
    spinner: '#ffffff',
  },
  outline: {
    bg: 'bg-white border border-zinc-300 active:bg-zinc-50',
    text: 'text-zinc-900',
    spinner: COLORS.brand[700],
  },
  ghost: {
    bg: 'bg-transparent active:bg-zinc-100',
    text: 'text-zinc-700',
    spinner: COLORS.zinc[700],
  },
  danger: {
    bg: 'bg-red-600 active:bg-red-700',
    text: 'text-white',
    spinner: '#ffffff',
  },
};

const SIZES = {
  sm: { box: 'px-3 py-1.5', text: 'text-xs' },
  md: { box: 'px-4 py-2.5', text: 'text-sm' },
  lg: { box: 'px-5 py-3', text: 'text-base' },
};

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size] ?? SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center rounded-xl',
        s.box,
        v.bg,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.spinner} />
      ) : (
        <Text className={`font-semibold ${s.text} ${v.text}`}>{children}</Text>
      )}
    </Pressable>
  );
}
