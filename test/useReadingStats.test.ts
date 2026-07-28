import { describe, it, expect } from 'vitest'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayBeforeStr(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Pure-logic streak calculator */
function calcStreak(readingDays: string[]): number {
  if (readingDays.length === 0) return 0

  const sorted = [...readingDays].sort().reverse()
  const today = todayStr()
  let streak = 0
  let expectedDate = today

  for (const day of sorted) {
    if (day === expectedDate) {
      streak++
      // move expected back by 1
      const d = new Date(expectedDate)
      d.setDate(d.getDate() - 1)
      expectedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } else if (streak === 0 && day === yesterdayStr()) {
      // allow yesterday as start
      streak++
      expectedDate = todayStr()
    } else {
      // gap in days — not consecutive
    }
  }

  return streak
}

/** Pure-logic time formatter */
function formatTime(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

describe('Reading Stats Logic', () => {
  describe('formatTime', () => {
    it('formats minutes under 1 hour', () => {
      expect(formatTime(60000)).toBe('1m')       // 1 min
      expect(formatTime(900000)).toBe('15m')      // 15 min
      expect(formatTime(3540000)).toBe('59m')     // 59 min
    })

    it('formats hours with minutes', () => {
      expect(formatTime(3600000)).toBe('1h')          // exactly 1h
      expect(formatTime(3660000)).toBe('1h 1m')       // 1h 1m
      expect(formatTime(9000000)).toBe('2h 30m')      // 2h 30m
      expect(formatTime(7380000)).toBe('2h 3m')       // 2h 3m
    })

    it('formats large hour values', () => {
      expect(formatTime(86400000)).toBe('24h')    // 24 hours
    })

    it('handles 0ms', () => {
      expect(formatTime(0)).toBe('0m')
    })
  })

  describe('calcStreak', () => {
    it('returns 0 for empty reading days', () => {
      expect(calcStreak([])).toBe(0)
    })

    // Streak tests depend on today's date, so we test with relative dates
    it('returns 1 for just today', () => {
      expect(calcStreak([todayStr()])).toBe(1)
    })
  })
})
