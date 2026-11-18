export interface LegendCardData {
  id: string;
  icon: string;
  title: string;
  frontSummary: string;
  backTitle: string;
  backLore: string;
  accent: 'cyan' | 'magenta' | 'gold';
}

export interface FighterStats {
  strength: number;
  speed: number;
  technique: number;
  spirit: number;
}

export interface FighterData {
  id: string;
  name: string;
  title: string;
  rank: string;
  powerLevel: string;
  element: string;
  fightingStyle: string;
  lore: string;
  signatureMove: string;
  image: string;
  accentColor: string;
  stats: FighterStats;
}

export interface BattleData {
  id: string;
  tag: string;
  title: string;
  matchup: string;
  story: string;
  fighterA: string;
  fighterB: string;
  powerA: number;
  powerB: number;
  initialSeconds: number;
  accent: 'red' | 'cyan' | 'magenta';
}

export const MAIN_LEGEND_TEXT =
  'In the year 2187, a dimensional rift tore open above Neo-Kyoto. From it emerged the VOID COUNCIL — seven godlike fighters who declared that only the strongest warrior could seal the rift. To find this warrior, they built THE CRIMSON VOID — a floating coliseum of pure energy where time has no meaning, and every battle echoes across a thousand worlds. At its center stands a lone figure known only as SAMS SANIAN AHAMOD — the arena\'s eternal guardian, the last blade of the fallen era, and the one who will decide the fate of reality itself.';

export const LEGEND_CARDS: LegendCardData[] = [
  {
    id: 'rift',
    icon: '🌌',
    title: 'THE RIFT',
    frontSummary:
      'When the sky split open in 2187, the world learned that power was not a gift — it was a curse.',
    backTitle: 'NEO-KYOTO SHATTERING · YEAR 2187',
    backLore:
      'At 02:14 Neo-Standard Time, an obsidian fracture pierced the stratosphere. Gravity reversed for seven seconds, and echoes of collapsed timelines began bleeding into the city below, birthing elemental conduits.',
    accent: 'cyan',
  },
  {
    id: 'council',
    icon: '⚔️',
    title: 'THE COUNCIL',
    frontSummary:
      'Seven immortals. Seven weapons. One rule — the arena decides who lives.',
    backTitle: 'DECREE OF THE SEVEN THRONES',
    backLore:
      'Rather than conquer Neo-Kyoto by force, the Void Council suspended the Crimson Void coliseum in orbit. Every duel generates resonance energy—either sealing the fracture or feeding the Council\'s ascension.',
    accent: 'magenta',
  },
  {
    id: 'guardian',
    icon: '👑',
    title: 'THE GUARDIAN',
    frontSummary:
      'Sams Sanian Ahamod. No one knows where he came from. Only that when he raises his blade, entire dimensions tremble.',
    backTitle: 'KEEPER OF THE LAST BLADE',
    backLore:
      'Born in a timeline erased by the first rift, Sams forged his crimson katana from a dying star. He stands at the center platform alone, judging challengers and holding the void back from swallowing Earth.',
    accent: 'gold',
  },
];

export const PROPHECY_LINES = [
  'When the rift devours the last light,',
  'a blade of shadow shall rise.',
  'His name will echo across the void —',
  'SAMS SANIAN AHAMOD, the Crimson Blade.',
];

export const PROPHECY_MILESTONES = [
  {
    era: '2187 · THE FRACTURE',
    title: 'Neo-Kyoto Sky Splits',
    detail: 'The Void Council raises the floating Crimson Void coliseum above the shattered neon skyline.',
  },
  {
    era: '2191 · THE ECLIPSE',
    title: 'Three Rifts Sealed',
    detail: 'Sams Sanian Ahamod descends into the abyss and severs three dimensional breaches single-handedly.',
  },
  {
    era: 'NOW · THE FINAL TRIAL',
    title: 'Zero Approaches the Ring',
    detail: 'The seventh seal weakens. Only the final duel will determine if reality endures or collapses.',
  },
];

