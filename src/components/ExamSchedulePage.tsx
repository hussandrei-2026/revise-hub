import React, { useState, useMemo, useEffect } from 'react';
import { GCSE_EXAMS_2026, getAllSubjects, GCSEExam } from '../data/gcseExamSchedule';
import { firestoreService } from '../services/firestore.service';
import { ExamCountdownTimer } from './ExamCountdownTimer';
import './ExamSchedulePage.css';

interface ExamSchedulePageProps {
  userId?: string;
}

interface ExamCountdown {
  [examId: string]: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export const ExamSchedulePage: React.FC<ExamSchedulePageProps> = ({ userId }) => {
  // State
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'subject'>('date');
  const [hideSeconds, setHideSeconds] = useState(false);
  const [addedExams, setAddedExams] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [examsCountdowns, setExamsCountdowns] = useState<ExamCountdown>({});
  const [motivationMessage, setMotivationMessage] = useState('');

  const allSubjects = useMemo(() => getAllSubjects(), []);

  // Set motivation message once (not on every render)
  useEffect(() => {
    const motivationMessages = [
      "You've got this! 💪",
      "Every day counts 📚",
      "Stay focused! 🎯",
      "Your future starts now ✨",
      "One day closer 🚀",
      "Believe in yourself! 🌟",
      "Small steps, big dreams 🎓",
      "You are stronger than you think 💫"
    ];
    setMotivationMessage(
      motivationMessages[Math.floor(Math.random() * motivationMessages.length)]
    );
  }, []); // Only once on mount

  // Update individual exam countdowns every second
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const countdowns: ExamCountdown = {};

      GCSE_EXAMS_2026.forEach(exam => {
        const diff = exam.date.getTime() - now.getTime();
        
        if (diff > 0) {
          countdowns[exam.id] = {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          };
        } else {
          countdowns[exam.id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      });

      setExamsCountdowns(countdowns);
    };

    // Update immediately
    updateCountdowns();

    // Update every second
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter exams
  const filteredExams = useMemo(() => {
    let exams = GCSE_EXAMS_2026;

    // Filter by subject if selected
    if (selectedSubjects.length > 0) {
      exams = exams.filter(exam => selectedSubjects.includes(exam.subject));
    }

    // Sort
    if (sortBy === 'date') {
      exams.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      exams.sort((a, b) => a.subject.localeCompare(b.subject));
    }

    return exams;
  }, [selectedSubjects, sortBy]);

  // Toggle subject filter
  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedSubjects([]);
  };

  // Handle adding exam to calendar
  const handleAddExamToCalendar = async (exam: GCSEExam) => {
    if (!userId) {
      alert('❌ You must be logged in to add events to your calendar');
      return;
    }

    if (addedExams.has(exam.id)) {
      alert('✅ This exam is already in your calendar');
      return;
    }

    setLoading(true);

    try {
      // Create calendar event from exam data
      const event = {
        date: exam.date,
        type: 'exam' as const,
        title: `${exam.subject} - ${exam.paper}`,
        subject: exam.subject,
        description: `⏰ Time: ${exam.time} | ⌛ Duration: ${exam.duration} minutes`
      };

      // Save to Firestore
      await firestoreService.createCalendarEvent(userId, event);

      // Mark as added in UI
      setAddedExams(prev => new Set([...prev, exam.id]));

      // Show success message
      alert(`✅ Added to Calendar!\n${exam.subject} - ${exam.paper}\n📅 ${exam.date.toLocaleDateString('en-GB')}`);

      console.log('Exam added to calendar:', event);

    } catch (error) {
      console.error('Error adding exam to calendar:', error);
      alert('❌ Failed to add event to calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format countdown - using state instead of calculating
  const formatCountdown = (examId: string): string => {
    const countdown = examsCountdowns[examId];
    
    if (!countdown) return '--d, --h, --m, --s';

    if (countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0) {
      return 'Exam in progress';
    }

    if (hideSeconds) {
      return `${countdown.days}d, ${countdown.hours}h, ${countdown.minutes}m`;
    }
    return `${countdown.days}d, ${countdown.hours}h, ${countdown.minutes}m, ${countdown.seconds}s`;
  };

  // Get icon for subject
  const getSubjectIcon = (subject: string): string => {
    switch (subject) {
      case 'Mathematics':
        return '🧮';
      case 'English Language':
      case 'English Literature':
        return '📖';
      case 'Science - Biology':
      case 'Science - Chemistry':
      case 'Science - Physics':
        return '🧪';
      case 'History':
        return '📜';
      case 'Geography':
        return '🌍';
      case 'Art & Design':
      case 'Photography':
        return '🎨';
      default:
        return '📝';
    }
  };

  return (
    <div className="exam-schedule-page">
      {/* Header */}
      <div className="exam-schedule-header">
        <h1>GCSE Exam Countdown 2026</h1>
        <p>Today: {new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Controls */}
      <div className="exam-schedule-controls">
        <div className="controls-left">
          <button 
            className={`control-btn ${hideSeconds ? 'active' : ''}`}
            onClick={() => setHideSeconds(!hideSeconds)}
            title="Hide seconds from countdown"
          >
            🕐 Hide Seconds
          </button>
        </div>

        <div className="controls-center">
          <label className="sort-label">Sort by:</label>
          <button 
            className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
            onClick={() => setSortBy('date')}
          >
            Date ↓
          </button>
          <button 
            className={`sort-btn ${sortBy === 'subject' ? 'active' : ''}`}
            onClick={() => setSortBy('subject')}
          >
            Name ↓
          </button>
        </div>

        <div className="controls-right">
          <button className="download-btn" title="Download calendar file">
            📥 Download Calendar
          </button>
        </div>
      </div>

      {/* Subject Filters */}
      <div className="exam-schedule-filters">
        <div className="quote-section">
          <p className="quote-text">
            "Excellence is the best deterrent to racism or sexism. And that's how I operate my life." - Oprah Winfrey
          </p>
          <p className="quote-hint">Click for a new quote</p>
        </div>

        <div className="subject-filters">
          <div className="subject-filter-title">Filter by Subject:</div>
          <div className="subject-filter-buttons">
            <button 
              className={`subject-filter-btn ${selectedSubjects.length === 0 ? 'active' : ''}`}
              onClick={clearFilters}
            >
              All Subjects
            </button>

            {allSubjects.map(subject => (
              <button
                key={subject}
                className={`subject-filter-btn ${selectedSubjects.includes(subject) ? 'active' : ''}`}
                onClick={() => toggleSubject(subject)}
              >
                {getSubjectIcon(subject)} {subject.replace('Science - ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Countdown */}
      <ExamCountdownTimer 
        compact={false} 
        showMotivation={false}
        targetDate={new Date('2026-05-18')}
      />

      {/* Custom motivation section to replace ExamCountdownTimer motivation */}
      <div className="custom-motivation">
        <p>{motivationMessage}</p>
      </div>

      {/* Exams List */}
      <div className="exam-schedule-list">
        {filteredExams.length > 0 ? (
          <div className="exams-grid">
            {filteredExams.map((exam) => {
              const isAdded = addedExams.has(exam.id);
              
              return (
                <div key={exam.id} className={`exam-card ${isAdded ? 'added' : ''}`}>
                  <div className="exam-card-header">
                    <h3 className="exam-subject">
                      {getSubjectIcon(exam.subject)} {exam.subject}
                    </h3>
                    <p className="exam-paper">{exam.paper}</p>
                  </div>

                  <div className="exam-card-details">
                    <div className="detail-row">
                      <span className="detail-label">📅 Date:</span>
                      <span className="detail-value">
                        {exam.date.toLocaleDateString('en-GB', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">⏰ Time:</span>
                      <span className="detail-value">{exam.time}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">⌛ Duration:</span>
                      <span className="detail-value">{exam.duration} min</span>
                    </div>

                    {exam.tier && (
                      <div className="detail-row">
                        <span className="detail-label">📊 Tier:</span>
                        <span className="detail-value">{exam.tier}</span>
                      </div>
                    )}
                  </div>

                  <div className="exam-countdown">
                    <span className="countdown-label">Time remaining:</span>
                    <span className="countdown-time">{formatCountdown(exam.id)}</span>
                  </div>

                  <button 
                    className={`add-event-btn ${isAdded ? 'added' : ''}`}
                    onClick={() => handleAddExamToCalendar(exam)}
                    disabled={isAdded || loading}
                    title={isAdded ? 'Already added to calendar' : 'Add this exam to your calendar'}
                  >
                    {isAdded ? '✅ Added to Calendar' : '+ Add to Calendar'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No exams found for selected subjects</p>
            <button onClick={clearFilters} className="clear-btn">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="exam-schedule-footer">
        <p>📌 Total exams shown: <strong>{filteredExams.length}</strong></p>
        <p>📅 Exam period: <strong>May 1 - June 20, 2026</strong></p>
        <p>✅ Results day: <strong>August 20, 2026</strong></p>
        <p>💡 Click "Add to Calendar" to populate your exam dates automatically!</p>
      </div>
    </div>
  );
};
