// The site's three inner sections, in nav order. Each section owns one of the
// home cover's ball colours: the gradient for its dot, and an accent for links
// and buttons on its pages (light end of the gradient on dark paper, a darker
// shade on light paper). Project and post pages live under Work.

export type SectionId = 'about' | 'work' | 'contact';

export interface Section {
  id: SectionId;
  label: string;
  href: string;
  gradient: string;
  accentDark: string;
  accentLight: string;
}

export const SECTIONS: Section[] = [
  { id: 'about', label: 'About', href: '/about/', gradient: 'linear-gradient(135deg, #caa0ff, #8f47ff)', accentDark: '#caa0ff', accentLight: '#6b34d6' },
  { id: 'work', label: 'Work', href: '/work/', gradient: 'linear-gradient(135deg, #ffce6a, #ff7a30)', accentDark: '#ffb26b', accentLight: '#a8480a' },
  { id: 'contact', label: 'Contact', href: '/contact/', gradient: 'linear-gradient(135deg, #ff90c5, #ff3d9c)', accentDark: '#ff90c5', accentLight: '#c2186f' },
];

// Colours for pages outside the three sections (the 404): the cover's blue ball.
export const NO_SECTION = {
  gradient: 'linear-gradient(135deg, #86b6ff, #3f72ff)',
  accentDark: '#86b6ff',
  accentLight: '#2f55d4',
};

const PREFIXES: [string, SectionId][] = [
  ['/about', 'about'],
  ['/work', 'work'],
  ['/projects', 'work'],
  ['/writing', 'work'],
  ['/contact', 'contact'],
];

export function sectionForPath(pathname: string): SectionId | null {
  for (const [prefix, id] of PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return id;
  }
  return null;
}

function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}
