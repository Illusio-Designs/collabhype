import { Text, View } from 'react-native';

// Big "Collabhype" wordmark — mobile take on the web Footer watermark. The
// web uses a CSS gradient mask to fade the bottom into the page; on RN we
// approximate it with a soft brand-tinted text at a large size, no mask
// dependency needed.
//
// The container is `pointerEvents=none` so it never blocks taps.

export default function BrandWatermark({ size = 'lg' }) {
  const fontSize = size === 'lg' ? 88 : 56;
  return (
    <View pointerEvents="none" className="items-center overflow-hidden py-3">
      <Text
        className="font-black tracking-tighter text-brand-100"
        style={{ fontSize, lineHeight: fontSize, letterSpacing: -3 }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        Collabhype
      </Text>
    </View>
  );
}
