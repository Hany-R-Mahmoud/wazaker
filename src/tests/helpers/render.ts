import { render, type RenderOptions } from '@testing-library/react-native';
import { createElement, type ReactElement } from 'react';

import { AppProviders } from '../../app/providers/app-providers';

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    wrapper: ({ children }) =>
      createElement(AppProviders, { disableRecitationHydration: true }, children),
    ...options,
  });
}

export * from '@testing-library/react-native';
