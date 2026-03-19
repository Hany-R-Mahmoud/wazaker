import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { recitationHomeCopy } from '../../../shared/i18n/recitation-home-copy';
import { type BilingualText } from '../../../shared/i18n/bilingual-copy';
import { recitationTheme } from '../../../shared/theme';

type BilingualTone = 'default' | 'muted' | 'brand';

type BilingualLineProps = {
  ar: string;
  en: string;
  tone?: BilingualTone;
};

type QuickAction = {
  title: BilingualText;
  detail: BilingualText;
};

type SessionCardData = {
  title: BilingualText;
  status: BilingualText;
  time: string;
};

type FeedbackItem = {
  label: BilingualText;
  value: BilingualText;
};

function BilingualLine({ ar, en, tone = 'default' }: BilingualLineProps) {
  return (
    <View style={styles.bilingualBlock}>
      <Text
        style={[
          styles.arabicText,
          tone === 'muted' && styles.mutedText,
          tone === 'brand' && styles.brandText,
        ]}
      >
        {ar}
      </Text>
      <Text
        style={[
          styles.englishText,
          tone === 'muted' && styles.mutedText,
          tone === 'brand' && styles.brandText,
        ]}
      >
        {en}
      </Text>
    </View>
  );
}

function ActionCard({ item }: { item: QuickAction }) {
  return (
    <Pressable style={styles.actionCard}>
      <BilingualLine ar={item.title.ar} en={item.title.en} tone="brand" />
      <BilingualLine ar={item.detail.ar} en={item.detail.en} tone="muted" />
    </Pressable>
  );
}

function SessionCard({ item }: { item: SessionCardData }) {
  return (
    <View style={styles.sessionCard}>
      <BilingualLine ar={item.title.ar} en={item.title.en} />
      <BilingualLine ar={item.status.ar} en={item.status.en} tone="brand" />
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  return (
    <View style={styles.feedbackCard}>
      <BilingualLine ar={item.label.ar} en={item.label.en} tone="brand" />
      <BilingualLine ar={item.value.ar} en={item.value.en} tone="muted" />
    </View>
  );
}

export function RecitationHomeView() {
  const { quickActions, sessions, feedback, hero, focus, footer } = recitationHomeCopy;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>{hero.kicker}</Text>
          <Text style={styles.heroArabic}>{hero.title.ar}</Text>
          <Text style={styles.heroEnglish}>{hero.title.en}</Text>
          <Text style={styles.heroArabicBody}>{hero.body.ar}</Text>
          <Text style={styles.heroEnglishBody}>{hero.body.en}</Text>
        </View>

        <View style={styles.panel}>
          <BilingualLine ar={focus.label.ar} en={focus.label.en} tone="brand" />
          <BilingualLine ar={focus.body.ar} en={focus.body.en} />
        </View>

        <View style={styles.section}>
          <BilingualLine ar="الخطوات الأساسية" en="Core actions" tone="brand" />
          {quickActions.map((item) => (
            <ActionCard key={item.title.en} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <BilingualLine ar="نمط التغذية الراجعة" en="Feedback model" tone="brand" />
          {feedback.map((item) => (
            <FeedbackCard key={item.label.en} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <BilingualLine ar="جلسات أخيرة" en="Recent sessions" tone="brand" />
          {sessions.map((item) => (
            <SessionCard key={item.title.en} item={item} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>{footer.title.en}</Text>
          <Text style={styles.footerBody}>{footer.body.en}</Text>
        </View>
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
    gap: recitationTheme.spacing.sm,
  },
  footerTitle: {
    color: recitationTheme.colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  footerBody: {
    color: recitationTheme.colors.brandSoft,
    fontSize: recitationTheme.typography.meta,
    lineHeight: 21,
  },
});
