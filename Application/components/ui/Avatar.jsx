import { Text, View } from 'react-native';

const SIZES = {
  sm: { box: 'h-8 w-8',  text: 'text-xs'  },
  md: { box: 'h-10 w-10', text: 'text-sm' },
  lg: { box: 'h-12 w-12', text: 'text-base' },
  xl: { box: 'h-16 w-16', text: 'text-lg' },
};

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ name, size = 'md' }) {
  const s = SIZES[size] ?? SIZES.md;
  return (
    <View
      className={`${s.box} items-center justify-center rounded-full bg-brand-100`}
    >
      <Text className={`${s.text} font-bold text-brand-700`}>
        {initials(name)}
      </Text>
    </View>
  );
}
