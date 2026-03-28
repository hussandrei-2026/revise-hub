import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, getDoc, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';

export interface PastPaperMetadata {
  subject: string;
  year: number;
  examBoard: string;
  fileSize: number;
  uploadedAt: Date;
  downloadUrl: string;
  fileName: string;
  fileHash?: string; // For deduplication
}

export const storageService = {
  /**
   * Upload a past paper PDF to Cloud Storage and save metadata to Firestore
   */
  async uploadPastPaper(
    userId: string,
    subject: string,
    year: number,
    examBoard: string,
    file: File
  ): Promise<PastPaperMetadata> {
    try {
      // Validate file
      if (file.type !== 'application/pdf') {
        throw new Error('File must be a PDF');
      }
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
      }

      console.log('Starting upload:', { subject, year, examBoard, fileName: file.name });

      // Create unique file path
      const timestamp = new Date().getTime();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `users/${userId}/past-papers/${subject}/${year}/${timestamp}_${sanitizedFileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Upload file with metadata
      const metadata = {
        customMetadata: {
          subject,
          year: year.toString(),
          examBoard,
          uploadedBy: userId
        }
      };

      console.log('Uploading to storage:', storagePath);
      const snapshot = await uploadBytes(storageRef, file, metadata);

      // Get download URL
      console.log('Getting download URL...');
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log('Download URL:', downloadUrl);

      // Create metadata object
      const paperMetadata: PastPaperMetadata = {
        subject,
        year,
        examBoard,
        fileSize: file.size,
        uploadedAt: new Date(),
        downloadUrl,
        fileName: file.name
      };

      // Save metadata to Firestore
      const paperId = `${subject}_${year}_${examBoard}_${timestamp}`;
      const paperRef = doc(db, 'users', userId, 'past-papers', paperId);
      
      console.log('Saving metadata to Firestore:', paperId);
      await setDoc(paperRef, {
        ...paperMetadata,
        uploadedAt: paperMetadata.uploadedAt,
        id: paperId
      });

      console.log('Past paper uploaded successfully');
      return paperMetadata;
    } catch (error: any) {
      console.error('Error uploading past paper:', error);
      throw new Error(error.message || 'Failed to upload past paper');
    }
  },

  /**
   * Get all past papers for a user
   */
  async getPastPapers(userId: string): Promise<any[]> {
    try {
      console.log('Fetching past papers for user:', userId);
      
      const papersRef = collection(db, 'users', userId, 'past-papers');
      const snapshot = await getDocs(papersRef);

      const papers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date(doc.data().uploadedAt)
      }));

      console.log('Retrieved papers:', papers);
      return papers;
    } catch (error: any) {
      console.error('Error fetching past papers:', error);
      throw new Error(error.message || 'Failed to fetch past papers');
    }
  },

  /**
   * Get past papers by subject
   */
  async getPastPapersBySubject(userId: string, subject: string): Promise<any[]> {
    try {
      const papersRef = collection(db, 'users', userId, 'past-papers');
      const q = query(papersRef, where('subject', '==', subject));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date(doc.data().uploadedAt)
      }));
    } catch (error: any) {
      console.error('Error fetching papers by subject:', error);
      throw new Error(error.message || 'Failed to fetch papers');
    }
  },

  /**
   * Get past papers by year
   */
  async getPastPapersByYear(userId: string, year: number): Promise<any[]> {
    try {
      const papersRef = collection(db, 'users', userId, 'past-papers');
      const q = query(papersRef, where('year', '==', year));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date(doc.data().uploadedAt)
      }));
    } catch (error: any) {
      console.error('Error fetching papers by year:', error);
      throw new Error(error.message || 'Failed to fetch papers');
    }
  },

  /**
   * Delete a past paper
   */
  async deletePastPaper(userId: string, paperId: string, downloadUrl: string): Promise<void> {
    try {
      console.log('Deleting past paper:', paperId);

      // Delete from Cloud Storage
      const fileRef = ref(storage, downloadUrl);
      await deleteObject(fileRef);
      console.log('Deleted from storage');

      // Delete metadata from Firestore
      const paperRef = doc(db, 'users', userId, 'past-papers', paperId);
      await deleteDoc(paperRef);
      console.log('Deleted metadata from Firestore');
    } catch (error: any) {
      console.error('Error deleting past paper:', error);
      throw new Error(error.message || 'Failed to delete past paper');
    }
  },

  /**
   * Get storage usage for user
   */
  async getStorageUsage(userId: string): Promise<number> {
    try {
      const papers = await this.getPastPapers(userId);
      return papers.reduce((total, paper) => total + (paper.fileSize || 0), 0);
    } catch (error: any) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  }
};
