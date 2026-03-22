import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import type {
  ComparisonResult,
  RecitationAttempt,
  SessionRecord,
  TargetPassage,
} from '../types';
import {
  createErrorAsyncState,
  createSuccessAsyncState,
  type AsyncState,
} from '../../../shared/ui/async-state';
import {
  getSessionHistoryRepository,
  type SessionHistoryRepository,
} from '../storage/session-history';
import {
  defaultRecitationFixtureTarget,
  sampleSessionHistory,
} from '../models/recitation-fixtures';

interface RecitationSessionContextValue {
  currentTarget: TargetPassage;
  currentAttempt: RecitationAttempt | null;
  currentResult: ComparisonResult | null;
  sessionHistoryState: AsyncState<readonly SessionRecord[]>;
  selectTarget: (target: TargetPassage) => void;
  startAttempt: () => RecitationAttempt;
  stopAttempt: () => void;
  cancelAttempt: () => void;
  completeAttempt: (attempt: RecitationAttempt, result: ComparisonResult) => Promise<void>;
  dismissResult: () => void;
}

interface RecitationSessionProviderProps extends PropsWithChildren {
  repository?: SessionHistoryRepository;
  shouldHydrateOnMount?: boolean;
}

const recitationSessionContext = createContext<RecitationSessionContextValue | null>(null);

function createAttempt(target: TargetPassage): RecitationAttempt {
  const startedAt = new Date().toISOString();
  return {
    id: `attempt-${startedAt}`,
    targetPassageId: target.id,
    status: 'recording',
    audioUri: null,
    durationMs: 0,
    startedAt,
    completedAt: null,
    failureReason: null,
  };
}

export function RecitationSessionProvider({
  children,
  repository = getSessionHistoryRepository(),
  shouldHydrateOnMount = true,
}: RecitationSessionProviderProps) {
  const [currentTarget, setCurrentTarget] = useState<TargetPassage>(defaultRecitationFixtureTarget);
  const [currentAttempt, setCurrentAttempt] = useState<RecitationAttempt | null>(null);
  const [currentResult, setCurrentResult] = useState<ComparisonResult | null>(null);
  const [sessionHistoryState, setSessionHistoryState] = useState<AsyncState<readonly SessionRecord[]>>(
    createSuccessAsyncState(sampleSessionHistory),
  );

  useEffect(() => {
    if (!shouldHydrateOnMount) {
      return;
    }

    let isMounted = true;

    async function loadSessions(): Promise<void> {
      try {
        const sessions = await repository.listSessions();

        if (!isMounted) {
          return;
        }

        const nextSessions = sessions.length > 0 ? sessions : sampleSessionHistory;
        setSessionHistoryState((currentState) => {
          if (
            currentState.phase === 'success' &&
            JSON.stringify(currentState.data) === JSON.stringify(nextSessions)
          ) {
            return currentState;
          }

          return createSuccessAsyncState(nextSessions);
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.warn('Failed to hydrate recitation session history.', error);
        setSessionHistoryState(
          createErrorAsyncState(
            'Unable to load saved session history right now.',
            sampleSessionHistory,
          ),
        );
      }
    }

    void loadSessions();

    return () => {
      isMounted = false;
    };
  }, [repository, shouldHydrateOnMount]);

  const contextValue = useMemo<RecitationSessionContextValue>(
    () => ({
      currentTarget,
      currentAttempt,
      currentResult,
      sessionHistoryState,
      selectTarget(target: TargetPassage): void {
        setCurrentTarget(target);
        setCurrentAttempt(null);
        setCurrentResult(null);
      },
      startAttempt(): RecitationAttempt {
        const attempt = createAttempt(currentTarget);
        setCurrentAttempt(attempt);
        setCurrentResult(null);
        return attempt;
      },
      stopAttempt(): void {
        setCurrentAttempt((attempt) =>
          attempt === null
            ? null
            : {
                ...attempt,
                status: 'draft',
              },
        );
      },
      cancelAttempt(): void {
        setCurrentAttempt((attempt) =>
          attempt === null
            ? null
            : {
                ...attempt,
                status: 'cancelled',
                completedAt: new Date().toISOString(),
              },
        );
      },
      async completeAttempt(
        attempt: RecitationAttempt,
        result: ComparisonResult,
      ): Promise<void> {
        const completedAt = new Date().toISOString();
        const completedAttempt: RecitationAttempt = {
          ...attempt,
          status: 'completed',
          completedAt,
        };
        const sessionRecord: SessionRecord = {
          id: `session-${completedAttempt.id}`,
          targetPassage: currentTarget,
          attempt: completedAttempt,
          result,
          createdAt: completedAt,
        };

        setCurrentAttempt(completedAttempt);
        setCurrentResult(result);

        try {
          const sessions = await repository.saveSession(sessionRecord);
          setSessionHistoryState(createSuccessAsyncState(sessions));
        } catch (error) {
          console.warn('Failed to persist completed recitation attempt.', error);
          setSessionHistoryState((currentState) =>
            createErrorAsyncState(
              'The result is ready, but saving it locally failed.',
              currentState.data,
            ),
          );
        }
      },
      dismissResult(): void {
        setCurrentResult(null);
      },
    }),
    [currentAttempt, currentResult, currentTarget, repository, sessionHistoryState],
  );

  return (
    <recitationSessionContext.Provider value={contextValue}>
      {children}
    </recitationSessionContext.Provider>
  );
}

export function useRecitationSession(): RecitationSessionContextValue {
  const contextValue = useContext(recitationSessionContext);

  if (contextValue == null) {
    throw new Error('useRecitationSession must be used within a RecitationSessionProvider.');
  }

  return contextValue;
}
