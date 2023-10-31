import { useState, useEffect } from 'react';

const useWindowDimensions = (heightEdit: number = 0, widthEdit: number = 0) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth + widthEdit);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight + heightEdit);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth + widthEdit);
      setWindowHeight(window.innerHeight + heightEdit);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [heightEdit, widthEdit]);

  return {
    windowWidth,
    windowHeight
  }
};

export default useWindowDimensions;
