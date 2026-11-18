export type ArmoryCategory =
  | 'all'
  | 'action-figures'
  | 'costumes'
  | 'weapons'
  | 'collectibles';

export type ArmoryProductCategory = Exclude<ArmoryCategory, 'all'>;

export type ProductArtKey =
  | 'sams-figure'
  | 'akane-figure'
  | 'zero-figure'
  | 'sams-cosplay'
  | 'akane-kimono'
  | 'void-armor'
  | 'crimson-katana'
  | 'sakura-daggers'
  | 'void-scythe'
  | 'signed-print'
  | 'keychain-set'
  | 'enamel-pins';

export interface ProductReview {
  id: string;
  author: string;
  avatarColor: string;
  rating: number;
  comment: string;
}

export interface ArmoryProduct {
  id: string;
  name: string;
  tagline: string;
  category: ArmoryProductCategory;
  price: number;
  originalPrice?: number;
  badge: string;
  rating: number;
  reviewCount: number;
  stock: number; // 0 = SOLD OUT, 1..5 = Only X left!, >5 = In Stock
  artKey: ProductArtKey;
  accentColor: string;
  loreDescription: string;
  specs: {
    dimensions: string;
    materials: string;
    edition: string;
  };
  reviews: ProductReview[];
}

export const ARMORY_CATEGORIES: Array<{
  id: ArmoryCategory;
  label: string;
  badgeColor: string;
}> = [
  { id: 'all', label: 'ALL', badgeColor: '#00ffff' },
  { id: 'action-figures', label: 'ACTION FIGURES', badgeColor: '#00ffff' },
  { id: 'costumes', label: 'COSTUMES', badgeColor: '#ff00aa' },
  { id: 'weapons', label: 'WEAPONS', badgeColor: '#ff3355' },
  { id: 'collectibles', label: 'COLLECTIBLES', badgeColor: '#ffcc00' },
];

export const CATEGORY_STYLE_MAP: Record<
  ArmoryProductCategory,
  { label: string; color: string; bgClass: string; textClass: string; borderClass: string }
> = {
  'action-figures': {
    label: 'ACTION FIGURES',
    color: '#00ffff',
    bgClass: 'bg-cyan-500/15',
    textClass: 'text-[#00ffff]',
    borderClass: 'border-cyan-400/45',
  },
  costumes: {
    label: 'COSTUMES',
    color: '#ff00aa',
    bgClass: 'bg-pink-500/15',
    textClass: 'text-[#ff88dd]',
    borderClass: 'border-[#ff00aa]/45',
  },
  weapons: {
    label: 'WEAPONS',
    color: '#ff3355',
    bgClass: 'bg-rose-500/15',
    textClass: 'text-[#ff6680]',
    borderClass: 'border-[#ff3355]/45',
  },
  collectibles: {
    label: 'COLLECTIBLES',
    color: '#ffcc00',
    bgClass: 'bg-amber-500/15',
    textClass: 'text-[#ffcc00]',
    borderClass: 'border-[#ffcc00]/45',
  },
};

export const SAMS_FIGURE_PRODUCT_ID = 'fig-sams-crimson-blade';

