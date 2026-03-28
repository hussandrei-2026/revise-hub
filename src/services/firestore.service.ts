import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  addDoc,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  email: string;
  displayName: string;
  subjects: string[];
  createdAt: Date;
  lastLogin: Date;
}

export interface UserStats {
  totalStudyHours: number;
  currentStreak: number;
  topicsMastered: number;
  flashcardsReviewed: number;
  badgesEarned: string[];
}

export interface FlashcardDeck {
  title: string;
  subject: string;
  topic: string;
  cardsCount: number;
  createdAt: Date;
}

export interface Flashcard {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date;
  reviewCount: number;
}

export interface CalendarEvent {
  date: Date;
  type: 'exam' | 'revision' | 'pastpaper' | 'note';
  title: string;
  subject?: string;
  description?: string;
}

export const firestoreService = {
  /**
   * Create user profile
   */
  async createUserProfile(uid: string, data: UserProfile) {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...data,
        createdAt: Timestamp.fromDate(data.createdAt),
        lastLogin: Timestamp.fromDate(data.lastLogin)
      });
      console.log('User profile created:', uid);
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      throw new Error(error.message || 'Failed to create user profile');
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || new Date()
        } as UserProfile;
      }
      return null;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      throw new Error(error.message || 'Failed to get user profile');
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    try {
      const updateData: any = { ...data };
      if (data.createdAt) {
        updateData.createdAt = Timestamp.fromDate(data.createdAt);
      }
      if (data.lastLogin) {
        updateData.lastLogin = Timestamp.fromDate(data.lastLogin);
      }
      await updateDoc(doc(db, 'users', uid), updateData);
      console.log('User profile updated:', uid);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw new Error(error.message || 'Failed to update user profile');
    }
  },

  /**
   * Create user stats document
   */
  async createUserStats(uid: string, stats: UserStats) {
    try {
      await setDoc(doc(db, 'users', uid, 'stats', 'current'), stats);
      console.log('User stats created:', uid);
    } catch (error: any) {
      console.error('Error creating user stats:', error);
      throw new Error(error.message || 'Failed to create user stats');
    }
  },

  /**
   * Get user stats
   */
  async getUserStats(uid: string): Promise<UserStats | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid, 'stats', 'current'));
      return docSnap.exists() ? (docSnap.data() as UserStats) : null;
    } catch (error: any) {
      console.error('Error getting user stats:', error);
      throw new Error(error.message || 'Failed to get user stats');
    }
  },

  /**
   * Update user stats
   */
  async updateUserStats(uid: string, stats: Partial<UserStats>) {
    try {
      await updateDoc(doc(db, 'users', uid, 'stats', 'current'), stats);
      console.log('User stats updated:', uid);
    } catch (error: any) {
      console.error('Error updating user stats:', error);
      throw new Error(error.message || 'Failed to update user stats');
    }
  },

  /**
   * Create flashcard deck
   */
  async createFlashcardDeck(uid: string, deckData: Omit<FlashcardDeck, 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'users', uid, 'flashcards'), {
        ...deckData,
        createdAt: Timestamp.now()
      });
      console.log('Flashcard deck created:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating flashcard deck:', error);
      throw new Error(error.message || 'Failed to create flashcard deck');
    }
  },

  /**
   * Get all flashcard decks
   */
  async getFlashcardDecks(uid: string) {
    try {
      const q = query(collection(db, 'users', uid, 'flashcards'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error: any) {
      console.error('Error getting flashcard decks:', error);
      throw new Error(error.message || 'Failed to get flashcard decks');
    }
  },

  /**
   * Update flashcard deck
   */
  async updateFlashcardDeck(
    uid: string,
    deckId: string,
    deckData: Partial<{
      title: string;
      subject: string;
      topic: string;
      cardsCount: number;
    }>
  ) {
    try {
      const updateData: any = {};

      if (deckData.title) updateData.title = deckData.title;
      if (deckData.subject) updateData.subject = deckData.subject;
      if (deckData.topic) updateData.topic = deckData.topic;
      if (deckData.cardsCount !== undefined) updateData.cardsCount = deckData.cardsCount;

      await updateDoc(doc(db, 'users', uid, 'flashcards', deckId), updateData);
      console.log('Flashcard deck updated:', deckId);
    } catch (error: any) {
      console.error('Error updating flashcard deck:', error);
      throw new Error(error.message || 'Failed to update flashcard deck');
    }
  },

  /**
   * Delete flashcard deck
   */
  async deleteFlashcardDeck(uid: string, deckId: string) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'flashcards', deckId));
      console.log('Flashcard deck deleted:', deckId);
    } catch (error: any) {
      console.error('Error deleting flashcard deck:', error);
      throw new Error(error.message || 'Failed to delete flashcard deck');
    }
  },

  /**
   * Add flashcard to deck
   */
  async addFlashcard(uid: string, deckId: string, cardData: Omit<Flashcard, 'lastReviewed'>) {
    try {
      const docRef = await addDoc(
        collection(db, 'users', uid, 'flashcards', deckId, 'cards'),
        {
          ...cardData,
          lastReviewed: Timestamp.now()
        }
      );
      console.log('Flashcard added:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error adding flashcard:', error);
      throw new Error(error.message || 'Failed to add flashcard');
    }
  },

  /**
   * Create calendar event
   */
  async createCalendarEvent(uid: string, eventData: Omit<CalendarEvent, 'date'> & { date: string | Date }) {
    try {
      const date = typeof eventData.date === 'string' ? new Date(eventData.date) : eventData.date;
      const docRef = await addDoc(collection(db, 'users', uid, 'calendar'), {
        ...eventData,
        date: Timestamp.fromDate(date)
      });
      console.log('Calendar event created:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating calendar event:', error);
      throw new Error(error.message || 'Failed to create calendar event');
    }
  },

  /**
   * Get calendar events
   */
  async getCalendarEvents(uid: string) {
    try {
      const q = query(collection(db, 'users', uid, 'calendar'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date()
        };
      });
    } catch (error: any) {
      console.error('Error getting calendar events:', error);
      throw new Error(error.message || 'Failed to get calendar events');
    }
  },

  /**
   * Update calendar event
   */
  async updateCalendarEvent(
    uid: string,
    eventId: string,
    eventData: Partial<{
      title: string;
      date: Date | string;
      type: 'exam' | 'revision' | 'pastpaper' | 'note';
      subject?: string;
      description?: string;
    }>
  ) {
    try {
      const updateData: any = {};

      if (eventData.title) updateData.title = eventData.title;
      if (eventData.type) updateData.type = eventData.type;

      if (eventData.date) {
        const dateObj = typeof eventData.date === 'string'
          ? new Date(eventData.date)
          : eventData.date;
        updateData.date = Timestamp.fromDate(dateObj);
      }

      if (eventData.subject !== undefined) {
        updateData.subject = eventData.subject || null;
      }

      if (eventData.description !== undefined) {
        updateData.description = eventData.description || null;
      }

      await updateDoc(doc(db, 'users', uid, 'calendar', eventId), updateData);
      console.log('Calendar event updated:', eventId);
    } catch (error: any) {
      console.error('Error updating calendar event:', error);
      throw new Error(error.message || 'Failed to update calendar event');
    }
  },

  /**
   * Delete calendar event
   */
  async deleteCalendarEvent(uid: string, eventId: string) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'calendar', eventId));
      console.log('Calendar event deleted:', eventId);
    } catch (error: any) {
      console.error('Error deleting calendar event:', error);
      throw new Error(error.message || 'Failed to delete calendar event');
    }
  },

  // Add to firestoreService object:

  async getPastPapers(uid: string) {
    try {
      const q = query(collection(db, 'users', uid, 'past-papers'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date()
      }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async createPastPaper(uid: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, 'users', uid, 'past-papers'), {
        ...data,
        uploadedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async deletePastPaper(uid: string, paperId: string) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'past-papers', paperId));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};