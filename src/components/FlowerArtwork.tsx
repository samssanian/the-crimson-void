import { FlowerSpecies } from '../utils/arenaLogic';

interface FlowerArtworkProps {
  species: FlowerSpecies;
  variant: number;
}

export function FlowerArtwork({ species, variant }: FlowerArtworkProps) {
  const tilt = variant === 0 ? -6 : variant === 1 ? 0 : 6;

  switch (species) {
    case 'rose': {
      const outerFill = variant === 0 ? '#e11d48' : variant === 1 ? '#dc2626' : '#be123c';
      const midFill = variant === 0 ? '#fb7185' : variant === 1 ? '#f43f5e' : '#e11d48';
      const coreFill = '#881337';
      return (
        <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
          <g transform={`rotate(${tilt} 40 40)`}>
            {/* Thorny Stem */}
            <path d="M40 46 L40 74" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M40 57 L35 54 L39 60 Z" fill="#15803d" />
            <path d="M40 65 L45 62 L41 68 Z" fill="#15803d" />
            {/* Leaves */}
            <path d="M40 60 C28 57, 22 50, 25 44 C31 46, 37 52, 40 60 Z" fill="#22c55e" />
            <path d="M40 62 C52 59, 58 52, 55 46 C49 48, 43 54, 40 62 Z" fill="#16a34a" />
            {/* Sepals */}
            <path d="M27 42 L40 48 L53 42 L45 45 L40 42 L35 45 Z" fill="#15803d" />
            {/* Outer Rose Petals */}
            <circle cx="31" cy="30" r="12" fill={outerFill} />
            <circle cx="49" cy="30" r="12" fill={outerFill} />
            <circle cx="40" cy="36" r="13" fill={outerFill} />
            <circle cx="40" cy="23" r="12" fill={outerFill} />
            {/* Mid Spiraling Petals */}
            <circle cx="35" cy="29" r="9" fill={midFill} />
            <circle cx="45" cy="29" r="9" fill={midFill} />
            <circle cx="40" cy="33" r="9" fill={midFill} />
            {/* Rose Swirl Spiral */}
            <circle cx="40" cy="28" r="7.5" fill={coreFill} />
            <path
              d="M40 28 C42 25, 45 27, 43 30 C41 33, 35 32, 35 28 C35 23, 42 21, 46 25"
              fill="none"
              stroke="#fda4af"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );
    }

    case 'sunflower': {
      const petals = Array.from({ length: 12 }, (_, i) => i * 30);
      return (
        <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
          <g transform={`rotate(${tilt} 40 40)`}>
            <path d="M40 44 L40 74" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M40 63 C30 60, 26 54, 29 50 C34 52, 38 56, 40 63 Z" fill="#22c55e" />
            {petals.map((angle) => (
              <ellipse
                key={angle}
                cx="40"
                cy="18"
                rx="4.2"
                ry="11"
                fill="#facc15"
                stroke="#eab308"
                strokeWidth="0.8"
                transform={`rotate(${angle} 40 32)`}
              />
            ))}
            <circle cx="40" cy="32" r="11" fill="#713f12" stroke="#92400e" strokeWidth="2" />
            <circle cx="37" cy="29" r="1.4" fill="#ca8a04" />
            <circle cx="43" cy="30" r="1.4" fill="#ca8a04" />
            <circle cx="40" cy="35" r="1.4" fill="#ca8a04" />
          </g>
        </svg>
      );
    }

    case 'tulip': {
      const cupColor = variant === 0 ? '#fb923c' : variant === 1 ? '#f59e0b' : '#f97316';
      const innerColor = '#fdba74';
      return (
        <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
          <g transform={`rotate(${tilt} 40 40)`}>
            <path d="M40 44 L40 74" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M40 70 C29 63, 25 51, 29 43 C34 49, 38 58, 40 70 Z" fill="#22c55e" />
            <path d="M40 70 C51 63, 55 51, 51 43 C46 49, 42 58, 40 70 Z" fill="#16a34a" />
            {/* Tulip Goblet Cup */}
            <path d="M26 22 C24 38, 32 46, 40 46 C48 46, 56 38, 54 22 C49 27, 45 29, 40 20 C35 29, 31 27, 26 22 Z" fill={cupColor} />
            <path d="M33 24 C35 35, 38 42, 40 44 C42 42, 45 35, 47 24 C44 26, 42 22, 40 16 C38 22, 36 26, 33 24 Z" fill={innerColor} opacity="0.7" />
          </g>
        </svg>
      );
    }

    case 'cherry': {
      const petals = [0, 72, 144, 216, 288];
      return (
        <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
          <g transform={`rotate(${tilt} 40 40)`}>
            <path d="M40 46 L40 74" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            {petals.map((angle) => (
              <path
                key={angle}
                d="M40 34 C33 24, 32 14, 37 13 L40 17 L43 13 C48 14, 47 24, 40 34 Z"
                fill="#fbcfe8"
                stroke="#f472b6"
                strokeWidth="1"
                transform={`rotate(${angle} 40 34)`}
              />
            ))}
            <circle cx="40" cy="34" r="5" fill="#db2777" />
            <circle cx="40" cy="34" r="2" fill="#fde047" />
          </g>
        </svg>
      );
    }

    case 'daisy': {
      const petals = Array.from({ length: 10 }, (_, i) => i * 36);
      return (
        <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
          <g transform={`rotate(${tilt} 40 40)`}>
            <path d="M40 42 L40 74" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M40 62 C50 58, 54 53, 51 49 C46 51, 42 56, 40 62 Z" fill="#22c55e" />
            {petals.map((angle) => (
              <ellipse
                key={angle}
                cx="40"
                cy="18"
                rx="3.8"
                ry="10.5"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                transform={`rotate(${angle} 40 32)`}
              />
            ))}
            <circle cx="40" cy="32" r="8" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
          </g>
        </svg>
      );
    }

    case 'lotus': {
      return (
        <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
          <g transform={`rotate(${tilt} 40 40)`}>
            {/* Lily pad */}
            <ellipse cx="40" cy="60" rx="22" ry="6" fill="#15803d" />
            <path d="M40 60 L54 57 L52 63 Z" fill="#0e121b" />
            {/* Pointed cyan/blue lotus petals */}
            <path d="M40 56 C22 50, 14 38, 17 28 C25 32, 34 42, 40 56 Z" fill="#38bdf8" />
            <path d="M40 56 C58 50, 66 38, 63 28 C55 32, 46 42, 40 56 Z" fill="#38bdf8" />
            <path d="M40 56 C27 44, 24 26, 29 18 C34 25, 38 38, 40 56 Z" fill="#0ea5e9" />
            <path d="M40 56 C53 44, 56 26, 51 18 C46 25, 42 38, 40 56 Z" fill="#0ea5e9" />
            <path d="M40 56 C33 38, 34 20, 40 12 C46 20, 47 38, 40 56 Z" fill="#7dd3fc" />
          </g>
        </svg>
      );
    }

    case 'hibiscus': {
      const petals = [0, 72, 144, 216, 288];
      return (
        <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
          <g transform={`rotate(${tilt} 40 40)`}>
            <path d="M40 48 L40 74" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
            {petals.map((angle) => (
              <ellipse
                key={angle}
                cx="40"
                cy="21"
                rx="10"
                ry="13"
                fill="#c026d3"
                stroke="#e879f9"
                strokeWidth="1"
                transform={`rotate(${angle} 40 34)`}
              />
            ))}
            <circle cx="40" cy="34" r="6" fill="#701a75" />
            <path d="M40 34 L50 18" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="18" r="2.5" fill="#facc15" />
          </g>
        </svg>
      );
    }
  }
}
