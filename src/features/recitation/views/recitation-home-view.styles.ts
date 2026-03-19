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
    backgroundColor: recitationTheme.colors.brand,
    borderRadius: recitationTheme.radius.xl,
    padding: recitationTheme.spacing.xl,
    gap: recitationTheme.spacing.sm,
  },
  kicker: {
    color: recitationTheme.colors.brandSoft,
    fontSize: 14,
    letterSpacing: 1.5,
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
    fontSize: 18,
    fontWeight: '600',
  },
  heroArabicBody: {
    color: recitationTheme.colors.brandSoft,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroEnglishBody: {
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
  section: {
    gap: recitationTheme.spacing.md,
  },
  bilingualBlock: {
    gap: recitationTheme.spacing.xs,
  },
  arabicText: {
    color: recitationTheme.colors.ink,
    fontSize: recitationTheme.typography.sectionArabic,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  englishText: {
    color: recitationTheme.colors.ink,
    fontSize: recitationTheme.typography.meta,
    lineHeight: 20,
  },
  mutedText: {
    color: recitationTheme.colors.muted,
  },
  brandText: {
    color: recitationTheme.colors.brand,
  },
  actionCard: {
    backgroundColor: recitationTheme.colors.surface,
    borderRadius: recitationTheme.radius.md,
    padding: recitationTheme.spacing.lg,
    borderWidth: 1,
    borderColor: recitationTheme.colors.line,
    gap: recitationTheme.spacing.sm,
  },
  feedbackCard: {
    backgroundColor: recitationTheme.colors.brandSoft,
    borderRadius: recitationTheme.radius.sm,
    padding: 16,
    gap: recitationTheme.spacing.sm,
  },
  sessionCard: {
    backgroundColor: recitationTheme.colors.surface,
    borderRadius: recitationTheme.radius.md,
    padding: recitationTheme.spacing.lg,
    borderWidth: 1,
    borderColor: recitationTheme.colors.line,
    gap: recitationTheme.spacing.sm,
  },
  timeText: {
    color: recitationTheme.colors.muted,
    fontSize: recitationTheme.typography.label,
  },
  footer: {
    backgroundColor: recitationTheme.colors.ink,
    borderRadius: recitationTheme.radius.lg,
    padding: recitationTheme.spacing.xl,
    gap: recitationTheme.spacing.md,
  },
  footerCopyBlock: {
    gap: recitationTheme.spacing.xs,
  },
  footerTitleArabic: {
    color: recitationTheme.colors.surface,
    fontSize: recitationTheme.typography.sectionArabic,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  footerTitleEnglish: {
    color: recitationTheme.colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  footerBodyArabic: {
    color: recitationTheme.colors.brandSoft,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  footerBodyEnglish: {
    color: recitationTheme.colors.brandSoft,
    fontSize: recitationTheme.typography.meta,
    lineHeight: 21,
  },
});
