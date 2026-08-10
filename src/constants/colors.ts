// ─────────────────────────────────────────────────────────────────────────────
// AppColors — EACRMS Brand Color System  (Web / TypeScript)
//
// Mirrors the Flutter AppColors class used by the mobile team.
// Every color used in the app must be referenced from this file.
// Never hardcode hex values directly inside components or CSS-in-JS.
//
// Usage:
//   import { AppColors } from '@/constants/colors';
//   style={{ color: AppColors.primary }}
// ─────────────────────────────────────────────────────────────────────────────

export const AppColors = {
  // ── Brand / Primary ──────────────────────────────────────────────────────
  primary:      '#0140A7',
  primaryDark:  '#0A4870',
  primaryLight: '#DCEBF6',

  // ── Brand / Secondary ────────────────────────────────────────────────────
  secondary:      '#E6A500',
  secondaryDark:  '#C98F00',
  secondaryLight: '#FFF3CC',

  // ── Background ───────────────────────────────────────────────────────────
  backgroundDefault:        '#F7F8FA',
  backgroundSurface:        '#FFFFFF',
  backgroundSurfaceVariant: '#F1F3F5',

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary:     '#1D1D1F',
  textSecondary:   '#555B63',
  textTertiary:    '#8B9098',
  textOnPrimary:   '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // ── Border ───────────────────────────────────────────────────────────────
  borderDefault: '#D9DEE5',

  // ── Status ───────────────────────────────────────────────────────────────
  statusSuccess: '#2E7D32',
  statusWarning: '#F59E0B',
  statusError:   '#D32F2F',
  statusInfo:    '#0288D1',

  // ── Status Background (light tints for badge / chip backgrounds) ─────────
  statusSuccessBg: '#E8F5E9',
  statusWarningBg: '#FFF8E1',
  statusErrorBg:   '#FFEBEE',
  statusInfoBg:    '#E1F5FE',
} as const;

export type AppColorsType = typeof AppColors;

// ─────────────────────────────────────────────────────────────────────────────
// CSS Variable Mapping
// ─────────────────────────────────────────────────────────────────────────────
export const cssVarMap: Record<string, string> = {
  '--color-primary':               AppColors.primary,
  '--color-primary-dark':          AppColors.primaryDark,
  '--color-primary-light':         AppColors.primaryLight,
  '--color-secondary':             AppColors.secondary,
  '--color-secondary-dark':        AppColors.secondaryDark,
  '--color-secondary-light':       AppColors.secondaryLight,
  '--color-bg-default':            AppColors.backgroundDefault,
  '--color-bg-surface':            AppColors.backgroundSurface,
  '--color-bg-surface-variant':    AppColors.backgroundSurfaceVariant,
  '--color-text-primary':          AppColors.textPrimary,
  '--color-text-secondary':        AppColors.textSecondary,
  '--color-text-tertiary':         AppColors.textTertiary,
  '--color-text-on-primary':       AppColors.textOnPrimary,
  '--color-text-on-secondary':     AppColors.textOnSecondary,
  '--color-border-default':        AppColors.borderDefault,
  '--color-status-success':        AppColors.statusSuccess,
  '--color-status-warning':        AppColors.statusWarning,
  '--color-status-error':          AppColors.statusError,
  '--color-status-info':           AppColors.statusInfo,
  '--color-status-success-bg':     AppColors.statusSuccessBg,
  '--color-status-warning-bg':     AppColors.statusWarningBg,
  '--color-status-error-bg':       AppColors.statusErrorBg,
  '--color-status-info-bg':        AppColors.statusInfoBg,
};

export default AppColors;
