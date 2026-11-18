import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

export interface ParticleCanvasHandle {
  burst: (x: number, y: number, count?: number, colors?: string[]) => void;
  confetti: (count?: number) => void;
  goldStorm: (durationMs?: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
}

const DEFAULT_AMBIENT_COLORS = ['#00ffff', '#ff00aa', '#ffcc00', '#a855f7', '#ff3355'];

export const ParticleCanvas = forwardRef<ParticleCanvasHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const goldStormUntilRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    burst(x: number, y: number, count = 40, colors = ['#ffcc00', '#00ffff', '#ff00aa']) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 2 + Math.random() * 4,
          color: colors[i % colors.length],
          alpha: 1,
          decay: 0.015 + Math.random() * 0.018,
          gravity: 0.14,
        });
      }
    },
    confetti(count = 75) {
      const w = window.innerWidth;
      const colors = ['#00ffff', '#ff00aa', '#ffcc00', '#ff3355', '#a855f7'];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * w,
          y: -10 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 6,
          vy: 2 + Math.random() * 6,
          size: 3 + Math.random() * 4,
          color: colors[i % colors.length],
          alpha: 1,
          decay: 0.008 + Math.random() * 0.007,
          gravity: 0.08,
        });
      }
    },
    goldStorm(durationMs = 5000) {
      goldStormUntilRef.current = performance.now() + durationMs;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    };
    window.addEventListener('resize', onResize);

    const loop = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gentle ambient sparks
      if (!prefersReduced && particlesRef.current.length < 48 && Math.random() < 0.25) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -(0.7 + Math.random() * 1.4),
          size: 1.5 + Math.random() * 2.2,
          color: DEFAULT_AMBIENT_COLORS[Math.floor(Math.random() * DEFAULT_AMBIENT_COLORS.length)],
          alpha: 0.75,
          decay: 0.003 + Math.random() * 0.003,
          gravity: -0.004,
        });
      }

      // Ultra Instinct gold storm
      if (now < goldStormUntilRef.current) {
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 5,
            vx: (Math.random() - 0.5) * 2.6,
            vy: -(3 + Math.random() * 5),
            size: 2.5 + Math.random() * 3.5,
            color: i % 2 === 0 ? '#ffcc00' : '#fff3b0',
            alpha: 1,
            decay: 0.012,
            gravity: -0.02,
          });
        }
      }

      const nextList: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha > 0.02 && p.y > -120 && p.y < canvas.height + 120) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          nextList.push(p);
        }
      }
      particlesRef.current = nextList.slice(-360);
      animId = window.requestAnimationFrame(loop);
    };

    animId = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="particle-canvas"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';
