import { describe, it, expect } from 'vitest';

// Pure-logic helpers extracted for testability.
// Uses code-point ranges instead of regex for maximum cross-environment compatibility.

const CJK_RANGES: [number, number][] = [
  [0x4e00, 0x9fff], // CJK Unified Ideographs
  [0x3400, 0x4dbf], // CJK Extension A
  [0x3040, 0x309f], // Hiragana
  [0x30a0, 0x30ff], // Katakana
  [0xac00, 0xd7af], // Hangul
];

function isCJK(text: string): boolean {
  let cjkCount = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (CJK_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)) {
      cjkCount++;
    }
  }
  return cjkCount > text.length * 0.3;
}

function countWords(text: string, cjk: boolean): number {
  if (cjk) {
    return Math.ceil(text.length / 2);
  }
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

describe('Word Counting Logic', () => {
  describe('isCJK', () => {
    it('detects Chinese text', () => {
      expect(isCJK('这是一段中文文本用于测试')).toBe(true);
    });

    it('detects Japanese text', () => {
      expect(isCJK('これは日本語のテストです')).toBe(true);
    });

    it('detects Korean text', () => {
      expect(isCJK('이것은한국어테스트입니다')).toBe(true);
    });

    it('returns false for pure English', () => {
      expect(isCJK('This is a purely English sentence with no CJK characters at all.')).toBe(false);
    });

    it('returns false for mixed text with few CJK chars', () => {
      const mixed = 'This is English text 中'; // ~3% CJK
      expect(isCJK(mixed)).toBe(false);
    });

    it('returns true for mixed text with significant CJK', () => {
      const mixed = '这是中文 this is english 也是中文';
      expect(isCJK(mixed)).toBe(true);
    });

    it('handles empty string', () => {
      expect(isCJK('')).toBe(false);
    });
  });

  describe('countWords', () => {
    it('counts by whitespace for English', () => {
      expect(countWords('The quick brown fox jumps over the lazy dog', false)).toBe(9);
    });

    it('handles extra whitespace', () => {
      expect(countWords('  hello    world  ', false)).toBe(2);
    });

    it('counts by char for CJK (ceil(len/2))', () => {
      expect(countWords('你好世界', true)).toBe(2);
    });

    it('counts odd-length CJK correctly', () => {
      expect(countWords('你好世界你', true)).toBe(3);
    });

    it('returns 0 for empty string', () => {
      expect(countWords('', false)).toBe(0);
      expect(countWords('', true)).toBe(0);
    });
  });

  describe('reading time calculation', () => {
    function estimateReadingTime(text: string, wpm: number, cjkWpm: number) {
      const cjk = isCJK(text);
      const words = countWords(text, cjk);
      const effectiveWpm = cjk ? cjkWpm : wpm;
      return Math.max(1, Math.ceil(words / effectiveWpm));
    }

    it('estimates ~1 min for short English text', () => {
      const text = Array(190).fill('word').join(' ');
      expect(estimateReadingTime(text, 200, 300)).toBe(1);
    });

    it('estimates ~2 min for longer English text', () => {
      const text = Array(350).fill('word').join(' ');
      expect(estimateReadingTime(text, 200, 300)).toBe(2);
    });

    it('estimates ~1 min for short Chinese text', () => {
      const text = '中'.repeat(299);
      expect(estimateReadingTime(text, 200, 300)).toBe(1);
    });

    it('estimates ~3 min for longer Chinese text', () => {
      const text = '中'.repeat(1500);
      expect(estimateReadingTime(text, 200, 300)).toBe(3);
    });

    it('never returns less than 1 minute', () => {
      expect(estimateReadingTime('hello', 200, 300)).toBe(1);
      expect(estimateReadingTime('', 200, 300)).toBe(1);
    });
  });
});
