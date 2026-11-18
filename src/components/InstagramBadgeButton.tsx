import { INSTAGRAM_PROFILE } from '../data/profileData';
import { soundEngine } from '../utils/soundEngine';

export function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface InstagramBadgeButtonProps {
  label?: string;
  variant?: 'hero' | 'glass' | 'compact';
  className?: string;
}

export function InstagramBadgeButton({
  label = `FOLLOW ${INSTAGRAM_PROFILE.handle}`,
  variant = 'hero',
  className = '',
}: InstagramBadgeButtonProps) {
  const variantClasses =
    variant === 'hero'
      ? 'min-h-[48px] px-6 py-3 border border-[#ff3355]/55 bg-gradient-to-r from-[#ff3355]/20 via-[#ff00aa]/20 to-[#a855f7]/20 text-white shadow-[0_0_24px_rgba(255,0,170,0.28)] hover:border-[#00ffff]/70 hover:shadow-[0_0_32px_rgba(0,255,255,0.4)] hover:-translate-y-0.5'
      : variant === 'glass'
      ? 'min-h-[44px] px-5 py-2.5 border border-[#ff00aa]/45 bg-[#120b18]/80 text-[#ff88dd] hover:border-[#00ffff]/65 hover:text-[#00ffff] hover:shadow-[0_0_24px_rgba(255,0,170,0.3)] hover:-translate-y-0.5'
      : 'h-9 px-3 border border-[#ff00aa]/40 bg-[#ff00aa]/10 text-[#ff88dd] hover:border-[#00ffff]/60 hover:text-[#00ffff]';

  return (
    <a
      href={INSTAGRAM_PROFILE.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={INSTAGRAM_PROFILE.label}
      data-testid={`instagram-link-${variant}`}
      onMouseEnter={() => soundEngine.play('hover')}
      onClick={() => {
        soundEngine.unlock();
        soundEngine.play('sparkle');
      }}
      className={`group font-display relative inline-flex shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-xl text-xs font-extrabold tracking-widest whitespace-nowrap backdrop-blur-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#00ffff] ${variantClasses} ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <InstagramIcon className="h-4 w-4 text-[#ff00aa] transition-transform duration-200 group-hover:scale-110 group-hover:text-[#00ffff]" />
      <span className="relative z-10">{label}</span>
    </a>
  );
}
