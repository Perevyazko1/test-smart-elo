import {TouchEvent, useRef, useState} from 'react';

type DoubleTapHandler = (e: TouchEvent<HTMLDivElement>) => void;
type DoubleClickHandler = () => void;


const useDoubleTap = (onDoubleClick?: DoubleClickHandler, delay: number = 300): DoubleTapHandler => {
  const [lastTap, setLastTap] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchEnd: DoubleTapHandler = (e) => {
    if (!onDoubleClick) return;

    e.preventDefault();
    const currentTime = new Date().getTime();
    const delta = currentTime - lastTap;

    if (delta < delay && delta > 0) {
      onDoubleClick();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      timeoutRef.current = setTimeout(() => {
        // обработка одиночного тапа
      }, delay);
    }

    setLastTap(currentTime);
  }

  return handleTouchEnd;
}

export default useDoubleTap;
