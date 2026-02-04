/**
 * Premium Design System - CineVerse
 * Professional-grade design tokens for overkill polish
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════

export const Colors = {
    // Core brand colors
    primary: {
        50: '#ecfeff',
        100: '#cffafe',
        200: '#a5f3fc',
        300: '#67e8f9',
        400: '#22d3ee',
        500: '#06b6d4',
        600: '#0891b2',
        700: '#0e7490',
        800: '#155e75',
        900: '#164e63',
    },

    // Accent colors for variety
    accent: {
        rose: '#fb7185',
        violet: '#a78bfa',
        amber: '#fbbf24',
        emerald: '#4ade80',
        orange: '#fb923c',
    },

    // Surface and background
    background: {
        primary: '#050810',
        secondary: '#0c1929',
        tertiary: '#071318',
        elevated: 'rgba(8, 145, 178, 0.08)',
    },

    // Glass effects
    glass: {
        light: 'rgba(34, 211, 238, 0.05)',
        medium: 'rgba(34, 211, 238, 0.1)',
        strong: 'rgba(34, 211, 238, 0.15)',
        border: 'rgba(34, 211, 238, 0.2)',
        borderStrong: 'rgba(34, 211, 238, 0.3)',
    },

    // Text colors
    text: {
        primary: '#ecfeff',
        secondary: '#a5f3fc',
        tertiary: '#67e8f9',
        muted: 'rgba(103, 232, 249, 0.6)',
        dimmed: 'rgba(103, 232, 249, 0.4)',
    },

    // Rating star
    star: '#FACC15',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const AnimationConfig = {
    // Spring configurations for react-native-reanimated
    spring: {
        gentle: { damping: 20, stiffness: 90, mass: 1 },
        snappy: { damping: 15, stiffness: 150, mass: 0.8 },
        bouncy: { damping: 12, stiffness: 180, mass: 0.6 },
        smooth: { damping: 25, stiffness: 120, mass: 1 },
        liquid: { damping: 18, stiffness: 100, mass: 0.9 },
    },

    // Timing durations (ms)
    duration: {
        instant: 100,
        fast: 200,
        normal: 300,
        slow: 500,
        verySlow: 800,
        shimmer: 1500,
        pulse: 2000,
    },

    // Stagger delays for list animations (ms)
    stagger: {
        fast: 30,
        normal: 50,
        slow: 80,
    },

    // Scale values
    scale: {
        pressed: 0.97,
        subtle: 0.98,
        grow: 1.02,
        bounce: 1.05,
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SHADOW PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const Shadows = {
    glow: {
        cyan: {
            shadowColor: '#22d3ee',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
        rose: {
            shadowColor: '#fb7185',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
        },
        violet: {
            shadowColor: '#a78bfa',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
    },

    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },

    elevated: {
        shadowColor: '#0891b2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SPACING & SIZING
// ═══════════════════════════════════════════════════════════════════════════

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
} as const;

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// GRADIENT PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const Gradients = {
    // Primary button gradient
    primaryButton: ['#0891b2', '#0e7490'] as const,

    // Hero overlay
    heroOverlay: ['rgba(8, 145, 178, 0.1)', 'rgba(5, 8, 16, 0.4)', '#050810'] as const,

    // Card overlay
    cardOverlay: ['transparent', 'rgba(5, 8, 16, 0.3)', 'rgba(5, 8, 16, 0.7)'] as const,

    // Tab indicator gradients by tab
    tabIndicator: {
        home: ['rgba(34, 211, 238, 0.4)', 'rgba(8, 145, 178, 0.2)'] as const,
        search: ['rgba(167, 139, 250, 0.4)', 'rgba(139, 92, 246, 0.2)'] as const,
        saved: ['rgba(251, 113, 133, 0.4)', 'rgba(244, 63, 94, 0.2)'] as const,
        profile: ['rgba(74, 222, 128, 0.4)', 'rgba(34, 197, 94, 0.2)'] as const,
    },

    // Shimmer gradient
    shimmer: ['transparent', 'rgba(255, 255, 255, 0.08)', 'transparent'] as const,

    // Premium badge
    premium: ['#4ade80', '#22c55e'] as const,

    // Rose/heart gradient
    rose: ['#f43f5e', '#e11d48'] as const,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BLUR INTENSITIES
// ═══════════════════════════════════════════════════════════════════════════

export const BlurIntensity = {
    subtle: 20,
    medium: 30,
    strong: 40,
    heavy: 80,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// GENRE ACCENTS
// ═══════════════════════════════════════════════════════════════════════════

export const GenreAccents: Record<number, { color: string; bgColor: string; icon: string }> = {
    28: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', icon: 'flame' },      // Action
    12: { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)', icon: 'compass' },   // Adventure
    27: { color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.15)', icon: 'skull' },     // Horror
    10752: { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)', icon: 'shield' }, // War
    35: { color: '#facc15', bgColor: 'rgba(250, 204, 21, 0.15)', icon: 'happy' },     // Comedy
    18: { color: '#fb7185', bgColor: 'rgba(251, 113, 133, 0.15)', icon: 'heart' },    // Drama
    878: { color: '#22d3ee', bgColor: 'rgba(34, 211, 238, 0.15)', icon: 'rocket' },   // Sci-Fi
    53: { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)', icon: 'alert' },     // Thriller
};
