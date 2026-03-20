import { Text, View } from 'react-native';

import { BilingualLine } from './bilingual-line';
import { styles } from './recitation-home-view.styles';
import { type SessionCardData } from './recitation-home-view.types';

interface SessionCardProps {
  item: SessionCardData;
}

function formatSessionTime(occurredAtIso: string): string {
  const occurredAt = new Date(occurredAtIso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfOccurredDay = new Date(
    occurredAt.getFullYear(),
    occurredAt.getMonth(),
    occurredAt.getDate(),
  );
  const dayDifference = Math.round(
    (startOfToday.getTime() - startOfOccurredDay.getTime()) / 86_400_000,
  );
  const timeLabel = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(occurredAt);

  if (dayDifference === 0) {
    return `Today · ${timeLabel}`;
  }

  if (dayDifference === 1) {
    return `Yesterday · ${timeLabel}`;
  }

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(occurredAt);

  return `${dateLabel} · ${timeLabel}`;
}

export function SessionCard({ item }: SessionCardProps) {
  return (
    <View style={styles.sessionCard}>
      <BilingualLine ar={item.title.ar} en={item.title.en} />
      <BilingualLine ar={item.status.ar} en={item.status.en} tone="brand" />
      <Text style={styles.timeText}>{formatSessionTime(item.occurredAtIso)}</Text>
    </View>
  );
}
