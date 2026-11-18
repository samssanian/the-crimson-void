import { useEffect, useState } from 'react';
import { Menu, X, Volume2, VolumeX, Music } from 'lucide-react';
import { INSTAGRAM_PROFILE } from '../data/profileData';
import { soundEngine } from '../utils/soundEngine';
import { InstagramIcon } from './InstagramBadgeButton';

interface NavbarProps {
  muted: boolean;
  musicPlaying: boolean;
  unreadCount: number;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onLogoClick: () => void;
}

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Legend', href: '#legend' },
  { label: 'Fighters', href: '#fighters' },
  { label: 'Battles', href: '#battles' },
  { label: 'Armory', href: '#armory' },
  { label: 'Arena', href: '#prophecy' },
  { label: 'Contact', href: '#contact' },
  { label: 'Admin', href: '#admin' },
];

export function Navbar({
  muted,
  musicPlaying,
  unreadCount,
  onToggleMute,
  onToggleMusic,
  onLogoClick,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / scrollable)));
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#ff3355]/20 bg-[#07090d]/88 backdrop-blur-xl">
      {/* Scroll Progress Hairline */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full origin-left bg-gradient-to-r from-[#ff3355] via-[#a855f7] to-[#00ffff] transition-transform duration-150"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        {/* Logo (Click 5x Easter Egg) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.unlock();
            onLogoClick();
          }}
          onMouseEnter={() => soundEngine.play('hover')}
          className="font-display min-w-0 cursor-pointer truncate text-left text-[11px] font-black tracking-normal text-white transition hover:text-[#00ffff] focus-visible:outline-2 focus-visible:outline-[#00ffff] sm:shrink-0 sm:text-sm sm:tracking-wider xl:text-base"
          style={{ textShadow: '0 0 14px rgba(255, 51, 85, 0.55), 0 0 24px rgba(0, 255, 255, 0.35)' }}
          aria-label="Sams Sanian Ahamod emblem"
        >
          ⚡ <span className="text-[#00ffff]">SAMS SANIAN</span>{' '}
          <span className="text-[#ff3355]">AHAMOD</span> ⚡
        </button>

        {/* Desktop Nav */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-3.5 lg:flex xl:gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => {
                soundEngine.unlock();
                soundEngine.play('click');
              }}
              onMouseEnter={() => soundEngine.play('hover')}
              className="group relative whitespace-nowrap shrink-0 py-1 text-xs font-semibold tracking-wide text-slate-200 transition hover:text-[#00ffff] focus-visible:outline-2 focus-visible:outline-[#00ffff] xl:text-sm"
            >
              {link.label}
              {link.label === 'Admin' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded bg-[#ff00aa] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                  {unreadCount}
                </span>
              )}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-0.5 h-[2px] origin-center scale-x-0 rounded-full bg-gradient-to-r from-[#ff3355] to-[#00ffff] transition-transform duration-200 group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        {/* Official Instagram + Audio Toggles + Mobile Menu Trigger */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href={INSTAGRAM_PROFILE.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={INSTAGRAM_PROFILE.label}
            title={`Follow ${INSTAGRAM_PROFILE.handle} on Instagram`}
            data-testid="navbar-instagram-link"
            onMouseEnter={() => soundEngine.play('hover')}
            onClick={() => {
              soundEngine.unlock();
              soundEngine.play('sparkle');
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ff00aa]/45 bg-[#ff00aa]/10 text-[#ff88dd] transition hover:scale-105 hover:border-[#00ffff]/70 hover:text-[#00ffff] hover:shadow-[0_0_16px_rgba(255,0,170,0.4)] focus-visible:outline-2 focus-visible:outline-[#00ffff] sm:h-10 sm:w-10"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              onToggleMute();
            }}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={!muted}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-xs font-bold tracking-wider transition focus-visible:outline-2 focus-visible:outline-[#00ffff] sm:h-10 sm:w-auto sm:px-3 ${
              muted
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                : 'border-cyan-400/40 bg-cyan-500/10 text-[#00ffff] hover:bg-cyan-500/20'
            }`}
          >
            {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{muted ? '🔇' : '🔊'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              onToggleMusic();
            }}
            aria-label={musicPlaying ? 'Stop battle music' : 'Play battle music'}
            aria-pressed={musicPlaying}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-xs font-bold tracking-wider transition focus-visible:outline-2 focus-visible:outline-[#ff00aa] sm:h-10 sm:w-auto sm:px-3 ${
              musicPlaying
                ? 'border-[#ff00aa]/60 bg-[#ff00aa]/20 text-[#ff88dd] shadow-[0_0_12px_rgba(255,0,170,0.35)]'
                : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-[#ff00aa]/50 hover:text-white'
            }`}
          >
            <Music className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{musicPlaying ? '🎵 ON' : '🔕 OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.play('click');
              setMobileOpen((prev) => !prev);
            }}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-cyan-500/30 bg-slate-900/80 text-cyan-300 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-cyan-500/20 bg-[#07090d]/96 px-4 py-4 backdrop-blur-xl lg:hidden"
        >
          <div className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  soundEngine.play('click');
                  setMobileOpen(false);
                }}
                className="flex min-h-[44px] items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-100 hover:border-cyan-400/50 hover:text-[#00ffff]"
              >
                <span>{link.label}</span>
                {link.label === 'Admin' && unreadCount > 0 && (
                  <span className="rounded bg-[#ff00aa] px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </a>
            ))}
          </div>

          <a
            href={INSTAGRAM_PROFILE.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              soundEngine.play('sparkle');
              setMobileOpen(false);
            }}
            className="font-display mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#ff00aa]/50 bg-gradient-to-r from-[#ff3355]/20 to-[#ff00aa]/20 px-4 text-xs font-bold tracking-widest text-white"
          >
            <InstagramIcon className="h-4 w-4 text-[#ff88dd]" />
            <span>FOLLOW {INSTAGRAM_PROFILE.handle}</span>
          </a>
        </nav>
      )}
    </header>
  );
}