export const SECRET_CHAPTER = {
  title: "THE RIFT'S TRUE ORIGIN",
  subtitle: 'FORBIDDEN ARCHIVE · GUARDIAN CLEARANCE',
  paragraphs: [
    'The Void Council did not open the rift by conquest—they fled through it. In an ancient future where humanity mastered dimensional folding, the Crimson Void was built as an ark.',
    'Sams Sanian Ahamod was its first architect. To keep the engine from tearing Neo-Kyoto apart, he bound his own soul to the central blade, sacrificing his timeline so every other world might survive.',
  ],
};

export const FIGHTERS: FighterData[] = [
  {
    id: 'sams',
    name: 'SAMS SANIAN AHAMOD',
    title: 'The Crimson Blade',
    rank: 'S+ Rank',
    powerLevel: '99,999+',
    element: 'Crimson Void / Starlight',
    fightingStyle: 'Void-Severing Iaijutsu',
    lore: 'The eternal guardian of the Crimson Void. His blade has sealed three rifts and shattered seven armies. No one has ever seen him fight at full power... and lived.',
    signatureMove: 'CRIMSON ECLIPSE — NINEFOLD DIMENSION SLASH',
    image: '/src/assets/images/fighter_sams_1794996295931.jpg',
    accentColor: '#ff3355',
    stats: { strength: 98, speed: 99, technique: 100, spirit: 100 },
  },
  {
    id: 'kai',
    name: "KAI 'THUNDERFANG' TAKEDA",
    title: 'Tempest Brawler',
    rank: 'A-Rank',
    powerLevel: '68,400',
    element: 'Lightning',
    fightingStyle: 'Overdrive Raijin Kenpo',
    lore: "Struck by a storm god at birth, Kai channels lightning through his fists. He seeks revenge on the VOID COUNCIL for his village's fall.",
    signatureMove: 'VOLT BREAKER — HUNDRED-THUNDER BARRAGE',
    image: '/src/assets/images/fighter_kai_1794996298159.jpg',
    accentColor: '#00ffff',
    stats: { strength: 88, speed: 94, technique: 79, spirit: 91 },
  },
  {
    id: 'yuki',
    name: "YUKI 'FROST VEIL' MIYAMOTO",
    title: 'Silent Glacier',
    rank: 'S-Rank',
    powerLevel: '84,200',
    element: 'Ice',
    fightingStyle: 'Absolute-Zero Shinobi Art',
    lore: 'The last of the Snowfall Clan. Her breath can freeze time for 3 seconds — long enough to end any fight.',
    signatureMove: 'ETERNAL WINTER — CHRONO SHATTER',
    image: '/src/assets/images/fighter_yuki_1794996296610.jpg',
    accentColor: '#38bdf8',
    stats: { strength: 76, speed: 95, technique: 96, spirit: 92 },
  },
  {
    id: 'raijin',
    name: "RAIJIN 'IRON SOUL' KUROSAWA",
    title: 'The Living Fortress',
    rank: 'A-Rank',
    powerLevel: '73,500',
    element: 'Earth / Metal',
    fightingStyle: 'Titan Tectonic Impact',
    lore: 'A mountain that learned to punch. Armor forged from the bones of fallen titans.',
    signatureMove: 'CONTINENT CRUSHER — TECTONIC ZERO',
    image: '/src/assets/images/fighter_raijin_1794996298398.jpg',
    accentColor: '#ffcc00',
    stats: { strength: 99, speed: 64, technique: 82, spirit: 90 },
  },
  {
    id: 'akane',
    name: "AKANE 'CRIMSON LILY' HOSHINO",
    title: 'Phantom Defector',
    rank: 'S-Rank',
    powerLevel: '86,900',
    element: 'Blood / Fire',
    fightingStyle: 'Twin-Fang Lotus Assassination',
    lore: 'The void council’s former assassin. She defected to protect a child and now fights beside Sams Sanian Ahamod.',
    signatureMove: 'SCARLET PETAL STORM — FINAL BLOOM',
    image: '/src/assets/images/fighter_akane_1794996298866.jpg',
    accentColor: '#ff00aa',
    stats: { strength: 84, speed: 97, technique: 95, spirit: 89 },
  },
  {
    id: 'zero',
    name: 'ZERO',
    title: 'Harbinger of Nothing',
    rank: '??? Rank',
    powerLevel: 'UNKNOWN',
    element: 'Void',
    fightingStyle: 'Dimensional Erasure',
    lore: "No one knows Zero's real name. No one knows Zero's face. All they know is: if Zero appears in your match, the match is already over.",
    signatureMove: 'EVENT HORIZON — NULL REQUIEM',
    image: '/src/assets/images/fighter_zero_1794996298931.jpg',
    accentColor: '#a855f7',
    stats: { strength: 96, speed: 98, technique: 97, spirit: 99 },
  },
];

