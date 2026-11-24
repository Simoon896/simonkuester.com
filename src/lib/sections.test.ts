import { describe, expect, it } from 'vitest';
import { NO_SECTION, SECTIONS, contrastRatio, sectionForPath } from './sections';

describe('sectionForPath', () => {
  it('maps each section page to its section', () => {
    expect(sectionForPath('/about/')).toBe('about');
    expect(sectionForPath('/work/')).toBe('work');
    expect(sectionForPath('/contact/')).toBe('contact');
  });

  it('puts project and post pages under Work', () => {
    expect(sectionForPath('/projects/ai-detection-engineering-platform/')).toBe('work');
    expect(sectionForPath('/writing/building-this-site/')).toBe('work');
  });

  it('gives the home page and 404 no section', () => {
    expect(sectionForPath('/')).toBeNull();
    expect(sectionForPath('/404')).toBeNull();
    expect(sectionForPath('/aboutness/')).toBeNull();
  });
});

describe('SECTIONS', () => {
  it('lists the three sections in nav order', () => {
    expect(SECTIONS.map((s) => s.label)).toEqual(['About', 'Work', 'Contact']);
    expect(SECTIONS.map((s) => s.href)).toEqual(['/about/', '/work/', '/contact/']);
  });

  it('keeps every accent readable as text in both themes', () => {
    for (const s of [...SECTIONS, NO_SECTION]) {
      expect(contrastRatio(s.accentDark, '#0F0E0C')).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(s.accentLight, '#FAF9F7')).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG extremes', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});
