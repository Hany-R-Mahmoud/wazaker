import { PropsWithChildren } from 'react';
import { I18nManager } from 'react-native';

const isRtl = true;

if (I18nManager.isRTL !== isRtl) {
  I18nManager.allowRTL(isRtl);
}

export function AppProviders({ children }: PropsWithChildren) {
  return children;
}
