import { Fragment, PropsWithChildren, useEffect } from 'react';
import { I18nManager } from 'react-native';

import { RecitationSessionProvider } from '../../features/recitation/hooks/use-recitation-session';

const isRtl = true;

interface AppProvidersProps extends PropsWithChildren {
  disableRecitationHydration?: boolean;
}

export function AppProviders({
  children,
  disableRecitationHydration = false,
}: AppProvidersProps) {
  useEffect(() => {
    if (I18nManager.isRTL !== isRtl) {
      I18nManager.allowRTL(isRtl);
      I18nManager.forceRTL(isRtl);
    }
  }, []);

  return (
    <Fragment>
      <RecitationSessionProvider shouldHydrateOnMount={!disableRecitationHydration}>
        {children}
      </RecitationSessionProvider>
    </Fragment>
  );
}
