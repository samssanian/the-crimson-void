import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  decimals?: number;
  durationMs?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = '',
  decimals = 2,
  durationMs = 360,
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentRef = useRef(value);

  useEffect(() => {
    const startVal = currentRef.current;
    const endVal = value;
    if (Math.abs(endVal - startVal) < 0.001) {
      setDisplayValue(endVal);
      currentRef.current = endVal;
      return;
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayValue(endVal);
      currentRef.current = endVal;
      return;
    }

    let rafId = 0;
    let startTime: number | null = null;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      window.cancelAnimationFrame(rafId);
      currentRef.current = endVal;
      setDisplayValue(endVal);
    };

    const step = (now: number) => {
      if (finished) return;
      if (startTime === null) {
        startTime = now;
      }
      const elapsed = Math.max(0, now - startTime);
      const t = Math.max(0, Math.min(1, elapsed / durationMs));
      const eased = 1 - Math.pow(1 - t, 3);
      const next = startVal + (endVal - startVal) * eased;
      currentRef.current = next;
      setDisplayValue(next);
      if (t < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        finish();
      }
    };

    rafId = window.requestAnimationFrame(step);
    const fallbackTimer = window.setTimeout(finish, durationMs + 30);
    return () => {
      finished = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(fallbackTimer);
    };
  }, [value, durationMs]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
