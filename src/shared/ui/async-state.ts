export type AsyncPhase = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  phase: AsyncPhase;
  data: T | null;
  errorMessage: string | null;
}

export function createIdleAsyncState<T>(data: T | null = null): AsyncState<T> {
  return {
    phase: 'idle',
    data,
    errorMessage: null,
  };
}

export function createLoadingAsyncState<T>(data: T | null = null): AsyncState<T> {
  return {
    phase: 'loading',
    data,
    errorMessage: null,
  };
}

export function createSuccessAsyncState<T>(data: T): AsyncState<T> {
  return {
    phase: 'success',
    data,
    errorMessage: null,
  };
}

export function createErrorAsyncState<T>(errorMessage: string, data: T | null = null): AsyncState<T> {
  return {
    phase: 'error',
    data,
    errorMessage,
  };
}
