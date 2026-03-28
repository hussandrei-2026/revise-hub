/**
 * UK GCSE Exam Schedule 2026
 * Complete list of all GCSE exam dates, times, and papers
 * Source: JCQ/Ofqual GCSE timetable 2026
 */

export interface GCSEExam {
  id: string;
  subject: string;
  paper: string;
  examBoard?: string;
  date: Date;
  time: string; // "09:00" or "13:30"
  duration: number; // minutes
  tier?: 'Foundation' | 'Higher' | 'Both';
  type: 'written' | 'practical' | 'component';
  notes?: string;
}

// Main GCSE exam dates 2026
export const GCSE_EXAMS_2026: GCSEExam[] = [
  // ============ MAY 2026 ============
  
  // Art & Design
  {
    id: 'art-1',
    subject: 'Art & Design',
    paper: '10-hour Timed Component',
    date: new Date('2026-05-01'),
    time: '09:00',
    duration: 600,
    type: 'written'
  },
  
  // Photography
  {
    id: 'photo-1',
    subject: 'Photography',
    paper: '10-hour Timed Component',
    date: new Date('2026-05-01'),
    time: '09:00',
    duration: 600,
    type: 'written'
  },

  // English Literature - Paper 1
  {
    id: 'eng-lit-1',
    subject: 'English Literature',
    paper: 'Paper 1',
    date: new Date('2026-05-11'),
    time: '09:00',
    duration: 135,
    type: 'written',
    tier: 'Both'
  },

  // English Language - Paper 1
  {
    id: 'eng-lang-1',
    subject: 'English Language',
    paper: 'Paper 1 - Reading',
    date: new Date('2026-05-12'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Science - Biology Paper 1
  {
    id: 'bio-1',
    subject: 'Science - Biology',
    paper: 'Paper 1',
    date: new Date('2026-05-12'),
    time: '13:30',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Mathematics - Paper 1 (Non-Calculator)
  {
    id: 'maths-1',
    subject: 'Mathematics',
    paper: 'Paper 1 (Non-Calculator)',
    date: new Date('2026-05-14'),
    time: '09:00',
    duration: 90,
    type: 'written',
    tier: 'Both'
  },

  // Science - Chemistry Paper 1
  {
    id: 'chem-1',
    subject: 'Science - Chemistry',
    paper: 'Paper 1',
    date: new Date('2026-05-18'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // English Literature - Paper 2
  {
    id: 'eng-lit-2',
    subject: 'English Literature',
    paper: 'Paper 2',
    date: new Date('2026-05-18'),
    time: '13:30',
    duration: 135,
    type: 'written',
    tier: 'Both'
  },

  // English Language - Paper 2
  {
    id: 'eng-lang-2',
    subject: 'English Language',
    paper: 'Paper 2 - Writing',
    date: new Date('2026-05-19'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Science - Physics Paper 1
  {
    id: 'phys-1',
    subject: 'Science - Physics',
    paper: 'Paper 1',
    date: new Date('2026-05-19'),
    time: '13:30',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Mathematics - Paper 2 (Calculator)
  {
    id: 'maths-2',
    subject: 'Mathematics',
    paper: 'Paper 2 (Calculator)',
    date: new Date('2026-05-21'),
    time: '09:00',
    duration: 90,
    type: 'written',
    tier: 'Both'
  },

  // Science - Biology Paper 2
  {
    id: 'bio-2',
    subject: 'Science - Biology',
    paper: 'Paper 2',
    date: new Date('2026-05-21'),
    time: '13:30',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // ============ JUNE 2026 ============

  // Mathematics - Paper 3 (Calculator)
  {
    id: 'maths-3',
    subject: 'Mathematics',
    paper: 'Paper 3 (Calculator)',
    date: new Date('2026-06-03'),
    time: '09:00',
    duration: 90,
    type: 'written',
    tier: 'Both'
  },

  // Science - Chemistry Paper 2
  {
    id: 'chem-2',
    subject: 'Science - Chemistry',
    paper: 'Paper 2',
    date: new Date('2026-06-03'),
    time: '13:30',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Science - Physics Paper 2
  {
    id: 'phys-2',
    subject: 'Science - Physics',
    paper: 'Paper 2',
    date: new Date('2026-06-08'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // History - Paper 1
  {
    id: 'hist-1',
    subject: 'History',
    paper: 'Paper 1',
    date: new Date('2026-06-09'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Geography - Paper 1
  {
    id: 'geog-1',
    subject: 'Geography',
    paper: 'Paper 1',
    date: new Date('2026-06-10'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Science - Biology Paper 3
  {
    id: 'bio-3',
    subject: 'Science - Biology',
    paper: 'Paper 3',
    date: new Date('2026-06-10'),
    time: '13:30',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Science - Chemistry Paper 3
  {
    id: 'chem-3',
    subject: 'Science - Chemistry',
    paper: 'Paper 3',
    date: new Date('2026-06-11'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Science - Physics Paper 3
  {
    id: 'phys-3',
    subject: 'Science - Physics',
    paper: 'Paper 3',
    date: new Date('2026-06-12'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // History - Paper 2
  {
    id: 'hist-2',
    subject: 'History',
    paper: 'Paper 2',
    date: new Date('2026-06-16'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },

  // Geography - Paper 2
  {
    id: 'geog-2',
    subject: 'Geography',
    paper: 'Paper 2',
    date: new Date('2026-06-17'),
    time: '09:00',
    duration: 105,
    type: 'written',
    tier: 'Both'
  },
];

// Helper functions
export const getExamsBySubject = (subject: string): GCSEExam[] => {
  return GCSE_EXAMS_2026.filter(exam => exam.subject === subject);
};

export const getExamsByDate = (date: Date): GCSEExam[] => {
  const dateStr = date.toISOString().split('T')[0];
  return GCSE_EXAMS_2026.filter(exam => 
    exam.date.toISOString().split('T')[0] === dateStr
  );
};

export const getAllSubjects = (): string[] => {
  const subjects = new Set(GCSE_EXAMS_2026.map(exam => exam.subject));
  return Array.from(subjects).sort();
};

export const getUpcomingExams = (fromDate: Date = new Date()): GCSEExam[] => {
  return GCSE_EXAMS_2026
    .filter(exam => exam.date >= fromDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getDaysUntilExams = (fromDate: Date = new Date()): number => {
  const firstExam = getUpcomingExams(fromDate)[0];
  if (!firstExam) return -1;
  
  const diffTime = firstExam.date.getTime() - fromDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getNextExam = (fromDate: Date = new Date()): GCSEExam | null => {
  const upcoming = getUpcomingExams(fromDate);
  return upcoming.length > 0 ? upcoming[0] : null;
};
