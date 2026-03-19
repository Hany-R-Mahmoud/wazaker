import { View } from 'react-native';

import { BilingualLine } from './bilingual-line';
import { styles } from './recitation-home-view.styles';
import { type FeedbackItem } from './recitation-home-view.types';

interface FeedbackCardProps {
  item: FeedbackItem;
}

export function FeedbackCard({ item }: FeedbackCardProps) {
  return (
    <View style={styles.feedbackCard}>
      <BilingualLine ar={item.label.ar} en={item.label.en} tone="brand" />
      <BilingualLine ar={item.value.ar} en={item.value.en} tone="muted" />
    </View>
  );
}
