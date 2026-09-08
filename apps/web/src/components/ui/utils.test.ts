import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('combines strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('handles objects', () => {
    expect(cn('a', { b: true, c: false, d: null })).toBe('a b');
  });

  it('handles arrays', () => {
    expect(cn(['a', 'b'], ['c', 'd'])).toBe('a b c d');
  });

  it('preserves numeric falsy values like 0 and BigInt(0)', () => {
    expect(cn('a', 0, 'b', BigInt(0))).toBe('a 0 b 0');
  });

  it('skips false, null, undefined, empty strings', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });
});
