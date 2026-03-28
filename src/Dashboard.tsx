import React, { useState, useEffect } from 'react';
import { authService } from './services/auth.service';
import { firestoreService } from './services/firestore.service';
import { usePomodoro } from './hooks/usePomodoro';
import { CreateFlashcardModal } from './components/CreateFlashcardModal';
import { EditFlashcardModal } from './components/EditFlashcardModal';
import { CreateCalendarEventModal } from './components/CreateCalendarEventModal';
import { EditCalendarEventModal } from './components/EditCalendarEventModal';
import { ResourcesTab } from './components/ResourcesTab';
import { PastPapersTab } from './components/PastPapersTab';
import './Dashboard.css';

interface UserStats {
  totalStudyHours: number;
  currentStreak: number;
  topicsMastered: number;
  flashcardsReviewed: number;
  badgesEarned: string[];
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  topic: string;
  cardsCount: number;
  createdAt?: any;
}

interface CalendarEvent {
  id?: string;
  date: string | Date;
  type: 'exam' | 'revision' | 'pastpaper' | 'note';
  title: string;
  subject?: string;
  description?: string;
}

interface DashboardProps {
  userName?: string;
  onLogout?: () => void;
  onThemeToggle?: () => void;
  theme?: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userName: propUserName, 
  onLogout,
  onThemeToggle,
  theme = 'light'
}) => {
  // User data
  const [userName, setUserName] = useState(propUserName || 'Alex');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  
  // User stats
  const [userStats, setUserStats] = useState<UserStats>({
    totalStudyHours: 0,
    currentStreak: 0,
    topicsMastered: 0,
    flashcardsReviewed: 0,
    badgesEarned: []
  });

  const [examsIn] = useState(42);
  const [todayMinutes] = useState(45);
  
  // Pomodoro timer - using the hook now
  const { 
    pomodoroActive, 
    pomodoroTime, 
    isWorkSession, 
    togglePomodoro, 
    pausePomodoro, 
    resumePomodoro, 
    resetPomodoro, 
    formatTime 
  } = usePomodoro();

  // Flashcards - NOW LOADS FROM FIRESTORE ONLY
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  
  // Sample flashcards for display - only when user has no decks
  const [sampleFlashcards] = useState<Flashcard[]>([
    { id: '1', front: 'What is photosynthesis?', back: 'Process by which plants convert sunlight into chemical energy', difficulty: 'easy' },
    { id: '2', front: 'State Newtons First Law', back: 'An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force', difficulty: 'medium' },
    { id: '3', front: 'Define mitosis', back: 'Division of a cell nucleus resulting in two nuclei each having the same number and kind of chromosomes', difficulty: 'medium' }
  ]);

  // Calendar events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'flashcards' | 'calendar' | 'achievements' | 'resources' | 'past-papers' >('dashboard');
  const [loading, setLoading] = useState(true);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showEditFlashcardModal, setShowEditFlashcardModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showEditCalendarModal, setShowEditCalendarModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Load Firebase data on component mount
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setUserId(user.uid);
          setUserEmail(user.email || '');

          // Load user profile from Firestore
          const profile = await firestoreService.getUserProfile(user.uid);
          if (profile) {
            setUserName(profile.displayName || 'User');
          }

          // Load user stats from Firestore
          const stats = await firestoreService.getUserStats(user.uid);
          if (stats) {
            setUserStats(stats);
          }

          // Load flashcard decks from Firestore
          await loadFlashcardDecks(user.uid);

          // Load calendar events from Firestore
          await loadCalendarEvents(user.uid);

          console.log('User data loaded successfully');
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to load flashcard decks
  const loadFlashcardDecks = async (uid: string) => {
    try {
      const decks = await firestoreService.getFlashcardDecks(uid);
      if (decks && decks.length > 0) {
        setFlashcardDecks(decks);
        console.log('Loaded flashcard decks:', decks);
      } else {
        setFlashcardDecks([]);
        console.log('No flashcard decks found');
      }
    } catch (error) {
      console.error('Error loading flashcard decks:', error);
      setFlashcardDecks([]);
    }
  };

  // Function to load calendar events
  const loadCalendarEvents = async (uid: string) => {
    try {
      const events = await firestoreService.getCalendarEvents(uid);
      if (events && events.length > 0) {
        const formattedEvents = events.map((event: any) => ({
          id: event.id,
          date: event.date instanceof Date ? event.date.toISOString().split('T')[0] : event.date,
          type: event.type || 'note',
          title: event.title || 'Event',
          subject: event.subject,
          description: event.description
        }));
        setCalendarEvents([...formattedEvents]);
        console.log('Loaded calendar events:', formattedEvents);
      } else {
        setCalendarEvents([]);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setCalendarEvents([]);
    }
  };

  // Helper functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'var(--color-success)';
      case 'medium':
        return 'var(--color-warning)';
      case 'hard':
        return 'var(--color-danger)';
      default:
        return 'var(--color-primary)';
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await authService.signout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const handleFlashcardCreated = async () => {
    if (userId) {
      await loadFlashcardDecks(userId);
    }
  };

  const handleFlashcardEdit = (deck: FlashcardDeck) => {
    setSelectedDeck(deck);
    setShowEditFlashcardModal(true);
  };

  const handleFlashcardUpdated = async () => {
    if (userId) {
      await loadFlashcardDecks(userId);
    }
  };

  const handleCalendarEventCreated = async () => {
    if (userId) {
      await loadCalendarEvents(userId);
    }
  };

  const handleCalendarEventEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEditCalendarModal(true);
  };

  const handleCalendarEventUpdated = async () => {
    if (userId) {
      await loadCalendarEvents(userId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">⏳ Loading your dashboard...</div>
      </div>
    );
  }

  // Render functions
  const renderDashboardTab = () => (
    <div className="dashboard-content">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h2>Welcome back, {userName}! 👋</h2>
        <p>GCSE exams in {examsIn} days • Keep up your momentum</p>
        {userEmail && <p className="email-text">{userEmail}</p>}
      </div>

      {/* Featured Card - Today's Focus */}
      <div className="featured-card">
        <div className="featured-header">
          <div>
            <div className="featured-label">Today's Study Plan</div>
            <div className="featured-value">{todayMinutes} mins</div>
          </div>
          <div className="featured-icon">📚</div>
        </div>
        <div className="featured-action">
          <button 
            className={`pomodoro-btn ${pomodoroActive ? 'active' : ''}`}
            onClick={togglePomodoro}
          >
            {pomodoroActive ? '⏸ Pause' : '▶ Start'}
          </button>
          {pomodoroActive && (
            <>
              <button 
                className="timer-btn"
                onClick={resumePomodoro}
                title="Resume"
              >
                ▶
              </button>
              <button 
                className="timer-btn"
                onClick={resetPomodoro}
                title="Reset"
              >
                ↻
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pomodoro Timer Display - ALWAYS VISIBLE WHEN RUNNING OR PAUSED */}
      {(pomodoroActive || pomodoroTime < 25 * 60) && (
        <div className={`pomodoro-display ${pomodoroActive ? 'active' : 'paused'}`}>
          <div className="pomodoro-time">{formatTime(pomodoroTime)}</div>
          <div className="pomodoro-session">
            {pomodoroActive ? '🎯 Work Session' : '⏸ Paused'}
          </div>
          {!pomodoroActive && pomodoroTime > 0 && (
            <button 
              className="resume-from-display"
              onClick={resumePomodoro}
              title="Resume timer"
            >
              ▶ Resume
            </button>
          )}
          {pomodoroTime <= 0 && (
            <button 
              className="reset-from-display"
              onClick={resetPomodoro}
              title="Reset timer"
            >
              ↻ Reset
            </button>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Today's Study Session */}
        <div className="stat-card">
          <div className="stat-label">Study time today</div>
          <div className="stat-value">{todayMinutes} mins</div>
          <div className="stat-detail">3 sessions completed</div>
        </div>

        {/* Current Streak */}
        <div className="stat-card streak-card">
          <div className="stat-label">Current Streak 🔥</div>
          <div className="stat-value">{userStats.currentStreak} days</div>
          <div className="stat-detail">Keep it up!</div>
        </div>

        {/* Topics Mastered */}
        <div className="stat-card">
          <div className="stat-label">Topics Mastered</div>
          <div className="stat-value">{userStats.topicsMastered}/48</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${(userStats.topicsMastered / 48) * 100}%`}}
            ></div>
          </div>
        </div>

        {/* Flashcards Reviewed */}
        <div className="stat-card">
          <div className="stat-label">Flashcards</div>
          <div className="stat-value">{userStats.flashcardsReviewed}</div>
          <div className="stat-detail">Cards reviewed</div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="quick-actions-grid">
        <div className="action-card action-flashcards" onClick={() => setActiveTab('flashcards')}>
          <div className="action-icon">📝</div>
          <div className="action-title">Flashcards</div>
          <div className="action-subtitle">{flashcardDecks.length} decks created</div>
        </div>

        <div className="action-card action-pastpapers" onClick={() => setActiveTab('past-papers')}>
          <div className="action-icon">📄</div>
          <div className="action-title">Past Papers</div>
          <div className="action-subtitle">Practice exam papers</div>
        </div>

        <div className="action-card action-calendar" onClick={() => setActiveTab('calendar')}>
          <div className="action-icon">📅</div>
          <div className="action-title">Calendar</div>
          <div className="action-subtitle">{calendarEvents.length} events scheduled</div>
        </div>

        <div className="action-card action-resources" onClick={() => setActiveTab('resources')}>
          <div className="action-icon">🔗</div>
          <div className="action-title">Resources</div>
          <div className="action-subtitle">Maths Genie + 7 more</div>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="upcoming-section">
        <h3>Upcoming Exams</h3>
        <div className="exam-list">
          {calendarEvents
            .filter(e => e.type === 'exam')
            .length > 0 ? (
              calendarEvents
                .filter(e => e.type === 'exam')
                .map((exam, idx) => (
                  <div key={exam.id || idx} className="exam-item clickable" onClick={() => setActiveTab('calendar')} style={{ cursor: 'pointer' }}>
                    <div className="exam-date">{new Date(exam.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</div>
                    <div className="exam-details">
                      <div className="exam-title">{exam.title}</div>
                      <div className="exam-subject">{exam.subject}</div>
                    </div>
                    <div className="exam-days-left">
                      {Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                ))
            ) : (
              <div className="empty-state">
                No upcoming exams. Add some to your calendar!
              </div>
            )}
        </div>
      </div>
    </div>
  );

  const renderFlashcardsTab = () => (
    <div className="flashcards-content">
      <h2>Flashcards</h2>
      
      {/* Show created decks */}
      {flashcardDecks.length > 0 && (
        <div className="decks-section">
          <h3>Your Decks ({flashcardDecks.length})</h3>
          <div className="decks-grid">
            {flashcardDecks.map(deck => (
              <div 
                key={deck.id}
                className="deck-card"
                onClick={() => handleFlashcardEdit(deck)}
              >
                <div className="deck-title">{deck.title}</div>
                <div className="deck-subject">📚 {deck.subject}</div>
                <div className="deck-topic">Topic: {deck.topic}</div>
                <div className="deck-cards">{deck.cardsCount || 0} cards</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show sample cards only if no decks created */}
      {flashcardDecks.length === 0 && (
        <div className="sample-section">
          <h3>Sample Study Cards</h3>
          <div className="flashcards-grid">
            {sampleFlashcards.map((card) => (
              <div 
                key={card.id} 
                className="flashcard" 
                style={{ borderLeftColor: getDifficultyColor(card.difficulty) }}
              >
                <div className="card-difficulty">{card.difficulty.toUpperCase()}</div>
                <div className="card-front">{card.front}</div>
                <div className="card-back">{card.back}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        className="create-btn"
        onClick={() => setShowFlashcardModal(true)}
      >
        + Create New Deck
      </button>

      {showFlashcardModal && (
        <CreateFlashcardModal
          userId={userId}
          onClose={() => setShowFlashcardModal(false)}
          onFlashcardCreated={handleFlashcardCreated}
        />
      )}

      {showEditFlashcardModal && selectedDeck && (
        <EditFlashcardModal
          userId={userId}
          deckId={selectedDeck.id}
          deckTitle={selectedDeck.title}
          deckSubject={selectedDeck.subject}
          deckTopic={selectedDeck.topic}
          onClose={() => {
            setShowEditFlashcardModal(false);
            setSelectedDeck(null);
          }}
          onDeckUpdated={handleFlashcardUpdated}
        />
      )}
    </div>
  );

  const renderCalendarTab = () => (
    <div className="calendar-content">
      <h2>Calendar</h2>
      <div className="calendar-events">
        {calendarEvents.length > 0 ? (
          calendarEvents.map((event, idx) => (
            <div 
              key={event.id || idx} 
              className={`calendar-event event-${event.type}`}
              onClick={() => handleCalendarEventEdit(event)}
            >
              <div className="event-icon">
                {event.type === 'exam' && '📝'}
                {event.type === 'revision' && '📚'}
                {event.type === 'pastpaper' && '📄'}
                {event.type === 'note' && '📌'}
              </div>
              <div className="event-info">
                <div className="event-date">{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                <div className="event-title">{event.title}</div>
                {event.subject && <div className="event-subject">{event.subject}</div>}
                {event.description && <div className="event-description">{event.description}</div>}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            No calendar events yet. Create one to get started!
          </div>
        )}
      </div>
      <button 
        className="create-btn"
        onClick={() => setShowCalendarModal(true)}
      >
        + Add Event
      </button>

      {showCalendarModal && (
        <CreateCalendarEventModal
          userId={userId}
          onClose={() => setShowCalendarModal(false)}
          onEventCreated={handleCalendarEventCreated}
        />
      )}

      {showEditCalendarModal && selectedEvent && (
        <EditCalendarEventModal
          userId={userId}
          eventId={selectedEvent.id || ''}
          eventTitle={selectedEvent.title}
          eventDate={selectedEvent.date}
          eventType={selectedEvent.type}
          eventSubject={selectedEvent.subject}
          eventDescription={selectedEvent.description}
          onClose={() => {
            setShowEditCalendarModal(false);
            setSelectedEvent(null);
          }}
          onEventUpdated={handleCalendarEventUpdated}
        />
      )}
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="achievements-content">
      <h2>Achievements</h2>
      <div className="achievements-grid">
        {userStats.badgesEarned.map((badge) => (
          <div key={badge} className="badge">
            <div className="badge-emoji">🏆</div>
            <div className="badge-name">{badge.replace('_', ' ').toUpperCase()}</div>
          </div>
        ))}
        {userStats.badgesEarned.length === 0 && (
          <div className="badge locked">
            <div className="badge-emoji">🔒</div>
            <div className="badge-name">START STUDYING</div>
          </div>
        )}
        <div className="badge locked">
          <div className="badge-emoji">🔒</div>
          <div className="badge-name">UNLOCK MORE</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📚 ReviseHub</h1>
          <p>GCSE Revision Assistant</p>
        </div>
        <div className="header-right">
          <div className="streak-badge">
            <div className="streak-emoji">🔥</div>
            <div className="streak-text">{userStats.currentStreak} days</div>
          </div>
          {onThemeToggle && (
            <button 
              onClick={onThemeToggle}
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="signout-btn"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
        >
          📝 Flashcards
        </button>
        <button 
          className={`nav-tab ${activeTab === 'past-papers' ? 'active' : ''}`}
          onClick={() => setActiveTab('past-papers')}
        >
          📄 Past Papers
        </button>
        <button 
          className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendar
        </button>
        <button 
          className={`nav-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 Achievements
        </button>
        <button 
          className={`nav-tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          🔗 Resources
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'flashcards' && renderFlashcardsTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
        {activeTab === 'achievements' && renderAchievementsTab()}
        {activeTab === 'resources' && <ResourcesTab userSubjects={['maths', 'physics']} />}
        {activeTab === 'past-papers' && <PastPapersTab userId={userId} />}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Keep studying! You're making great progress. 🎉</p>
      </footer>
    </div>
  );
};

export default Dashboard;
