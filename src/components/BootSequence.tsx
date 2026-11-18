import { useEffect, useState } from 'react';
import { soundEngine } from '../utils/soundEngine';

interface BootSequenceProps {
  skipImmediate: boolean;
  onComplete: () => void;
}

export function BootSequence({ skipImmediate, onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<'black' | 'flash' | 'text' | 'fade' | 'done'>(
    skipImmediate ? 'done' : 'black'
  );

  useEffect(() => {
    if (skipImmediate) {
      onComplete();
      return;
    }

    const t1 = window.setTimeout(() => {
      setPhase('flash');
      soundEngine.play('charge');
    }, 200);

    const t2 = window.setTimeout(() => {
      setPhase('text');
      soundEngine.play('shing');
    }, 550);

    const t3 = window.setTimeout(() => {
      setPhase('fade');
    }, 1850);

    const t4 = window.setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2300);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [skipImmediate, onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      data-testid="boot-sequence"
      role="status"
      aria-label="Crimson Void initialization loader"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#050609] transition-opacity duration-500 ${
        phase === 'fade' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Crimson & Cyan Flash Layer */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,51,85,0.22),rgba(0,255,255,0.1)_40%,transparent_72%)] transition-opacity duration-300 ${
          phase === 'flash' ? 'opacity-100' : 'opacity-40'
        }`}
      />

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-6 text-center">
        {/* Rotating Emblem Loader */}
        <div className="relative mb-7 flex h-20 w-20 items-center justify-center">
          <div
            aria-hidden="true"
            className="animate-conic-aura absolute inset-0 rounded-full border border-[#ff3355]/50 bg-[conic-gradient(from_0deg,rgba(255,51,85,0.45),rgba(0,255,255,0.45),rgba(168,85,247,0.35),rgba(255,51,85,0.45))] p-[2px] blur-[0.5px]"
          />
          <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#07090e] font-display text-lg font-black tracking-widest text-[#00ffff]">
            SSA
          </div>
        </div>

        <p
          className={`font-display text-xl font-black tracking-[0.18em] text-white transition-all duration-500 sm:text-3xl ${
            phase === 'text' || phase === 'fade'
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0'
          }`}
          style={{ textShadow: '0 0 22px rgba(255,51,85,0.6), 0 0 36px rgba(0,255,255,0.3)' }}
        >
          SAMS SANIAN AHAMOD
        </p>

        <p
          className={`mt-2 font-display text-xs font-bold tracking-[0.3em] text-[#00ffff] transition-opacity duration-500 ${
            phase === 'text' || phase === 'fade' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          THE CRIMSON VOID · NEO-KYOTO 2187
        </p>

        {/* Smooth Progress Bar */}
        <div className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-white/10">
          <div className="animate-boot-progress h-full w-full bg-gradient-to-r from-[#ff3355] via-[#a855f7] to-[#00ffff]" />
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.unlock();
            soundEngine.play('click');
            setPhase('done');
            onComplete();
          }}
          className="mt-8 min-h-[40px] cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-5 text-xs font-bold tracking-widest text-cyan-300 transition hover:bg-cyan-400/20 focus-visible:outline-2 focus-visible:outline-[#00ffff]"
        >
          SKIP INTRO
        </button>
      </div>
    </div>
  );
}
