import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import { ActionCard } from './action-card';
import { BilingualLine } from './bilingual-line';
import { FeedbackCard } from './feedback-card';
import { styles } from './recitation-home-view.styles';
import { SessionCard } from './session-card';
import { recitationHomeCopy } from '../../../shared/i18n/recitation-home-copy';

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
          <View style={styles.footerCopyBlock}>
            <Text style={styles.footerTitleArabic}>{footer.title.ar}</Text>
            <Text style={styles.footerTitleEnglish}>{footer.title.en}</Text>
          </View>
          <View style={styles.footerCopyBlock}>
            <Text style={styles.footerBodyArabic}>{footer.body.ar}</Text>
            <Text style={styles.footerBodyEnglish}>{footer.body.en}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
