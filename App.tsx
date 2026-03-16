import { StatusBar } from 'expo-status-bar';
import {
  I18nManager,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const colors = {
  background: '#F7F1E8',
  surface: '#FFFDFC',
  ink: '#1E1A16',
  muted: '#71675D',
  brand: '#7A5C46',
  brandSoft: '#E7D6C5',
  accent: '#CDA15A',
  line: '#E8DED1',
  success: '#2D6A4F',
};

const quickActions = [
  { titleAr: 'ابدأ التسميع', titleEn: 'Start Recitation', detailAr: 'سجّل تسميعك وراجع الأخطاء', detailEn: 'Record and review mistakes' },
  { titleAr: 'اختر المقطع', titleEn: 'Choose Passage', detailAr: 'حدّد السورة أو الصفحة المستهدفة', detailEn: 'Select surah, ayah range, or page' },
  { titleAr: 'نتائج سابقة', titleEn: 'Recent Results', detailAr: 'راجع آخر الجلسات المحفوظة', detailEn: 'Review saved sessions' },
];

const sessions = [
  { titleAr: 'الفاتحة', titleEn: 'Al-Fatiha', statusAr: 'دقة جيدة', statusEn: 'Good accuracy', time: 'Today · 7:40 PM' },
  { titleAr: 'البقرة 1-5', titleEn: 'Al-Baqarah 1-5', statusAr: 'يحتاج مراجعة', statusEn: 'Needs revision', time: 'Yesterday · 9:15 PM' },
];

const feedback = [
  { labelAr: 'حذف', labelEn: 'Omission', valueAr: 'كلمات أو آية سقطت', valueEn: 'Words or ayah skipped' },
  { labelAr: 'استبدال', labelEn: 'Substitution', valueAr: 'لفظ مختلف عن المتوقع', valueEn: 'Different wording detected' },
  { labelAr: 'ثقة منخفضة', labelEn: 'Low confidence', valueAr: 'لا نجزم عند ضعف الإشارة', valueEn: 'Avoid overclaiming when uncertain' },
];

const isRtl = true;

if (I18nManager.isRTL !== isRtl) {
  I18nManager.allowRTL(isRtl);
}

type Copy = {
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
};

type Session = {
  titleAr: string;
  titleEn: string;
  statusAr: string;
  statusEn: string;
  time: string;
};

type FeedbackItem = {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
};

function BilingualLine({ ar, en, tone = 'default' }: { ar: string; en: string; tone?: 'default' | 'muted' | 'brand' }) {
  return (
    <View style={styles.bilingualBlock}>
      <Text style={[styles.arabicText, tone === 'muted' && styles.mutedText, tone === 'brand' && styles.brandText]}>{ar}</Text>
      <Text style={[styles.englishText, tone === 'muted' && styles.mutedText, tone === 'brand' && styles.brandText]}>{en}</Text>
    </View>
  );
}

function ActionCard({ item }: { item: Copy }) {
  return (
    <Pressable style={styles.actionCard}>
      <BilingualLine ar={item.titleAr} en={item.titleEn} tone="brand" />
      <BilingualLine ar={item.detailAr} en={item.detailEn} tone="muted" />
    </Pressable>
  );
}

function SessionCard({ item }: { item: Session }) {
  return (
    <View style={styles.sessionCard}>
      <BilingualLine ar={item.titleAr} en={item.titleEn} />
      <BilingualLine ar={item.statusAr} en={item.statusEn} tone="brand" />
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  return (
    <View style={styles.feedbackCard}>
      <BilingualLine ar={item.labelAr} en={item.labelEn} tone="brand" />
      <BilingualLine ar={item.valueAr} en={item.valueEn} tone="muted" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>wazaker</Text>
          <Text style={styles.heroArabic}>رفيق مراجعة التلاوة</Text>
          <Text style={styles.heroEnglish}>AI-guided Quran recitation revision</Text>
          <Text style={styles.heroBody}>
            Arabic-first mobile foundation for selecting a passage, reciting from memory, receiving careful feedback, and retrying fast.
          </Text>
        </View>

        <View style={styles.panel}>
          <BilingualLine ar="التركيز الحالي" en="Current focus" tone="brand" />
          <BilingualLine
            ar="المرحلة الأولى تركز فقط على التسميع الذكي، اختيار المقطع، النتيجة، ثم إعادة المحاولة."
            en="Phase 1 is limited to smart recitation, passage selection, results, and quick retry."
          />
        </View>

        <View style={styles.section}>
          <BilingualLine ar="الخطوات الأساسية" en="Core actions" tone="brand" />
          {quickActions.map((item) => (
            <ActionCard key={item.titleEn} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <BilingualLine ar="نمط التغذية الراجعة" en="Feedback model" tone="brand" />
          {feedback.map((item) => (
            <FeedbackCard key={item.labelEn} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <BilingualLine ar="جلسات أخيرة" en="Recent sessions" tone="brand" />
          {sessions.map((item) => (
            <SessionCard key={item.titleEn} item={item} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Next implementation target</Text>
          <Text style={styles.footerBody}>Passage selection, recorder flow, mock result screen, and local session history.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    gap: 18,
  },
  hero: {
    backgroundColor: colors.brand,
    borderRadius: 28,
    padding: 24,
    gap: 8,
  },
  kicker: {
    color: colors.brandSoft,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroArabic: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroEnglish: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  heroBody: {
    color: colors.brandSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
  },
  section: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  feedbackCard: {
    backgroundColor: colors.brandSoft,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  bilingualBlock: {
    gap: 4,
  },
  arabicText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  englishText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  mutedText: {
    color: colors.muted,
  },
  brandText: {
    color: colors.brand,
  },
  timeText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 6,
  },
  footerTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  footerBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
