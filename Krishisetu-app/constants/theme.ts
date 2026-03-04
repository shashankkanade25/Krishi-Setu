// KrishiSetu App – Color & spacing constants
export const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#C8E6C9',
  accent: '#FF9800',
  background: '#f5f5dc',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  border: '#E0E0E0',
  error: '#E53935',
  success: '#43A047',
  warning: '#FB8C00',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  card: '#FFFFFF',
  inputBg: '#FAFAFA',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  radius: 12,
  radiusSm: 8,
  radiusLg: 20,
};

export const FONTS = {
  regular: { fontSize: 14, color: COLORS.text },
  medium: { fontSize: 16, fontWeight: '500' as const, color: COLORS.text },
  bold: { fontSize: 16, fontWeight: '700' as const, color: COLORS.text },
  h1: { fontSize: 28, fontWeight: '700' as const, color: COLORS.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};
