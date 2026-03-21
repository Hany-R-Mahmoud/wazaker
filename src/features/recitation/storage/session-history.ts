import type { SessionRecord } from '../types';

const sessionHistoryStorageKey = 'wazaker.recitation.session-history';

export interface SessionHistoryStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface SessionHistoryRepository {
  listSessions(): Promise<readonly SessionRecord[]>;
  saveSession(session: SessionRecord): Promise<readonly SessionRecord[]>;
  replaceSession(session: SessionRecord): Promise<readonly SessionRecord[]>;
  clear(): Promise<void>;
}

class InMemorySessionHistoryStore implements SessionHistoryStore {
  private readonly values = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }
}

function createBrowserSessionHistoryStore(): SessionHistoryStore | null {
  if (typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  return {
    async getItem(key: string): Promise<string | null> {
      return globalThis.localStorage.getItem(key);
    },
    async setItem(key: string, value: string): Promise<void> {
      globalThis.localStorage.setItem(key, value);
    },
  };
}

function sortSessions(sessions: readonly SessionRecord[]): readonly SessionRecord[] {
  return [...sessions].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function createSessionHistoryRepository(
  store: SessionHistoryStore = createBrowserSessionHistoryStore() ?? new InMemorySessionHistoryStore(),
): SessionHistoryRepository {
  async function readSessions(): Promise<readonly SessionRecord[]> {
    const rawValue = await store.getItem(sessionHistoryStorageKey);

    if (rawValue == null) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(rawValue) as SessionRecord[];
      return sortSessions(parsedValue);
    } catch {
      return [];
    }
  }

  async function writeSessions(sessions: readonly SessionRecord[]): Promise<readonly SessionRecord[]> {
    const sortedSessions = sortSessions(sessions);
    await store.setItem(sessionHistoryStorageKey, JSON.stringify(sortedSessions));
    return sortedSessions;
  }

  return {
    async listSessions(): Promise<readonly SessionRecord[]> {
      return await readSessions();
    },
    async saveSession(session: SessionRecord): Promise<readonly SessionRecord[]> {
      const existingSessions = await readSessions();
      return await writeSessions([session, ...existingSessions]);
    },
    async replaceSession(session: SessionRecord): Promise<readonly SessionRecord[]> {
      const existingSessions = await readSessions();
      const nextSessions = existingSessions.filter((item) => item.id !== session.id);
      return await writeSessions([session, ...nextSessions]);
    },
    async clear(): Promise<void> {
      await store.setItem(sessionHistoryStorageKey, JSON.stringify([]));
    },
  };
}

export const sessionHistoryRepository = createSessionHistoryRepository();
