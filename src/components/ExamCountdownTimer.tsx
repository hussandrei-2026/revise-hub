import React from 'react';
import { useExamCountdown } from '../hooks/useExamCountdown';
import './ExamCountdownTimer.css';

interface ExamCountdownTimerProps {
  targetDate?: Date;
  showMotivation?: boolean;
  compact?: boolean;
}

/**
 * Compact countdown timer to UK GCSE exams
 * Minimal version for dashboard - doesn't require scrolling
 */
export const ExamCountdownTimer: React.FC<ExamCountdownTimerProps> = ({ 
  targetDate,
  showMotivation = true,
  compact = true
}) => {
  // Use 2026 dates if not provided
  const defaultTargetDate = new Date('2026-05-18'); // First exams 2026
  const finalDate = targetDate || defaultTargetDate;

  const countdown = useExamCountdown(finalDate);

  // Motivation messages
  const motivationMessages = [
    "You've got this! 💪",
    "Every day counts 📚",
    "Stay focused! 🎯",
    "Your future starts now ✨",
    "One day closer 🚀"
  ];

  const randomMessage = motivationMessages[
    Math.floor(Math.random() * motivationMessages.length)
  ];

  // If exams have started
  if (countdown.isOver) {
    return (
      <div className="exam-countdown-timer compact exam-started">
        <div className="exam-status-compact">
          <span className="status-emoji">📝</span>
          <span className="status-text">GCSEs are here! Good luck! 🍀</span>
        </div>
      </div>
    );
  }

  // Compact version (for dashboard)
  if (compact) {
    return (
      <div className="exam-countdown-timer compact">
        <div className="countdown-compact-header">
          <div className="countdown-compact-info">
            <span className="countdown-icon">⏱️</span>
            <div className="countdown-compact-text">
              <div className="countdown-compact-title">GCSE Exams</div>
              <div className="countdown-compact-time">
                {countdown.days}d {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m
              </div>
            </div>
          </div>
          {showMotivation && <span className="countdown-compact-motivation">{randomMessage}</span>}
        </div>
      </div>
    );
  }

  // Full version (for exam schedule page)
  return (
    <div className="exam-countdown-timer full">
      <div className="countdown-header">
        <h3>⏱️ Time Until GCSE Exams</h3>
        {showMotivation && <p className="motivation">{randomMessage}</p>}
      </div>

      <div className="countdown-display">
        <div className="countdown-unit">
          <div className="countdown-value">{countdown.days}</div>
          <div className="countdown-label">Days</div>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <div className="countdown-value">
            {String(countdown.hours).padStart(2, '0')}
          </div>
          <div className="countdown-label">Hours</div>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <div className="countdown-value">
            {String(countdown.minutes).padStart(2, '0')}
          </div>
          <div className="countdown-label">Minutes</div>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <div className="countdown-value">
            {String(countdown.seconds).padStart(2, '0')}
          </div>
          <div className="countdown-label">Seconds</div>
        </div>
      </div>

      <div className="exam-info">
        <p>📅 First exams: <strong>{finalDate.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
        <p>
          {countdown.days < 90 
            ? '⚠️ Less than 90 days left - time to focus!' 
            : countdown.days < 180
            ? '📚 Half a year to prepare - great time to start!'
            : '✅ Plenty of time to prepare'}
        </p>
      </div>
    </div>
  );
};
