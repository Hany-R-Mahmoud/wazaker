import { Fragment, PropsWithChildren, useEffect } from 'react';
import { I18nManager } from 'react-native';

const isRtl = true;

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    if (I18nManager.isRTL !== isRtl) {
      I18nManager.allowRTL(isRtl);
      I18nManager.forceRTL(isRtl);
    }
  }, []);

  return <Fragment>{children}</Fragment>;
}
