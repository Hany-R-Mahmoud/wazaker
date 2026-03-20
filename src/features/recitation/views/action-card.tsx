import { Pressable } from 'react-native';

import { BilingualLine } from './bilingual-line';
import { styles } from './recitation-home-view.styles';
import { type QuickAction } from './recitation-home-view.types';

interface ActionCardProps {
  item: QuickAction;
}

export function ActionCard({ item }: ActionCardProps) {
  return (
    <Pressable style={styles.actionCard}>
      <BilingualLine ar={item.title.ar} en={item.title.en} tone="brand" />
      <BilingualLine ar={item.detail.ar} en={item.detail.en} tone="muted" />
    </Pressable>
  );
}
