import type { ReadingProgressData, ScrollPositionsData, ReadingStatsData } from './constants';
import { STORAGE_PREFIX } from './constants';

/**
 * localStorage abstraction layer.
 * All methods are SSR-safe: they check for window existence and return
 * sensible defaults when running on the server.
 */
class ReaderStore {
  private get storage(): Storage | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  }

  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  /** Generic get with fallback */
  get<T>(key: string, fallback: T): T {
    const s = this.storage;
    if (!s) return fallback;
    try {
      const raw = s.getItem(this.getKey(key));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  /** Generic set */
  set<T>(key: string, value: T): void {
    const s = this.storage;
    if (!s) return;
    try {
      s.setItem(this.getKey(key), JSON.stringify(value));
    } catch {
      // localStorage full or unavailable — silently fail
    }
  }

  /** Remove a key */
  remove(key: string): void {
    const s = this.storage;
    if (!s) return;
    try {
      s.removeItem(this.getKey(key));
    } catch {
      // silently fail
    }
  }

  // ---- Convenience methods for reading progress ----

  getProgress(storageKey: string): ReadingProgressData {
    return this.get<ReadingProgressData>(storageKey, {
      readPages: [],
      lastVisitedPage: '',
      lastVisitedAt: 0,
    });
  }

  setProgress(storageKey: string, data: ReadingProgressData): void {
    this.set(storageKey, data);
  }

  // ---- Convenience methods for scroll positions ----

  getScroll(storageKey: string, path: string): number | null {
    const data = this.get<ScrollPositionsData>(storageKey, {});
    return data[path] ?? null;
  }

  setScroll(storageKey: string, path: string, y: number): void {
    const data = this.get<ScrollPositionsData>(storageKey, {});
    data[path] = y;
    this.set(storageKey, data);
  }

  // ---- Convenience methods for reading stats ----

  getStats(storageKey: string): ReadingStatsData {
    return this.get<ReadingStatsData>(storageKey, {
      totalUniquePages: [],
      totalReadingTimeMs: 0,
      readingDays: [],
      lastReadingDate: '',
    });
  }

  setStats(storageKey: string, data: ReadingStatsData): void {
    this.set(storageKey, data);
  }
}

/** Singleton store instance */
export const store = new ReaderStore();
