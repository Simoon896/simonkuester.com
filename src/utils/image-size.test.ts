import { describe, expect, it } from 'vitest';
import { isLogoShaped, publicImageSize } from './image-size';

describe('publicImageSize', () => {
  it('reads PNG dimensions from files in public/', () => {
    expect(publicImageSize('/uploads/project-1.png')).toEqual({ width: 905, height: 771 });
    expect(publicImageSize('/uploads/strongdm logo.png')).toEqual({ width: 804, height: 217 });
  });

  it('reads JPEG dimensions', () => {
    expect(publicImageSize('/uploads/identity-week-2026/argus-booth.jpg')).toEqual({ width: 1600, height: 1200 });
  });

  it('returns null for a missing file', () => {
    expect(publicImageSize('/uploads/missing.png')).toBeNull();
  });

  it('returns null for a format it does not read', () => {
    expect(publicImageSize('/favicon.svg')).toBeNull();
  });
});

describe('isLogoShaped', () => {
  it('treats wide, short images as logos', () => {
    expect(isLogoShaped({ width: 804, height: 217 })).toBe(true);
    expect(isLogoShaped({ width: 905, height: 771 })).toBe(false);
    expect(isLogoShaped({ width: 1600, height: 1200 })).toBe(false);
  });
});
