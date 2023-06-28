import React, { useRef, useState, useEffect } from 'react';

interface ComponentWidth {
  width: number;
  ref: React.RefObject<HTMLDivElement>;
}

const useDivWidth = (): ComponentWidth => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }

      if (entries[0].target instanceof HTMLDivElement) {
        setWidth(entries[0].target.offsetWidth);
      }
    };

    const observer = new ResizeObserver(handleResize);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return { width, ref };
};

export default useDivWidth;
