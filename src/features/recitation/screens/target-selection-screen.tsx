import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { recitationFixtureTargets } from '../../../test/fixtures/recitation-analysis';
import { useRecitationSession } from '../hooks/use-recitation-session';
import { recitationTheme } from '../../../shared/theme/recitation-theme';

interface TargetSelectionScreenProps {
  onContinue?: () => void;
}

export function TargetSelectionScreen({ onContinue }: TargetSelectionScreenProps) {
  const { currentTarget, selectTarget, sessionHistoryState } = useRecitationSession();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>selected passage flow</Text>
          <Text style={styles.titleArabic}>اختر مقطع المراجعة</Text>
          <Text style={styles.titleEnglish}>Choose the revision target</Text>
          <Text style={styles.bodyArabic}>
            هذا هو أول مسار حقيقي في التطبيق: اختيار المقطع قبل التسجيل مع إبقاء الجلسات السابقة
            ظاهرة وآمنة.
          </Text>
          <Text style={styles.bodyEnglish}>
            This is the first real app flow: choose the target before recording while keeping prior
            sessions visible and safe.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionArabic}>المقاطع المقترحة</Text>
          <Text style={styles.sectionEnglish}>Suggested targets</Text>
          {recitationFixtureTargets.map((target) => {
            const isSelected = target.id === currentTarget.id;

            return (
              <Pressable
                key={target.id}
                accessibilityRole="button"
                onPress={() => selectTarget(target)}
                style={[styles.targetCard, isSelected && styles.targetCardSelected]}
              >
                <Text style={styles.targetArabic}>{target.displayNameAr}</Text>
                <Text style={styles.targetEnglish}>{target.displayNameEn}</Text>
                <Text style={styles.targetMeta}>{target.canonicalReference}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionArabic}>الجلسات المحلية</Text>
          <Text style={styles.sectionEnglish}>Local session history</Text>
          <Text style={styles.bodyArabic}>
            {sessionHistoryState.phase === 'error'
              ? 'تعذر تحميل السجل المحلي بالكامل، لكن آخر بيانات متاحة ما زالت معروضة.'
              : 'يظهر هنا آخر ما تم حفظه محليًا حتى يبقى التكرار السريع ممكنًا.'}
          </Text>
          <Text style={styles.bodyEnglish}>
            {sessionHistoryState.phase === 'error'
              ? 'Local history could not be fully loaded, but the latest available data is still shown.'
              : 'The latest saved local sessions stay visible here so fast retry remains possible.'}
          </Text>

          {(sessionHistoryState.data ?? []).map((session) => (
            <View key={session.id} style={styles.historyCard}>
              <Text style={styles.targetArabic}>{session.targetPassage.displayNameAr}</Text>
              <Text style={styles.targetEnglish}>{session.targetPassage.displayNameEn}</Text>
              <Text style={styles.targetMeta}>{session.attempt.status}</Text>
            </View>
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={onContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue to recording</Text>
          <Text style={styles.primaryButtonText}>المتابعة إلى التسجيل</Text>
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
