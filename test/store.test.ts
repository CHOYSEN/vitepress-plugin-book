import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '../src/client/store'

describe('ReaderStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ---- basic get/set ----
  it('sets and gets a value', () => {
    store.set('test-key', { hello: 'world' })
    expect(store.get('test-key', null)).toEqual({ hello: 'world' })
  })

  it('returns fallback when key is missing', () => {
    expect(store.get('nonexistent', 'fallback')).toBe('fallback')
  })

  it('returns fallback when JSON is malformed', () => {
    localStorage.setItem('vitepress-book:bad', '{not json')
    expect(store.get('bad', 'safe')).toBe('safe')
  })

  it('removes a key', () => {
    store.set('temp', 123)
    expect(store.get('temp', 0)).toBe(123)
    store.remove('temp')
    expect(store.get('temp', 0)).toBe(0)
  })

  it('prefixes keys with namespace', () => {
    store.set('mykey', 'value')
    expect(localStorage.getItem('vitepress-book:mykey')).not.toBeNull()
    expect(localStorage.getItem('mykey')).toBeNull()
  })

  // ---- reading progress ----
  it('getProgress returns defaults on first access', () => {
    const p = store.getProgress('vitepress-book:progress')
    expect(p.readPages).toEqual([])
    expect(p.lastVisitedPage).toBe('')
    expect(p.lastVisitedAt).toBe(0)
  })

  it('setProgress + getProgress round-trips', () => {
    store.setProgress('vitepress-book:progress', {
      readPages: ['/a', '/b'],
      lastVisitedPage: '/b',
      lastVisitedAt: 1712345678000,
    })
    const p = store.getProgress('vitepress-book:progress')
    expect(p.readPages).toEqual(['/a', '/b'])
    expect(p.lastVisitedPage).toBe('/b')
    expect(p.lastVisitedAt).toBe(1712345678000)
  })

  // ---- scroll positions ----
  it('getScroll returns null for unknown path', () => {
    expect(store.getScroll('vitepress-book:scroll', '/unknown')).toBeNull()
  })

  it('setScroll + getScroll round-trips', () => {
    store.setScroll('vitepress-book:scroll', '/guide/a', 420)
    store.setScroll('vitepress-book:scroll', '/guide/b', 720)
    expect(store.getScroll('vitepress-book:scroll', '/guide/a')).toBe(420)
    expect(store.getScroll('vitepress-book:scroll', '/guide/b')).toBe(720)
    expect(store.getScroll('vitepress-book:scroll', '/guide/c')).toBeNull()
  })

  // ---- reading stats ----
  it('getStats returns defaults on first access', () => {
    const s = store.getStats('vitepress-book:stats')
    expect(s.totalUniquePages).toEqual([])
    expect(s.totalReadingTimeMs).toBe(0)
    expect(s.readingDays).toEqual([])
    expect(s.lastReadingDate).toBe('')
  })

  it('setStats + getStats round-trips', () => {
    store.setStats('vitepress-book:stats', {
      totalUniquePages: ['/a', '/b', '/c'],
      totalReadingTimeMs: 3600000,
      readingDays: ['2026-07-25', '2026-07-26'],
      lastReadingDate: '2026-07-26',
    })
    const s = store.getStats('vitepress-book:stats')
    expect(s.totalUniquePages).toEqual(['/a', '/b', '/c'])
    expect(s.totalReadingTimeMs).toBe(3600000)
    expect(s.readingDays).toEqual(['2026-07-25', '2026-07-26'])
  })

  // ---- cross-key isolation ----
  it('isolates data between different storage keys', () => {
    store.setProgress('ns-a:progress', {
      readPages: ['/x'], lastVisitedPage: '/x', lastVisitedAt: 1000,
    })
    store.setProgress('ns-b:progress', {
      readPages: ['/y'], lastVisitedPage: '/y', lastVisitedAt: 9999,
    })
    expect(store.getProgress('ns-a:progress').readPages).toEqual(['/x'])
    expect(store.getProgress('ns-b:progress').readPages).toEqual(['/y'])
  })
})