export const BATTLES: BattleData[] = [
  {
    id: 'rift-duel',
    tag: '🔥 TITLE MATCH',
    title: 'The Rift Duel',
    matchup: 'Sams Sanian Ahamod vs. Zero',
    story: 'The final battle that will decide whether the rift seals... or consumes everything.',
    fighterA: 'Sams Sanian Ahamod',
    fighterB: 'Zero',
    powerA: 99,
    powerB: 98,
    initialSeconds: 265,
    accent: 'red',
  },
  {
    id: 'frozen-sky',
    tag: '❄️ REVENGE MATCH',
    title: 'Storm of the Frozen Sky',
    matchup: 'Yuki vs. Kai',
    story: 'One seeks justice. One seeks peace. Only one walks away.',
    fighterA: 'Yuki Miyamoto',
    fighterB: 'Kai Takeda',
    powerA: 88,
    powerB: 84,
    initialSeconds: 615,
    accent: 'cyan',
  },
  {
    id: 'iron-rose',
    tag: '🌹 SISTER BATTLE',
    title: 'The Iron Rose',
    matchup: 'Akane vs. Raijin',
    story: 'A former assassin vs. an immovable mountain. Betrayal, honor, and blood.',
    fighterA: 'Akane Hoshino',
    fighterB: 'Raijin Kurosawa',
    powerA: 89,
    powerB: 85,
    initialSeconds: 1140,
    accent: 'magenta',
  },
];

export const ANIME_QUOTES = [
  '"When the blade draws crimson, even gods hold their breath." — Sams Sanian Ahamod',
  '"A warrior\'s true strength is measured by the worlds they refuse to let fall."',
  '"Lightning fades. Ice melts. Only the Crimson Void remembers."',
  '"Do not fear the abyss—become the blade that cuts it open."',
];

export const SEED_GMAIL_DISPATCHES = [
  {
    id: 'gm-1',
    from: 'council-observer@void-citadel.jp',
    subject: 'Rift Resonance Spike — Sector 09 Neo-Kyoto',
    snippet: 'Sensor arrays confirm Zero has entered the lower rings. Requesting Guardian authorization before eclipse.',
    receivedAt: '2187-11-18 01:42',
  },
  {
    id: 'gm-2',
    from: 'akane.hoshino@crimson-blade.org',
    subject: 'Safe Passage Confirmed for the Child',
    snippet: 'The Snowfall shelter is secure. I am returning to the Coliseum platform to stand beside you.',
    receivedAt: '2187-11-18 00:19',
  },
  {
    id: 'gm-3',
    from: 'kai.takeda@thunder-dojo.jp',
    subject: 'Challenge Petition: Storm of the Frozen Sky',
    snippet: 'Yuki blocked my path to the Seventh Throne. Let the arena decide who deserves to face the Council.',
    receivedAt: '2187-11-17 22:08',
  },
];
