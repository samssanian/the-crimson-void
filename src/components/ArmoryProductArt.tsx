import { ProductArtKey } from '../data/armoryData';

interface ArmoryProductArtProps {
  artKey: ProductArtKey;
  accentColor: string;
  size?: 'card' | 'modal' | 'thumb';
}

export function ArmoryProductArt({
  artKey,
  accentColor,
  size = 'card',
}: ArmoryProductArtProps) {
  const sizeClass =
    size === 'modal'
      ? 'h-56 w-56 sm:h-64 sm:w-64'
      : size === 'thumb'
      ? 'h-14 w-14'
      : 'h-36 w-36';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeClass}`}
      aria-hidden="true"
    >
      {/* Glowing radial backdrop */}
      <div
        className="absolute inset-2 rounded-full opacity-35 blur-xl transition-transform duration-500 group-hover:scale-125"
        style={{ background: accentColor }}
      />

      <svg viewBox="0 0 120 120" className="relative z-10 h-full w-full drop-shadow-[0_0_12px_rgba(0,255,255,0.35)]">
        {artKey === 'sams-figure' && (
          <g>
            {/* Rift Pedestal */}
            <polygon points="22,102 98,102 88,92 32,92" fill="#181c28" stroke="#ff3355" strokeWidth="2" />
            {/* Silhouette Figure */}
            <path d="M46 92 L48 50 L60 44 L72 50 L74 92 Z" fill="#111622" stroke="#00ffff" strokeWidth="2" />
            <path d="M42 56 L30 74 L46 72 Z" fill="#ff3355" opacity="0.85" />
            <circle cx="60" cy="34" r="10" fill="#192030" stroke="#00ffff" strokeWidth="2" />
            <rect x="61" y="32" width="6" height="2.5" fill="#ffcc00" />
            {/* LED Crimson Katana */}
            <line x1="68" y1="62" x2="104" y2="20" stroke="#ff3355" strokeWidth="5" strokeLinecap="round" />
            <line x1="68" y1="62" x2="104" y2="20" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}

        {artKey === 'akane-figure' && (
          <g>
            <ellipse cx="60" cy="100" rx="34" ry="7" fill="#3b0724" stroke="#ff00aa" strokeWidth="2" />
            <path d="M45 96 L50 52 L60 46 L70 52 L75 96 Z" fill="#230b1d" stroke="#ff00aa" strokeWidth="2" />
            <circle cx="60" cy="34" r="10" fill="#1f1422" stroke="#ff88dd" strokeWidth="2" />
            <line x1="34" y1="74" x2="54" y2="48" stroke="#ff00aa" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="86" y1="74" x2="66" y2="48" stroke="#ff00aa" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="32" cy="40" r="4" fill="#fbcfe8" />
            <circle cx="90" cy="36" r="3.5" fill="#f472b6" />
            <circle cx="84" cy="86" r="4" fill="#ff00aa" />
          </g>
        )}

        {artKey === 'zero-figure' && (
          <g>
            <ellipse cx="60" cy="102" rx="30" ry="6" fill="#1e1033" stroke="#a855f7" strokeWidth="2" />
            <path d="M44 96 L42 46 L60 36 L78 46 L76 96 Z" fill="#0d0b16" stroke="#a855f7" strokeWidth="2.2" />
            <circle cx="60" cy="30" r="11" fill="#090710" stroke="#c084fc" strokeWidth="2" />
            {/* Mask Visor Slits */}
            <line x1="53" y1="29" x2="58" y2="30" stroke="#00ffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="62" y1="30" x2="67" y2="29" stroke="#00ffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Void Orb */}
            <circle cx="88" cy="56" r="8" fill="#a855f7" opacity="0.8" />
            <circle cx="88" cy="56" r="4" fill="#ffffff" />
          </g>
        )}

        {artKey === 'sams-cosplay' && (
          <g>
            {/* Draped Haori Coat + Gold Crests */}
            <path d="M36 28 L50 22 L60 30 L70 22 L84 28 L94 60 L82 64 L78 48 L78 96 L42 96 L42 48 L38 64 L26 60 Z" fill="#141824" stroke="#ffcc00" strokeWidth="2.2" />
            <line x1="60" y1="30" x2="60" y2="96" stroke="#ff3355" strokeWidth="3" />
            <circle cx="50" cy="48" r="4.5" fill="none" stroke="#ffcc00" strokeWidth="1.8" />
            <circle cx="70" cy="48" r="4.5" fill="none" stroke="#ffcc00" strokeWidth="1.8" />
            <line x1="26" y1="86" x2="96" y2="66" stroke="#00ffff" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {artKey === 'akane-kimono' && (
          <g>
            <path d="M38 26 L52 22 L60 34 L68 22 L82 26 L94 56 L80 62 L76 46 L82 98 L38 98 L44 46 L40 62 L26 56 Z" fill="#4c0519" stroke="#ff00aa" strokeWidth="2.2" />
            <rect x="42" y="54" width="36" height="10" fill="#ff00aa" opacity="0.85" />
            <circle cx="60" cy="59" r="3.5" fill="#ffcc00" />
            <circle cx="48" cy="80" r="3" fill="#fbcfe8" />
            <circle cx="71" cy="76" r="3" fill="#fbcfe8" />
          </g>
        )}

        {artKey === 'void-armor' && (
          <g>
            {/* Pauldrons + Breastplate */}
            <path d="M18 36 L40 24 L50 38 L70 38 L80 24 L102 36 L94 56 L80 50 L76 92 L60 100 L44 92 L40 50 L26 56 Z" fill="#131122" stroke="#a855f7" strokeWidth="2.4" />
            <polygon points="60,46 70,60 60,74 50,60" fill="#00ffff" opacity="0.85" />
            <polygon points="60,51 66,60 60,69 54,60" fill="#ffffff" />
          </g>
        )}

        {artKey === 'crimson-katana' && (
          <g>
            {/* Glowing Full-Length Katana */}
            <line x1="22" y1="98" x2="40" y2="80" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
            <line x1="36" y1="74" x2="46" y2="84" stroke="#ffcc00" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="42" y1="78" x2="100" y2="20" stroke="#ff3355" strokeWidth="6" strokeLinecap="round" />
            <line x1="42" y1="78" x2="100" y2="20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <path d="M54 44 L66 32 M80 62 L92 50" stroke="#00ffff" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {artKey === 'sakura-daggers' && (
          <g>
            <path d="M24 92 L64 30 L70 36 L34 94 Z" fill="#ff00aa" stroke="#fbcfe8" strokeWidth="1.5" />
            <path d="M96 92 L56 30 L50 36 L86 94 Z" fill="#ff00aa" stroke="#fbcfe8" strokeWidth="1.5" />
            <circle cx="60" cy="64" r="7" fill="#db2777" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        )}

        {artKey === 'void-scythe' && (
          <g>
            {/* 5ft Void Scythe */}
            <line x1="26" y1="104" x2="80" y2="20" stroke="#312e81" strokeWidth="5" strokeLinecap="round" />
            <path d="M78 22 C44 16, 22 34, 18 58 C34 42, 56 38, 80 34 Z" fill="#a855f7" stroke="#00ffff" strokeWidth="2" />
            <circle cx="40" cy="40" r="3" fill="#e9d5ff" />
            <circle cx="28" cy="52" r="2.5" fill="#00ffff" />
          </g>
        )}

        {artKey === 'signed-print' && (
          <g>
            {/* Gallery Frame */}
            <rect x="24" y="16" width="72" height="88" rx="4" fill="#0b0e16" stroke="#ffcc00" strokeWidth="3.5" />
            <rect x="31" y="23" width="58" height="74" fill="#160b1c" stroke="#ff3355" strokeWidth="1.2" />
            <circle cx="60" cy="48" r="14" fill="#ff3355" opacity="0.7" />
            <line x1="40" y1="74" x2="80" y2="34" stroke="#00ffff" strokeWidth="3" strokeLinecap="round" />
            {/* Signature Foil */}
            <path d="M48 86 Q56 80 64 86 T78 84" fill="none" stroke="#ffcc00" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {artKey === 'keychain-set' && (
          <g>
            {/* 4 Metallic Charms */}
            <circle cx="38" cy="38" r="14" fill="#0f172a" stroke="#00ffff" strokeWidth="2.5" />
            <line x1="32" y1="44" x2="44" y2="32" stroke="#ff3355" strokeWidth="3" />
            <circle cx="82" cy="38" r="14" fill="#0f172a" stroke="#ffcc00" strokeWidth="2.5" />
            <polygon points="82,29 88,43 76,43" fill="#ffcc00" />
            <circle cx="38" cy="82" r="14" fill="#0f172a" stroke="#ff00aa" strokeWidth="2.5" />
            <circle cx="38" cy="82" r="5" fill="#ff00aa" />
            <circle cx="82" cy="82" r="14" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5" />
            <rect x="76" y="76" width="12" height="12" fill="#a855f7" />
          </g>
        )}

        {artKey === 'enamel-pins' && (
          <g>
            <rect x="20" y="24" width="80" height="72" rx="8" fill="#111522" stroke="#00ffff" strokeWidth="2.2" />
            {[
              [34, 42, '#ff3355'],
              [51, 42, '#00ffff'],
              [69, 42, '#ffcc00'],
              [86, 42, '#ff00aa'],
              [34, 72, '#a855f7'],
              [51, 72, '#22c55e'],
              [69, 72, '#38bdf8'],
              [86, 72, '#fb7185'],
            ].map(([cx, cy, color], idx) => (
              <g key={idx}>
                <circle cx={cx as number} cy={cy as number} r="8.5" fill={color as string} stroke="#ffffff" strokeWidth="1.2" />
                <circle cx={cx as number} cy={cy as number} r="3" fill="#0a0c0f" />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
