import { useState, useEffect, useRef } from 'react';

export const usePomodoro = () => {
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Always clear existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start new interval if running
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(prevTime => {
          const newTime = prevTime - 1;

          // If time runs out, switch sessions
          if (newTime <= 0) {
            if (isWorkSession) {
              // Work done, start break
              setIsWorkSession(false);
              return 5 * 60; // 5 minute break
            } else {
              // Break done, start work
              setIsWorkSession(true);
              return 25 * 60; // 25 minute work
            }
          }

          return newTime;
        });
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isWorkSession]); // ONLY these two dependencies

  const togglePomodoro = () => {
    // Toggle between running and paused
    setIsRunning(!isRunning);
  };

  const pausePomodoro = () => {
    // Pause: stop running but keep time intact
    setIsRunning(false);
  };

  const resumePomodoro = () => {
    // Resume: continue from current time
    setIsRunning(true);
  };

  const resetPomodoro = () => {
    // Stop and reset everything
    setIsRunning(false);
    setPomodoroTime(25 * 60);
    setIsWorkSession(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    pomodoroActive: isRunning,
    pomodoroTime,
    isWorkSession,
    togglePomodoro,
    pausePomodoro,
    resumePomodoro,
    resetPomodoro,
    formatTime
  };
};
