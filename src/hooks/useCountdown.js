import { useEffect, useState } from 'react';
import { calculateCountdown } from '../utils/weddingLogic.js';

export function useCountdown(targetIso) {
  const [countdown, setCountdown] = useState(() => calculateCountdown(targetIso));

  useEffect(() => {
    let intervalId = null;

    const tick = () => {
      setCountdown(calculateCountdown(targetIso));
    };

    const start = () => {
      tick();
      if (intervalId !== null) window.clearInterval(intervalId);
      intervalId = window.setInterval(tick, 1000);
    };

    const stop = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [targetIso]);

  return countdown;
}
