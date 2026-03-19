export const recitationTheme = {
  colors: {
    background: '#F7F1E8',
    surface: '#FFFDFC',
    ink: '#1E1A16',
    muted: '#71675D',
    brand: '#7A5C46',
    brandSoft: '#E7D6C5',
    accent: '#CDA15A',
    line: '#E8DED1',
    success: '#2D6A4F',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
  },
  radius: {
    sm: 20,
    md: 22,
    lg: 24,
    xl: 28,
  },
  typography: {
    heroArabic: 30,
    sectionArabic: 20,
    body: 15,
    meta: 14,
    label: 13,
  },
} as const;

export type RecitationTheme = typeof recitationTheme;
