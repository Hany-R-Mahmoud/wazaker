import { StyleSheet } from 'react-native';

import { recitationTheme } from '../../../shared/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: recitationTheme.colors.background,
  },
  container: {
    padding: recitationTheme.spacing.xl,
    gap: recitationTheme.spacing.lg,
  },
  hero: {
    backgroundColor: recitationTheme.colors.ink,
    borderRadius: recitationTheme.radius.xl,
    padding: recitationTheme.spacing.xl,
    gap: recitationTheme.spacing.sm,
  },
  kicker: {
    color: recitationTheme.colors.brandSoft,
    fontSize: recitationTheme.typography.kicker,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroArabic: {
    color: recitationTheme.colors.surface,
    fontSize: recitationTheme.typography.heroArabic,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroEnglish: {
    color: recitationTheme.colors.surface,
    fontSize: recitationTheme.typography.heroEnglish,
    fontWeight: '600',
  },
  heroBodyArabic: {
    color: recitationTheme.colors.brandSoft,
    fontSize: recitationTheme.typography.bodyLarge,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroBodyEnglish: {
    color: recitationTheme.colors.brandSoft,
    fontSize: recitationTheme.typography.body,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: recitationTheme.colors.surface,
    borderRadius: recitationTheme.radius.md,
    padding: recitationTheme.spacing.lg,
    borderWidth: 1,
    borderColor: recitationTheme.colors.line,
    gap: recitationTheme.spacing.md,
  },
  labelArabic: {
    color: recitationTheme.colors.brand,
    fontSize: recitationTheme.typography.sectionArabic,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  labelEnglish: {
    color: recitationTheme.colors.brand,
    fontSize: recitationTheme.typography.meta,
    fontWeight: '600',
  },
  bodyArabic: {
    color: recitationTheme.colors.ink,
    fontSize: recitationTheme.typography.bodyLarge,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bodyEnglish: {
    color: recitationTheme.colors.muted,
    fontSize: recitationTheme.typography.body,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: recitationTheme.radius.sm,
    paddingHorizontal: recitationTheme.spacing.md,
    paddingVertical: recitationTheme.spacing.sm,
    backgroundColor: recitationTheme.colors.brandSoft,
  },
  statusBadgeText: {
    color: recitationTheme.colors.ink,
    fontSize: recitationTheme.typography.label,
    fontWeight: '600',
  },
  controls: {
    gap: recitationTheme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: recitationTheme.spacing.sm,
    flexWrap: 'wrap',
  },
  button: {
    minWidth: 148,
    borderRadius: recitationTheme.radius.sm,
    paddingHorizontal: recitationTheme.spacing.lg,
    paddingVertical: recitationTheme.spacing.md,
    borderWidth: 1,
    borderColor: recitationTheme.colors.brand,
    backgroundColor: recitationTheme.colors.surface,
  },
  buttonPrimary: {
    backgroundColor: recitationTheme.colors.brand,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: recitationTheme.colors.brand,
    fontSize: recitationTheme.typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextPrimary: {
    color: recitationTheme.colors.surface,
  },
  noticeCard: {
    backgroundColor: recitationTheme.colors.brandSoft,
    borderRadius: recitationTheme.radius.sm,
    padding: recitationTheme.spacing.lg,
    gap: recitationTheme.spacing.sm,
  },
});
