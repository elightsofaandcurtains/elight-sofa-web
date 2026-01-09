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
    startAfter,
    serverTimestamp,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { InquiryDocument } from '../../types/firebase';

export interface InquiryFilters {
    status?: string;
    interestArea?: string;
    assignedTo?: string;
    dateFrom?: Date;
    dateTo?: Date;
    budgetMin?: number;
    budgetMax?: number;
}

export interface InquiryQueryOptions {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    startAfter?: QueryDocumentSnapshot<DocumentData>;
}

export class InquiriesService {
    private static readonly COLLECTION = 'inquiries';

    // Get all inquiries with filtering and pagination
    static async getInquiries(
        filters: InquiryFilters = {},
        options: InquiryQueryOptions = {}
    ) {
        try {
            let q = query(collection(db, this.COLLECTION));

            // Apply filters
            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }

            if (filters.interestArea) {
                q = query(q, where('interestArea', '==', filters.interestArea));
            }

            if (filters.assignedTo) {
                q = query(q, where('assignedTo', '==', filters.assignedTo));
            }

            if (filters.dateFrom) {
                q = query(q, where('createdAt', '>=', filters.dateFrom));
            }

            if (filters.dateTo) {
                q = query(q, where('createdAt', '<=', filters.dateTo));
            }

            if (filters.budgetMin !== undefined) {
                q = query(q, where('budget', '>=', filters.budgetMin));
            }

            if (filters.budgetMax !== undefined) {
                q = query(q, where('budget', '<=', filters.budgetMax));
            }

            // Apply ordering
            const orderField = options.orderBy || 'createdAt';
            const orderDirection = options.orderDirection || 'desc';
            q = query(q, orderBy(orderField, orderDirection));

            // Apply pagination
            if (options.startAfter) {
                q = query(q, startAfter(options.startAfter));
            }

            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            const querySnapshot = await getDocs(q);
            const inquiries: InquiryDocument[] = [];

            querySnapshot.forEach((doc) => {
                inquiries.push({ id: doc.id, ...doc.data() } as InquiryDocument);
            });

            return {
                inquiries,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore: querySnapshot.docs.length === (options.limit || 50)
            };
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            throw new Error('Failed to fetch inquiries');
        }
    }

    // Get single inquiry by ID
    static async getInquiry(inquiryId: string): Promise<InquiryDocument | null> {
        try {
            const docRef = doc(db, this.COLLECTION, inquiryId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as InquiryDocument;
            }

            return null;
        } catch (error) {
            console.error('Error fetching inquiry:', error);
            throw new Error('Failed to fetch inquiry');
        }
    }

    // Create new inquiry (from contact form)
    static async createInquiry(inquiryData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        interestArea: string;
        budget: number;
        timeline: string;
        message: string;
    }) {
        try {
            const inquiry: Omit<InquiryDocument, 'id'> = {
                ...inquiryData,
                status: 'new',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, this.COLLECTION), inquiry);
            return docRef.id;
        } catch (error) {
            console.error('Error creating inquiry:', error);
            throw new Error('Failed to submit inquiry');
        }
    }

    // Update inquiry
    static async updateInquiry(inquiryId: string, updates: Partial<InquiryDocument>) {
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

    // Assign inquiry to staff member
    static async assignInquiry(inquiryId: string, assignedTo: string) {
        try {
            const docRef = doc(db, this.COLLECTION, inquiryId);
            await updateDoc(docRef, {
                assignedTo,
                status: 'contacted',
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error assigning inquiry:', error);
            throw new Error('Failed to assign inquiry');
        }
    }

    // Update inquiry status
    static async updateInquiryStatus(
        inquiryId: string,
        status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed',
        notes?: string
    ) {
        try {
            const docRef = doc(db, this.COLLECTION, inquiryId);
            const updates: any = {
                status,
                updatedAt: serverTimestamp()
            };

            if (notes) {
                updates.notes = notes;
            }

            await updateDoc(docRef, updates);
        } catch (error) {
            console.error('Error updating inquiry status:', error);
            throw new Error('Failed to update inquiry status');
        }
    }

    // Set follow-up date
    static async setFollowUpDate(inquiryId: string, followUpDate: Date) {
        try {
            const docRef = doc(db, this.COLLECTION, inquiryId);
            await updateDoc(docRef, {
                followUpDate,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error setting follow-up date:', error);
            throw new Error('Failed to set follow-up date');
        }
    }

    // Get inquiries by status
    static async getInquiriesByStatus(status: string) {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const inquiries: InquiryDocument[] = [];

            querySnapshot.forEach((doc) => {
                inquiries.push({ id: doc.id, ...doc.data() } as InquiryDocument);
            });

            return inquiries;
        } catch (error) {
            console.error('Error fetching inquiries by status:', error);
            throw new Error('Failed to fetch inquiries by status');
        }
    }

    // Get inquiries assigned to user
    static async getAssignedInquiries(userId: string) {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('assignedTo', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const inquiries: InquiryDocument[] = [];

            querySnapshot.forEach((doc) => {
                inquiries.push({ id: doc.id, ...doc.data() } as InquiryDocument);
            });

            return inquiries;
        } catch (error) {
            console.error('Error fetching assigned inquiries:', error);
            throw new Error('Failed to fetch assigned inquiries');
        }
    }

    // Get follow-up inquiries (due today or overdue)
    static async getFollowUpInquiries() {
        try {
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today

            const q = query(
                collection(db, this.COLLECTION),
                where('followUpDate', '<=', today),
                where('status', 'in', ['contacted', 'quoted']),
                orderBy('followUpDate', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const inquiries: InquiryDocument[] = [];

            querySnapshot.forEach((doc) => {
                inquiries.push({ id: doc.id, ...doc.data() } as InquiryDocument);
            });

            return inquiries;
        } catch (error) {
            console.error('Error fetching follow-up inquiries:', error);
            throw new Error('Failed to fetch follow-up inquiries');
        }
    }

    // Get inquiry statistics
    static async getInquiryStats() {
        try {
            const q = query(collection(db, this.COLLECTION));
            const querySnapshot = await getDocs(q);

            let totalInquiries = 0;
            let newInquiries = 0;
            let contactedInquiries = 0;
            let quotedInquiries = 0;
            let convertedInquiries = 0;
            let closedInquiries = 0;

            const interestAreaCount: Record<string, number> = {};
            const timelineCount: Record<string, number> = {};
            let totalBudget = 0;

            querySnapshot.forEach((doc) => {
                const inquiry = doc.data() as InquiryDocument;
                totalInquiries++;
                totalBudget += inquiry.budget;

                // Count by status
                switch (inquiry.status) {
                    case 'new': newInquiries++; break;
                    case 'contacted': contactedInquiries++; break;
                    case 'quoted': quotedInquiries++; break;
                    case 'converted': convertedInquiries++; break;
                    case 'closed': closedInquiries++; break;
                }

                // Count by interest area
                interestAreaCount[inquiry.interestArea] = (interestAreaCount[inquiry.interestArea] || 0) + 1;

                // Count by timeline
                timelineCount[inquiry.timeline] = (timelineCount[inquiry.timeline] || 0) + 1;
            });

            const conversionRate = totalInquiries > 0 ? (convertedInquiries / totalInquiries) * 100 : 0;
            const averageBudget = totalInquiries > 0 ? totalBudget / totalInquiries : 0;

            return {
                totalInquiries,
                newInquiries,
                contactedInquiries,
                quotedInquiries,
                convertedInquiries,
                closedInquiries,
                conversionRate,
                averageBudget,
                interestAreaCount,
                timelineCount
            };
        } catch (error) {
            console.error('Error fetching inquiry stats:', error);
            throw new Error('Failed to fetch inquiry stats');
        }
    }

    // Get recent inquiries
    static async getRecentInquiries(limit = 10) {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                orderBy('createdAt', 'desc'),
                limit(limit)
            );

            const querySnapshot = await getDocs(q);
            const inquiries: InquiryDocument[] = [];

            querySnapshot.forEach((doc) => {
                inquiries.push({ id: doc.id, ...doc.data() } as InquiryDocument);
            });

            return inquiries;
        } catch (error) {
            console.error('Error fetching recent inquiries:', error);
            throw new Error('Failed to fetch recent inquiries');
        }
    }

    // Search inquiries by name or email
    static async searchInquiries(searchTerm: string) {
        try {
            // Note: Firestore doesn't support full-text search natively
            // This is a basic implementation. For production, consider using Algolia
            const q = query(
                collection(db, this.COLLECTION),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const inquiries: InquiryDocument[] = [];

            querySnapshot.forEach((doc) => {
                const inquiry = { id: doc.id, ...doc.data() } as InquiryDocument;
                // Client-side filtering for search term
                if (
                    inquiry.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inquiry.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inquiry.phone.includes(searchTerm)
                ) {
                    inquiries.push(inquiry);
                }
            });

            return inquiries;
        } catch (error) {
            console.error('Error searching inquiries:', error);
            throw new Error('Failed to search inquiries');
        }
    }
}