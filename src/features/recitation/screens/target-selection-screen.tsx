import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { recitationFixtureTargets } from '../models/recitation-fixtures';
import { useRecitationSession } from '../hooks/use-recitation-session';
import { recitationTheme } from '../../../shared/theme/recitation-theme';
import { targetSelectionScreenCopy } from '../../../shared/i18n/target-selection-screen-copy';

interface TargetSelectionScreenProps {
  onContinue?: () => void;
}

export function TargetSelectionScreen({ onContinue }: TargetSelectionScreenProps) {
  const { currentTarget, selectTarget, sessionHistoryState } = useRecitationSession();

  const handleContinue = (): void => {
    onContinue?.();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>{targetSelectionScreenCopy.hero.kicker}</Text>
          <Text style={styles.titleArabic}>{targetSelectionScreenCopy.hero.title.ar}</Text>
          <Text style={styles.titleEnglish}>{targetSelectionScreenCopy.hero.title.en}</Text>
          <Text style={styles.bodyArabic}>{targetSelectionScreenCopy.hero.body.ar}</Text>
          <Text style={styles.bodyEnglish}>{targetSelectionScreenCopy.hero.body.en}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionArabic}>{targetSelectionScreenCopy.suggestedTargets.label.ar}</Text>
          <Text style={styles.sectionEnglish}>{targetSelectionScreenCopy.suggestedTargets.label.en}</Text>
          <View accessibilityRole="radiogroup">
          {recitationFixtureTargets.map((target) => {
            const isSelected = target.id === currentTarget.id;
            const handleTargetSelection = (): void => {
              selectTarget(target);
            };

            return (
              <Pressable
                key={target.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={handleTargetSelection}
                style={[styles.targetCard, isSelected && styles.targetCardSelected]}
              >
                <Text style={styles.targetArabic}>{target.displayNameAr}</Text>
                <Text style={styles.targetEnglish}>{target.displayNameEn}</Text>
                <Text style={styles.targetMeta}>{target.canonicalReference}</Text>
              </Pressable>
            );
          })}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionArabic}>{targetSelectionScreenCopy.sessionHistory.label.ar}</Text>
          <Text style={styles.sectionEnglish}>{targetSelectionScreenCopy.sessionHistory.label.en}</Text>
          <Text style={styles.bodyArabic}>
            {sessionHistoryState.phase === 'error'
              ? targetSelectionScreenCopy.sessionHistory.degraded.ar
              : targetSelectionScreenCopy.sessionHistory.ready.ar}
          </Text>
          <Text style={styles.bodyEnglish}>
            {sessionHistoryState.phase === 'error'
              ? targetSelectionScreenCopy.sessionHistory.degraded.en
              : targetSelectionScreenCopy.sessionHistory.ready.en}
          </Text>

          {(sessionHistoryState.data ?? []).map((session) => (
            <View key={session.id} style={styles.historyCard}>
              <Text style={styles.targetArabic}>{session.targetPassage.displayNameAr}</Text>
              <Text style={styles.targetEnglish}>{session.targetPassage.displayNameEn}</Text>
              <Text style={styles.targetMeta}>{session.attempt.status}</Text>
            </View>
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={handleContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{targetSelectionScreenCopy.continueCta.en}</Text>
          <Text style={styles.primaryButtonText}>{targetSelectionScreenCopy.continueCta.ar}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: recitationTheme.colors.background,
  },
  container: {
    gap: recitationTheme.spacing.lg,
    padding: recitationTheme.spacing.lg,
  },
  hero: {
    backgroundColor: recitationTheme.colors.surface,
    borderRadius: recitationTheme.radius.xl,
    gap: recitationTheme.spacing.sm,
    padding: recitationTheme.spacing.lg,
  },
  kicker: {
    color: recitationTheme.colors.brand,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  titleArabic: {
    color: recitationTheme.colors.ink,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'right',
  },
  titleEnglish: {
    color: recitationTheme.colors.ink,
    fontSize: 20,
    fontWeight: '600',
  },
  bodyArabic: {
    color: recitationTheme.colors.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
  },
  bodyEnglish: {
    color: recitationTheme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: recitationTheme.colors.surface,
    borderRadius: recitationTheme.radius.xl,
    gap: recitationTheme.spacing.sm,
    padding: recitationTheme.spacing.lg,
  },
  sectionArabic: {
    color: recitationTheme.colors.ink,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  sectionEnglish: {
    color: recitationTheme.colors.brand,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  targetCard: {
    backgroundColor: recitationTheme.colors.background,
    borderColor: recitationTheme.colors.line,
    borderRadius: recitationTheme.radius.lg,
    borderWidth: 1,
    gap: recitationTheme.spacing.xs,
    padding: recitationTheme.spacing.md,
  },
  targetCardSelected: {
    borderColor: recitationTheme.colors.brand,
    borderWidth: 2,
  },
  targetArabic: {
    color: recitationTheme.colors.ink,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  targetEnglish: {
    color: recitationTheme.colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  targetMeta: {
    color: recitationTheme.colors.muted,
    fontSize: 13,
  },
  historyCard: {
    backgroundColor: recitationTheme.colors.background,
    borderRadius: recitationTheme.radius.lg,
    gap: recitationTheme.spacing.xs,
    padding: recitationTheme.spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: recitationTheme.colors.brand,
    borderRadius: recitationTheme.radius.xl,
    gap: 4,
    paddingHorizontal: recitationTheme.spacing.lg,
    paddingVertical: recitationTheme.spacing.md,
  },
  primaryButtonText: {
    color: recitationTheme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
