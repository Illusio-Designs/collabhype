// SVG wordmarks that mimic real Indian D2C brand logos until proper
// SVG/PNG assets are dropped into /public/brands/.
//
// Each component is a fixed-height inline SVG so the marquee row stays
// uniform. Replace any of these with `<img src="/brands/<brand>.svg" />`
// once real logo files are available.

const FONT = 'Inter, system-ui, sans-serif';

function Wordmark({ children, width = 200, weight = 800, family = FONT, letterSpacing = 0, italic = false, color = '#71717a' }) {
  return (
    <svg viewBox={`0 0 ${width} 50`} height="32" className="h-7 sm:h-8" aria-hidden>
      <text
        x="0"
        y="36"
        fontFamily={family}
        fontSize="36"
        fontWeight={weight}
        fontStyle={italic ? 'italic' : 'normal'}
        letterSpacing={letterSpacing}
        fill={color}
      >
        {children}
      </text>
    </svg>
  );
}

export const MamaearthLogo = () => (
  <Wordmark width={210} weight={800} letterSpacing={-1.5}>
    mamaearth
  </Wordmark>
);

export const BoatLogo = () => (
  <Wordmark width={90} weight={900} letterSpacing={-2}>
    boAt
  </Wordmark>
);

export const PlumLogo = () => (
  <Wordmark width={90} weight={700} italic letterSpacing={-1}>
    Plum
  </Wordmark>
);

export const SugarLogo = () => (
  <Wordmark width={170} weight={900} letterSpacing={8}>
    SUGAR
  </Wordmark>
);

export const WakefitLogo = () => (
  <Wordmark width={140} weight={700} letterSpacing={-0.5}>
    Wakefit
  </Wordmark>
);

export const LenskartLogo = () => (
  <Wordmark width={160} weight={800} letterSpacing={-1}>
    Lenskart
  </Wordmark>
);

export const WowSkinLogo = () => (
  <Wordmark width={180} weight={900} letterSpacing={3}>
    WOW SKIN
  </Wordmark>
);

export const BeardoLogo = () => (
  <Wordmark width={130} weight={800} italic letterSpacing={-0.5}>
    Beardo
  </Wordmark>
);

export const MokobaraLogo = () => (
  <Wordmark width={180} weight={600} letterSpacing={4}>
    MOKOBARA
  </Wordmark>
);

export const CultFitLogo = () => (
  <Wordmark width={110} weight={900} letterSpacing={-2}>
    cult.fit
  </Wordmark>
);

export const SleepyOwlLogo = () => (
  <Wordmark width={160} weight={700} letterSpacing={-0.5}>
    Sleepy Owl
  </Wordmark>
);

export const WholeTruthLogo = () => (
  <Wordmark width={210} weight={600} letterSpacing={-0.3}>
    The Whole Truth
  </Wordmark>
);

export const ALL_LOGOS = [
  { key: 'mamaearth', Logo: MamaearthLogo },
  { key: 'boat', Logo: BoatLogo },
  { key: 'plum', Logo: PlumLogo },
  { key: 'sugar', Logo: SugarLogo },
  { key: 'wakefit', Logo: WakefitLogo },
  { key: 'lenskart', Logo: LenskartLogo },
  { key: 'wow', Logo: WowSkinLogo },
  { key: 'beardo', Logo: BeardoLogo },
  { key: 'mokobara', Logo: MokobaraLogo },
  { key: 'cultfit', Logo: CultFitLogo },
  { key: 'sleepyowl', Logo: SleepyOwlLogo },
  { key: 'wholetruth', Logo: WholeTruthLogo },
];
