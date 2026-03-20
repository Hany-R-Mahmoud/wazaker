import { AppController } from './controllers/app-controller';
import { AppProviders } from './providers/app-providers';

export function AppRoot() {
  return (
    <AppProviders>
      <AppController />
    </AppProviders>
  );
}
