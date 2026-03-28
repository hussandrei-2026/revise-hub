import { useState, useEffect } from 'react';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
}

/**
 * Hook to calculate countdown to a target date
 * Updates every second
 */
export const useExamCountdown = (targetDate: Date): CountdownTime => {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  useEffect(() => {
    // Set initial countdown
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isOver: false
        });
      } else {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOver: true
        });
      }
    };

    // Calculate immediately
    calculateCountdown();

    // Update every second
    const timer = setInterval(calculateCountdown, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [targetDate]);

  return countdown;
};
