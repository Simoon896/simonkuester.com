import { describe, it, expect } from 'vitest';
import { readingTime } from './reading-time';

describe('readingTime', () => {
  it('returns at least 1 min for short text', () => {
    expect(readingTime('hello world')).toBe('1 min read');
  });

  it('scales with word count (~200 wpm)', () => {
    const text = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(readingTime(text)).toBe('2 min read');
  });
});
