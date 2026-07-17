import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/lib/theme';

// Centered spinner for async screen states.
export default function Loader({ className }) {
  return (
    <View className={`items-center justify-center py-20 ${className ?? ''}`}>
      <ActivityIndicator size="large" color={COLORS.brand[700]} />
    </View>
  );
}
