import { Text, View } from 'react-native';

import { styles } from './recitation-home-view.styles';
import { type BilingualLineProps } from './recitation-home-view.types';

export function BilingualLine({
  ar,
  en,
  tone = 'default',
}: BilingualLineProps) {
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
