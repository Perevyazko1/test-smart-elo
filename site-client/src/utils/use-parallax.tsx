import {useRef, useState, useEffect, CSSProperties} from 'react';

interface UseParallaxProps {
  speed?: number;
  maxBlur?: number;
  scale?: number;
  /** тангенс-фактор для «мягкого» clamp */
  clampFactor?: number;
}

export function useParallax({
  speed = 0.1,
  maxBlur = 5,
  scale = 1.2,
  clampFactor = 1.0, // чем больше, тем быстрее «схлопывается» к maxOffset
}: UseParallaxProps = {}) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (!ref.current) return;
      const container = ref.current.parentElement;
      if (!container) return;

      // 1) Определяем высоту контейнера
      const containerRect = container.getBoundingClientRect();
      const containerHeight = containerRect.height;

      // 2) Сырой offset (как будто без ограничений)
      const imageRect = ref.current.getBoundingClientRect();
      const elementTop = imageRect.top;
      const rawOffset = -elementTop * speed;

      // 3) Находим максимально допустимое смещение
      //    Если scale=1.2, "лишняя" высота = (1.2 - 1)*H = 0.2*H
      //    Половина сверху, половина снизу => 0.1*H
      const maxOffset = ((scale - 1) * containerHeight) / 2;

      // 4) «Мягко» зажимаем rawOffset в пределах -maxOffset..maxOffset, используя tanh
      //    ratio = rawOffset / maxOffset => [-∞..+∞]
      //    tanh( ratio * clampFactor ) => [-1..+1]
      //    finalOffset => в пределах [-maxOffset..+maxOffset]
      const ratio = rawOffset / maxOffset;
      const softClampedOffset = maxOffset * Math.tanh(clampFactor * ratio);

      setOffset(softClampedOffset);
      setInitialized(true);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, scale, clampFactor]);

  // Генерируем style: ограниченный offset + фиксированный scale
  const style: CSSProperties = {
    transform: `translateY(${offset}px) scale(${scale})`,
    filter: `blur(${Math.min(Math.abs(offset) / 100, maxBlur)}px)`,
    transformOrigin: 'center',
    willChange: 'transform',
    opacity: initialized ? 1 : 0,
  };

  return { ref, style, initialized };
}
