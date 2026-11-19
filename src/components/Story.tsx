import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export interface Slide {
  id: string;
  background: string;
  content: ReactNode;
}

const SLIDE_MS = 6000;
const HOLD_MS = 250; // pressing longer than this = "pause", not "tap"

interface Props {
  slides: Slide[];
  index: number;
  onIndexChange: (index: number) => void;
}

/** An Instagram-stories-style player: auto-advance, tap left/right, hold to pause. */
export function Story({ slides, index, onIndexChange }: Props) {
  const [paused, setPaused] = useState(false);
  const pressStart = useRef(0);
  const isLast = index === slides.length - 1;
  const slide = slides[index];

  const next = useCallback(() => {
    if (index < slides.length - 1) onIndexChange(index + 1);
  }, [index, slides.length, onIndexChange]);

  const prev = useCallback(() => {
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const press = () => {
    pressStart.current = performance.now();
    setPaused(true);
  };
  const release = (action: () => void) => {
    setPaused(false);
    if (performance.now() - pressStart.current < HOLD_MS) action();
  };

  return (
    <div className="story" style={{ background: slide.background }}>
      <div className="progress">
        {slides.map((s, i) => (
          <div className="progress-track" key={s.id}>
            <div
              className={`progress-fill${i < index ? ' done' : ''}${i === index ? ' active' : ''}`}
              style={
                i === index
                  ? { animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }
                  : undefined
              }
              onAnimationEnd={i === index ? next : undefined}
            />
          </div>
        ))}
      </div>

      {!isLast && (
        <div className="tap-zones">
          <button
            aria-label="Previous slide"
            onPointerDown={press}
            onPointerUp={() => release(prev)}
            onPointerLeave={() => setPaused(false)}
          />
          <button
            aria-label="Next slide"
            onPointerDown={press}
            onPointerUp={() => release(next)}
            onPointerLeave={() => setPaused(false)}
          />
        </div>
      )}

      {/* key forces a remount, which replays the entrance animations */}
      <div className={`slide${isLast ? ' interactive' : ''}`} key={slide.id}>
        {slide.content}
      </div>
    </div>
  );
}
