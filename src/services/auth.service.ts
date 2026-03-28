import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { firestoreService } from './firestore.service';

// Set persistence so users stay logged in
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('Persistence setting failed:', err);
});

export const authService = {
  /**
   * Sign up with email and password
   * Creates user account and initializes Firestore profile
   */
  async signup(email: string, password: string, displayName: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Create user profile in Firestore
      await firestoreService.createUserProfile(user.uid, {
        email,
        displayName,
        subjects: [],
        createdAt: new Date(),
        lastLogin: new Date()
      });

      // Initialize empty stats
      await firestoreService.createUserStats(user.uid, {
        totalStudyHours: 0,
        currentStreak: 0,
        topicsMastered: 0,
        flashcardsReviewed: 0,
        badgesEarned: []
      });

      return user;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  },

  /**
   * Sign in with email and password
   */
  async signin(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      if (result.user) {
        await firestoreService.updateUserProfile(result.user.uid, {
          lastLogin: new Date()
        });
      }

      return result.user;
    } catch (error: any) {
      console.error('Signin error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists, if not create it
      const profile = await firestoreService.getUserProfile(user.uid);
      if (!profile) {
        await firestoreService.createUserProfile(user.uid, {
          email: user.email || '',
          displayName: user.displayName || 'User',
          subjects: [],
          createdAt: new Date(),
          lastLogin: new Date()
        });

        // Initialize empty stats
        await firestoreService.createUserStats(user.uid, {
          totalStudyHours: 0,
          currentStreak: 0,
          topicsMastered: 0,
          flashcardsReviewed: 0,
          badgesEarned: []
        });
      }

      return user;
    } catch (error: any) {
      console.error('Google signin error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  },

  /**
   * Sign out current user
   */
  async signout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Signout error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  /**
   * Get currently logged in user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Listen to authentication state changes
   * Returns unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
