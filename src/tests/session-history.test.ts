import {
  createSessionHistoryRepository,
  type SessionHistoryStore,
} from '../features/recitation/storage/session-history';
import { sampleSessionHistory } from '../test/fixtures/recitation-analysis';

function createStore(initialValue?: string): SessionHistoryStore {
  let value = initialValue ?? null;

  return {
    async getItem(): Promise<string | null> {
      return value;
    },
    async setItem(_key: string, nextValue: string): Promise<void> {
      value = nextValue;
    },
  };
}

describe('session history repository', () => {
  it('returns an empty list when storage is empty', async () => {
    const repository = createSessionHistoryRepository(createStore());

    await expect(repository.listSessions()).resolves.toEqual([]);
  });

  it('saves and sorts session history from newest to oldest', async () => {
    const repository = createSessionHistoryRepository(createStore());

    await repository.saveSession(sampleSessionHistory[0]);
    const updatedSessions = await repository.saveSession({
      ...sampleSessionHistory[0],
      id: 'session-2',
      createdAt: '2026-03-20T10:00:00.000Z',
    });

    expect(updatedSessions.map((session) => session.id)).toEqual(['session-2', 'session-1']);
  });
});
