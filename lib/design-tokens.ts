/**
 * Design Tokens - Ledgr Design System
 * Single source of truth for colors, spacing, typography
 */

export const colors = {
  // Background
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceHover: '#252525',
  surfaceElevated: '#2A2A2A',

  // Borders
  border: '#2A2A2A',
  borderHover: '#3A3A3A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#6B6B6B',

  // Brand & Actions
  emerald: '#10B981',
  emeraldHover: '#059669',
  emeraldLight: '#10B98120',

  // Status
  urgent: '#EF4444',
  urgentLight: '#EF444420',
  warning: '#F59E0B',
  warningLight: '#F59E0B20',
  info: '#3B82F6',
  infoLight: '#3B82F620',

  // Transparency
  overlay: '#00000080',
  scrim: '#000000CC',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "SF Mono", Monaco, monospace',
  },

  fontSize: {
    display: '24px',
    heading: '16px',
    body: '14px',
    caption: '12px',
    mono: '13px',
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
} as const

export const transitions = {
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const breakpoints = {
  mobile: 390,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const

export const layout = {
  headerHeight: 56,
  bottomNavHeight: 60,
  sidebarWidth: 200,
  inboxWidth: 360,
  maxContentWidth: 1600,
} as const
