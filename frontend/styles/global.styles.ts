import { StyleSheet } from 'react-native';

// Colores comunes de la aplicación
export const colors = {
  primary: '#16a34a',
  primaryLight: '#34d399',
  background: '#f9fafb',
  white: '#ffffff',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  border: '#d1d5db',
  shadow: '#000000',
};

// Tamaños de fuente comunes
export const fontSizes = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  xxxlarge: 30,
};

// Espaciado común
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
  xxxxl: 60,
};

// Bordes y radios comunes
export const borders = {
  radius: 8,
  radiusLarge: 12,
  radiusXLarge: 16,
  radiusRound: 50,
  width: 1,
};

// Estilos globales que se pueden reutilizar
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: borders.width,
    borderColor: colors.border,
    borderRadius: borders.radius,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSizes.medium,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borders.radius,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.large,
    fontWeight: '600',
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  // Estilos para mostrar moneda (peso)
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 4,
  },
  currencyAmount: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  currencyLarge: {
    fontSize: fontSizes.xxlarge,
  },
  currencySmall: {
    fontSize: fontSizes.small,
  },
  shadowSmall: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shadowMedium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowLarge: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
