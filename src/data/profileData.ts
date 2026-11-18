export const INSTAGRAM_PROFILE = {
  handle: '@sams_sanian_ahamod',
  url: 'https://www.instagram.com/sams_sanian_ahamod/',
  label: 'Instagram (@sams_sanian_ahamod)',
} as const;

export interface ProfileField {
  label: string;
  value: string;
  isPlaceholder?: boolean;
  href?: string;
}

export const PERSONAL_DETAILS: ProfileField[] = [
  {
    label: 'Identity',
    value: 'Sams Sanian Ahamod',
  },
  {
    label: 'Universe',
    value: 'The Crimson Void',
  },
  {
    label: 'Official Social',
    value: '@sams_sanian_ahamod',
    href: INSTAGRAM_PROFILE.url,
  },
  {
    label: 'Location',
    value: '[Add your city / country]',
    isPlaceholder: true,
  },
  {
    label: 'Primary Focus',
    value: '[Add your title or craft]',
    isPlaceholder: true,
  },
];

export const SKILLS_AND_INTERESTS: Array<{
  title: string;
  detail: string;
  isPlaceholder?: boolean;
}> = [
  {
    title: 'Creative Direction',
    detail: 'Dark anime worldbuilding, visual identity systems, and atmospheric scene composition.',
  },
  {
    title: 'Interactive Web Engineering',
    detail: 'Responsive React, TypeScript, real-time HTML5 Canvas combat, and procedural audio.',
  },
  {
    title: 'Action Storytelling',
    detail: 'Character dossiers, dimensional lore arcs, and kinetic motion choreography.',
  },
  {
    title: 'Personal Interests',
    detail: '[Add your personal hobbies, creative tools, or favorite inspirations]',
    isPlaceholder: true,
  },
];

export const PERSONAL_ACHIEVEMENTS: Array<{
  title: string;
  subtitle: string;
  detail: string;
  isPlaceholder?: boolean;
}> = [
  {
    title: 'Architect of The Crimson Void',
    subtitle: 'Flagship Interactive Universe',
    detail:
      'Designed and launched an interactive anime showcase pairing original character rosters, playable Canvas2D duels, and a full merch Armory.',
  },
  {
    title: 'Original Guardian Lore System',
    subtitle: 'Character & Combat Direction',
    detail:
      'Created the 6-warrior dimensional lore experience anchored by Sams Sanian Ahamod and The Guardian’s Eye security vault.',
  },
  {
    title: 'Personal Milestone Slot',
    subtitle: 'Customizable Record',
    detail: '[Replace with a real award, academic milestone, certification, or personal accomplishment]',
    isPlaceholder: true,
  },
];
