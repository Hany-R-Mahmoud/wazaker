import { Text, View } from 'react-native';

import { BilingualLine } from './bilingual-line';
import { styles } from './recitation-home-view.styles';
import { type SessionCardData } from './recitation-home-view.types';

interface SessionCardProps {
  item: SessionCardData;
}

export function SessionCard({ item }: SessionCardProps) {
  return (
    <View style={styles.sessionCard}>
      <BilingualLine ar={item.title.ar} en={item.title.en} />
      <BilingualLine ar={item.status.ar} en={item.status.en} tone="brand" />
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );
}
