import { View } from 'react-native';

export default function Card({ children, className = '' }) {
  return (
    <View
      className={`rounded-2xl border border-zinc-200 bg-white p-4 ${className}`}
    >
      {children}
    </View>
  );
}