export const ARMORY_PRODUCTS: ArmoryProduct[] = [
  // A. ACTION FIGURES
  {
    id: SAMS_FIGURE_PRODUCT_ID,
    name: 'SAMS SANIAN AHAMOD — "Crimson Blade" Limited Edition Figure',
    tagline: '12" poseable, LED katana glow',
    category: 'action-figures',
    price: 149.99,
    originalPrice: 189.99,
    badge: '⚡ LEGENDARY',
    rating: 4.9,
    reviewCount: 238,
    stock: 4,
    artKey: 'sams-figure',
    accentColor: '#ff3355',
    loreDescription:
      'Sculpted from telemetry captured during the Second Rift Sealing, this 12-inch guardian figure preserves Sams Sanian Ahamod mid-slash atop a shattered obsidian coliseum tile. Features 32 points of articulation and an internal starlight LED core running along the Crimson Fang blade.',
    specs: {
      dimensions: '12.0 in (30.5 cm) tall · 6.5 in Rift Base',
      materials: 'Die-cast alloy joint frame, PVC/ABS, USB-C LED Katana',
      edition: 'Crimson Void Masterwork #0001–1500',
    },
    reviews: [
      {
        id: 'r1',
        author: 'Ren K.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'The LED katana glow lights up my entire desk shelf. Joint stiffness holds every anime slash pose.',
      },
      {
        id: 'r2',
        author: 'Haruto S.',
        avatarColor: '#ff3355',
        rating: 5,
        comment: 'Details on the crimson haori and cracked rift stone base are museum grade.',
      },
      {
        id: 'r3',
        author: 'Mina T.',
        avatarColor: '#ffcc00',
        rating: 5,
        comment: 'Worth every credit. Feels like owning a piece of Neo-Kyoto history.',
      },
    ],
  },
  {
    id: 'fig-akane-crimson-lily',
    name: 'AKANE "Crimson Lily" HOSHINO Premium Figure',
    tagline: '10", sakura base, swappable faces',
    category: 'action-figures',
    price: 119.99,
    originalPrice: 139.99,
    badge: '🔥 HOT',
    rating: 4.8,
    reviewCount: 182,
    stock: 14,
    artKey: 'akane-figure',
    accentColor: '#ff00aa',
    loreDescription:
      'Captured in mid-leap surrounded by translucent blood-crimson petals, Akane Hoshino stands ready to defend the innocent against Void Council assassins. Includes three interchangeable faceplates and twin glowing sakura daggers.',
    specs: {
      dimensions: '10.0 in (25.4 cm) tall · 5.2 in Translucent Petal Base',
      materials: 'Hand-painted PVC, translucent rose resin effects',
      edition: 'Sector Four Vanguard Series #0412',
    },
    reviews: [
      {
        id: 'r4',
        author: 'Sora Y.',
        avatarColor: '#ff00aa',
        rating: 5,
        comment: 'Swappable battle-cry and calm-assassin expressions snap on cleanly with magnets!',
      },
      {
        id: 'r5',
        author: 'Devon L.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'The translucent sakura swirl under an LED shelf looks unreal.',
      },
      {
        id: 'r6',
        author: 'Aoi N.',
        avatarColor: '#a855f7',
        rating: 4,
        comment: 'Gorgeous sculpt and crisp paint lines on the kimono trim.',
      },
    ],
  },
  {
    id: 'fig-zero-void-shadow',
    name: 'ZERO "The Void" Shadow Figure',
    tagline: '11", glow-in-the-dark, maskable',
    category: 'action-figures',
    price: 134.99,
    badge: '💀 MYTHIC',
    rating: 5.0,
    reviewCount: 94,
    stock: 3,
    artKey: 'zero-figure',
    accentColor: '#a855f7',
    loreDescription:
      'No archive holds Zero’s true face, only fragments of obsidian armor pulsing with ultraviolet rift runes. Phosphorescent Void veins charge under ambient light and radiate eerie violet streaks in darkness, paired with a removable shattered visor.',
    specs: {
      dimensions: '11.0 in (28 cm) tall · Floating Gravity Stand',
      materials: 'UV-reactive Obsidian ABS, smoked acrylic void blades',
      edition: 'Zero-Archive First Print #0077',
    },
    reviews: [
      {
        id: 'r7',
        author: 'Kuro V.',
        avatarColor: '#a855f7',
        rating: 5,
        comment: 'Glow-in-the-dark void runes stay bright for hours after the lights go out.',
      },
      {
        id: 'r8',
        author: 'Elena M.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'The removable mask reveals eerie twin cyan eye slits underneath. Instant 10/10.',
      },
      {
        id: 'r9',
        author: 'Kenji R.',
        avatarColor: '#ffcc00',
        rating: 5,
        comment: 'Pairs menacingly opposite my Sams Sanian Ahamod Crimson Blade figure.',
      },
    ],
  },

  // B. COSTUMES
  {
    id: 'cos-sams-full-set',
    name: 'Sams Sanian Ahamod Full Cosplay Set',
    tagline: 'Haori + hakama + prop katana',
    category: 'costumes',
    price: 249.99,
    originalPrice: 299.99,
    badge: '👑 PREMIUM',
    rating: 4.7,
    reviewCount: 61,
    stock: 9,
    artKey: 'sams-cosplay',
    accentColor: '#ffcc00',
    loreDescription:
      'Tailored in Neo-Kyoto’s ceremonial armor looms, this complete ensemble mirrors the eternal guardian’s battle silhouette. Features gold-embroidered Crimson Void crests across a heavyweight draped haori, pleated combat hakama, and convention-safe crimson prop katana.',
    specs: {
      dimensions: 'Available S–XXL tailored adjustable waist & sash',
      materials: 'Heavyweight matte twill, metallic gold thread, EVA prop blade',
      edition: 'Guardian Ceremonial Tailoring #2187-C',
    },
    reviews: [
      {
        id: 'r10',
        author: 'Taro H.',
        avatarColor: '#ffcc00',
        rating: 5,
        comment: 'Won Best Anime Craftsmanship at our convention — the gold crest embroidery shines!',
      },
      {
        id: 'r11',
        author: 'Chris P.',
        avatarColor: '#ff3355',
        rating: 5,
        comment: 'Fabric has real weight and flows naturally when walking.',
      },
      {
        id: 'r12',
        author: 'Nadia W.',
        avatarColor: '#00ffff',
        rating: 4,
        comment: 'Prop katana scabbard locks nicely onto the obi belt.',
      },
    ],
  },
  {
    id: 'cos-akane-kimono',
    name: 'Akane "Crimson Lily" Combat Kimono',
    tagline: 'Authentic silk blend',
    category: 'costumes',
    price: 189.99,
    badge: '🌸 FAN FAV',
    rating: 4.9,
    reviewCount: 127,
    stock: 16,
    artKey: 'akane-kimono',
    accentColor: '#ff00aa',
    loreDescription:
      'Woven from a breathable crimson-and-obsidian mulberry silk blend, Akane’s combat kimono grants full kick-and-dash mobility without sacrificing traditional elegance. Slit side panels reveal hidden scarlet lining patterned with falling lily blossoms.',
    specs: {
      dimensions: 'Adjustable wrap fit · Obi sash + hairpin included',
      materials: '65% Mulberry Silk, 35% Combat-Weave Satin',
      edition: 'Crimson Lily Artisan Batch #088',
    },
    reviews: [
      {
        id: 'r13',
        author: 'Yuna F.',
        avatarColor: '#ff00aa',
        rating: 5,
        comment: 'Softest silk blend I have ever worn for a full day on the convention floor.',
      },
      {
        id: 'r14',
        author: 'Mei C.',
        avatarColor: '#ffcc00',
        rating: 5,
        comment: 'The hidden lily motif along the inner sleeves is breathtaking.',
      },
      {
        id: 'r15',
        author: 'Lana B.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'Color pops intensely under neon and stage photography.',
      },
    ],
  },
  {
    id: 'cos-void-council-armor',
    name: 'Void Council Battle Armor Replica',
    tagline: 'Wearable resin',
    category: 'costumes',
    price: 329.99,
    originalPrice: 379.99,
    badge: '🛡️ LIMITED',
    rating: 4.6,
    reviewCount: 43,
    stock: 2,
    artKey: 'void-armor',
    accentColor: '#a855f7',
    loreDescription:
      'Forged in the image of the Seven Immortals who raised the floating coliseum, this wearable breastplate and shoulder pauldron rig captures jagged dimensional plating. Internal padded straps keep weight balanced across long arena appearances.',
    specs: {
      dimensions: 'Chest 36–46 in adjustable · 4.2 kg full rig',
      materials: 'Reinforced Urethane Resin, carbon-weave straps, LED chest core',
      edition: 'Council Armory Vault #019 / 100',
    },
    reviews: [
      {
        id: 'r16',
        author: 'Marcus G.',
        avatarColor: '#a855f7',
        rating: 5,
        comment: 'Looks straight off a film set. The chest core pulses purple right out of the box.',
      },
      {
        id: 'r17',
        author: 'Viktor D.',
        avatarColor: '#00ffff',
        rating: 4,
        comment: 'Heavy-duty resin plates with comfortable foam backing inside.',
      },
      {
        id: 'r18',
        author: 'Zane K.',
        avatarColor: '#ff3355',
        rating: 5,
        comment: 'Only 100 made and the serial plate inside the collar feels authentic.',
      },
    ],
  },

  // C. WEAPONS
  {
    id: 'wep-crimson-fang-katana',
    name: '"Crimson Fang" LED Katana',
    tagline: 'Rechargeable, swing-activated',
    category: 'weapons',
    price: 199.99,
    originalPrice: 239.99,
    badge: '⚔️ ICONIC',
    rating: 4.9,
    reviewCount: 156,
    stock: 11,
    artKey: 'crimson-katana',
    accentColor: '#ff3355',
    loreDescription:
      'A full-scale 41-inch replica of Sams Sanian Ahamod’s star-forged katana. Equipped with a motion gyroscope that triggers crimson flash pulses and resonant chime clashes the instant you draw and swing the blade.',
    specs: {
      dimensions: '41.0 in (104 cm) full length · Aluminum hilt',
      materials: 'CNC anodized aluminum tsuba, high-impact polycarbonate LED blade',
      edition: 'Guardian Forge Signature Run #1120',
    },
    reviews: [
      {
        id: 'r19',
        author: 'Dante V.',
        avatarColor: '#ff3355',
        rating: 5,
        comment: 'Swing-activated light sweep reacts instantaneously. Battery lasts all evening.',
      },
      {
        id: 'r20',
        author: 'Riku A.',
        avatarColor: '#ffcc00',
        rating: 5,
        comment: 'That aluminum hilt balance feels just like a real iaito.',
      },
      {
        id: 'r21',
        author: 'Tessa O.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'Three brightness modes plus clash flash — centerpiece of my wall rack.',
      },
    ],
  },
  {
    id: 'wep-akane-sakura-blades',
    name: "Akane's Sakura Blades",
    tagline: 'Twin daggers, pink glow',
    category: 'weapons',
    price: 159.99,
    badge: '🌸 PAIR',
    rating: 4.8,
    reviewCount: 89,
    stock: 18,
    artKey: 'sakura-daggers',
    accentColor: '#ff00aa',
    loreDescription:
      'Dual-wielded neon magenta daggers carried by Akane when she turned her back on the Void Council. Each curved edge conceals high-density pink LED strips etched with micro-engraved sakura veins along the spine.',
    specs: {
      dimensions: '17.5 in (44.5 cm) each · Dual sheath strap included',
      materials: 'Brushed alloy handles, diffused rose acrylic blades',
      edition: 'Crimson Lily Armory Pair #0345',
    },
    reviews: [
      {
        id: 'r22',
        author: 'Kira J.',
        avatarColor: '#ff00aa',
        rating: 5,
        comment: 'The engraved sakura lines glow like real embers in dim rooms.',
      },
      {
        id: 'r23',
        author: 'Samira R.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'Lightweight enough to spin smoothly and sturdy on display stands.',
      },
      {
        id: 'r24',
        author: 'Noah E.',
        avatarColor: '#a855f7',
        rating: 4,
        comment: 'USB-C dual splitter cable charges both daggers at once.',
      },
    ],
  },
  {
    id: 'wep-zero-void-scythe',
    name: "Zero's Void Scythe",
    tagline: '5ft, LED mist effect',
    category: 'weapons',
    price: 279.99,
    originalPrice: 319.99,
    badge: '💀 ULTRA',
    rating: 4.7,
    reviewCount: 38,
    stock: 3,
    artKey: 'void-scythe',
    accentColor: '#a855f7',
    loreDescription:
      'Towering at five feet tall with a modular locking staff, Zero’s dimensional scythe channels an ultrasonic cold-vapor chamber along the crescent edge, bathed in ultraviolet violet LEDs for an unmistakable shadow-rift aura.',
    specs: {
      dimensions: '60.0 in (152 cm) assembled · Breaks down into 3 sections',
      materials: 'Carbon-composite shaft, violet LED crescent, mist atomizer',
      edition: 'Void Vault Ultra Issue #0042',
    },
    reviews: [
      {
        id: 'r25',
        author: 'Lukas Z.',
        avatarColor: '#a855f7',
        rating: 5,
        comment: 'The purple mist pouring off the crescent blade blew away everyone on stage.',
      },
      {
        id: 'r26',
        author: 'Rin K.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'Three-piece screw lock makes transporting a 5ft prop effortless.',
      },
      {
        id: 'r27',
        author: 'Omar S.',
        avatarColor: '#ff3355',
        rating: 4,
        comment: 'Absolute showstopper weapon replica.',
      },
    ],
  },

  // D. COLLECTIBLES
  {
    id: 'col-signed-art-print',
    name: 'Sams Sanian Ahamod Signed Art Print',
    tagline: 'Framed, numbered',
    category: 'collectibles',
    price: 79.99,
    badge: '✍️ SIGNED',
    rating: 5.0,
    reviewCount: 211,
    stock: 22,
    artKey: 'signed-print',
    accentColor: '#ffcc00',
    loreDescription:
      'Archival metallic-ink giclee capturing the guardian’s silhouette before the Seventh Rift eclipse. Hand-numbered and gold-foil stamped inside a brushed obsidian aluminum gallery frame with museum-grade anti-glare acrylic.',
    specs: {
      dimensions: '18 × 24 in framed · Ready-to-hang hardware',
      materials: '310gsm cotton rag metallic paper, obsidian alloy frame',
      edition: 'Guardian Archive #0188 / 500',
    },
    reviews: [
      {
        id: 'r28',
        author: 'Claire D.',
        avatarColor: '#ffcc00',
        rating: 5,
        comment: 'Metallic gold foil accents shimmer dynamically as you walk past the wall.',
      },
      {
        id: 'r29',
        author: 'Leo P.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'Arrived double-boxed with corner armor and certificate of authenticity.',
      },
      {
        id: 'r30',
        author: 'Hana T.',
        avatarColor: '#ff00aa',
        rating: 5,
        comment: 'Zero glare under room lights and super crisp line art.',
      },
    ],
  },
  {
    id: 'col-metal-keychain-set',
    name: 'Crimson Void Metal Keychain Set',
    tagline: '4-piece',
    category: 'collectibles',
    price: 29.99,
    originalPrice: 39.99,
    badge: '🎁 GIFT',
    rating: 4.8,
    reviewCount: 402,
    stock: 48,
    artKey: 'keychain-set',
    accentColor: '#00ffff',
    loreDescription:
      'Four heavy zinc-alloy weapon charms forged as pocket talismans: Sams’s Crimson Katana, Kai’s Thunder Gauntlet, Yuki’s Frost Crest, and Zero’s Shattered Mask. Electroplated with scratch-resistant neon enamel fills.',
    specs: {
      dimensions: '2.4 in average charm length · Collector gift tin',
      materials: 'Die-cast zinc alloy, hard cloisonne enamel, swivel clasps',
      edition: 'Arena Everyday Carry Series',
    },
    reviews: [
      {
        id: 'r31',
        author: 'Jules M.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'Way heavier and sturdier than standard acrylic keychains!',
      },
      {
        id: 'r32',
        author: 'Tariq N.',
        avatarColor: '#ffcc00',
        rating: 5,
        comment: 'Kept the katana on my keys and gifted the other three to my fighting game squad.',
      },
      {
        id: 'r33',
        author: 'Eva W.',
        avatarColor: '#ff3355',
        rating: 4,
        comment: 'Clean metallic presentation box makes it an instant gift.',
      },
    ],
  },
  {
    id: 'col-enamel-pin-collection',
    name: 'The Crimson Void Enamel Pin Collection',
    tagline: '8 pins',
    category: 'collectibles',
    price: 49.99,
    badge: '✨ NEW',
    rating: 4.9,
    reviewCount: 173,
    stock: 30,
    artKey: 'enamel-pins',
    accentColor: '#00ffff',
    loreDescription:
      'Eight hard-enamel insignias representing every fighter and rift seal across Neo-Kyoto’s floating coliseum. Housed in a magnetic velvet-lined display case with dual rubber clutches on every pin.',
    specs: {
      dimensions: '1.3–1.8 in per pin · 8 × 6 in velvet display tray',
      materials: 'Black-nickel plated brass, glow-accent hard enamel',
      edition: 'Season Zero Commemorative Box',
    },
    reviews: [
      {
        id: 'r34',
        author: 'Nora L.',
        avatarColor: '#00ffff',
        rating: 5,
        comment: 'All 8 pins have zero enamel bleed and look incredible pinned on my arcade stick bag.',
      },
      {
        id: 'r35',
        author: 'Benji C.',
        avatarColor: '#ff00aa',
        rating: 5,
        comment: 'The Seventh Seal pin has subtle glow pigment around the runes!',
      },
      {
        id: 'r36',
        author: 'Yuki K.',
        avatarColor: '#ffcc00',
        rating: 5,
        comment: 'The velvet magnetic box sits upright on a shelf straight out of shipping.',
      },
    ],
  },
];
