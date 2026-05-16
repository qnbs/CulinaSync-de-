import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

interface WindowSize {
  width: number;
  height: number;
}

const getWindowSize = (): WindowSize => {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState<WindowSize>(() => getWindowSize());
  const debouncedSize = useDebounce(size, 120);

  useEffect(() => {
    const handleResize = () => {
      setSize(getWindowSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return debouncedSize;
};