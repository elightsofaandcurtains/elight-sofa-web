// Firebase Inquiries Service
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../../firebase.config';
import { Inquiry, InquiryStatus, InquiryNote } from '../../types';

export interface InquiryFilters {
  status?: InquiryStatus;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export class InquiriesService {
  private static readonly COLLECTION = 'inquiries';
  private static readonly NOTES_COLLECTION = 'inquiry_notes';

  // Create new inquiry
  static async createInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isViewed'>) {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...inquiryData,
        status: 'new',
        isViewed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating inquiry:', error);
      throw new Error('Failed to create inquiry');
    }
  }

  // Get all inquiries with filtering
  static async getInquiries(filters: InquiryFilters = {}) {
    try {
      let q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.category && filters.category !== 'All') {
        q = query(q, where('interestArea', '==', filters.category));
      }

      const querySnapshot = await getDocs(q);
      const inquiries: Inquiry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        inquiries.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          viewedAt: data.viewedAt?.toDate?.()?.toISOString(),
          closedAt: data.closedAt?.toDate?.()?.toISOString(),
        } as Inquiry);
      });

      // Client-side filtering for search and date range
      let filtered = inquiries;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(inq =>
          inq.firstName.toLowerCase().includes(searchLower) ||
          inq.lastName.toLowerCase().includes(searchLower) ||
          inq.email.toLowerCase().includes(searchLower) ||
          inq.phone.includes(searchLower) ||
          inq.productName?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.dateFrom) {
        filtered = filtered.filter(inq => new Date(inq.createdAt) >= new Date(filters.dateFrom!));
      }

      if (filters.dateTo) {
        filtered = filtered.filter(inq => new Date(inq.createdAt) <= new Date(filters.dateTo!));
      }

      return filtered;
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      throw new Error('Failed to fetch inquiries');
    }
  }

  // Get single inquiry
  static async getInquiry(inquiryId: string): Promise<Inquiry | null> {
    try {
      const docRef = doc(db, this.COLLECTION, inquiryId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          viewedAt: data.viewedAt?.toDate?.()?.toISOString(),
          closedAt: data.closedAt?.toDate?.()?.toISOString(),
        } as Inquiry;
      }
      return null;
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      throw new Error('Failed to fetch inquiry');
    }
  }

  // Update inquiry status
  static async updateInquiryStatus(inquiryId: string, status: InquiryStatus) {
    try {
      const docRef = doc(db, this.COLLECTION, inquiryId);
      const updates: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'closed') {
        updates.closedAt = serverTimestamp();
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw new Error('Failed to update inquiry status');
    }
  }

  // Mark inquiry as viewed
  static async markAsViewed(inquiryId: string) {
    try {
      const docRef = doc(db, this.COLLECTION, inquiryId);
      await updateDoc(docRef, {
        isViewed: true,
        viewedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking inquiry as viewed:', error);
      throw new Error('Failed to mark inquiry as viewed');
    }
  }

  // Update inquiry
  static async updateInquiry(inquiryId: string, updates: Partial<Inquiry>) {
    try {
      const docRef = doc(db, this.COLLECTION, inquiryId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating inquiry:', error);
      throw new Error('Failed to update inquiry');
    }
  }

  // Delete inquiry
  static async deleteInquiry(inquiryId: string) {
    try {
      const docRef = doc(db, this.COLLECTION, inquiryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      throw new Error('Failed to delete inquiry');
    }
  }

  // Get new inquiries count
  static async getNewInquiriesCount(): Promise<number> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('isViewed', '==', false)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting new inquiries count:', error);
      return 0;
    }
  }

  // Subscribe to new inquiries count (real-time)
  static subscribeToNewInquiriesCount(callback: (count: number) => void): Unsubscribe {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('isViewed', '==', false)
      );

      return onSnapshot(q, 
        (snapshot) => {
          callback(snapshot.size);
        },
        (error) => {
          console.error('Error in real-time inquiry subscription:', error);
          // Return 0 on error to show empty state
          callback(0);
        }
      );
    } catch (error) {
      console.error('Error setting up inquiry subscription:', error);
      // Return a no-op unsubscribe function
      callback(0);
      return () => {};
    }
  }

  // Add internal note
  static async addNote(inquiryId: string, note: string, createdBy: string) {
    try {
      await addDoc(collection(db, this.NOTES_COLLECTION), {
        inquiryId,
        note,
        createdBy,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding note:', error);
      throw new Error('Failed to add note');
    }
  }

  // Get notes for inquiry
  static async getNotes(inquiryId: string): Promise<InquiryNote[]> {
    try {
      const q = query(
        collection(db, this.NOTES_COLLECTION),
        where('inquiryId', '==', inquiryId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notes: InquiryNote[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as InquiryNote);
      });

      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }

  // Get inquiry statistics
  static async getInquiryStats() {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTION));
      
      let total = 0;
      let newCount = 0;
      let inProgress = 0;
      let closed = 0;
      const categoryCount: Record<string, number> = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total++;

        if (data.status === 'new') newCount++;
        else if (data.status === 'in_progress') inProgress++;
        else if (data.status === 'closed') closed++;

        categoryCount[data.interestArea] = (categoryCount[data.interestArea] || 0) + 1;
      });

      return {
        total,
        new: newCount,
        inProgress,
        closed,
        categoryCount
      };
    } catch (error) {
      console.error('Error fetching inquiry stats:', error);
      throw new Error('Failed to fetch inquiry stats');
    }
  }
}
