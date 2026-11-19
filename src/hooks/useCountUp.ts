import { useEffect, useState } from 'react';

/** Animates a number from 0 up to `target` with an ease-out curve. */
export function useCountUp(target: number, durationMs = 1400, delayMs = 300): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      start ??= now + delayMs;
      const t = Math.min(1, Math.max(0, (now - start) / durationMs));
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, delayMs]);

  return value;
}
