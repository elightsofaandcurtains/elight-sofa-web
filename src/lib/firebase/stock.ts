// Firebase Stock Management Service - Real-time Stock Management
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
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

// ==================== TYPES ====================

export type RawMaterialCategory = 'Wood' | 'Foam' | 'Fabric' | 'Hardware' | 'Chemical' | 'Frames';
export type ShopMaterialCategory = 'Cushions' | 'Pillows' | 'Curtains' | 'Covers' | 'Accessories';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface FirebaseRawMaterial {
  name: string;
  category: RawMaterialCategory;
  stockQty: number;
  minQty: number;
  unit: string;
  supplierName: string;
  billNo?: string;
  lastPurchaseDate?: string;
  costPerUnit?: number;
  subCategory?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirebaseShopMaterial {
  productName: string;
  category: ShopMaterialCategory;
  stockQty: number;
  minQty: number;
  unit: string;
  attributes?: {
    color?: string;
    size?: string;
    material?: string;
  };
  price: number;
  createdAt?: any;
  updatedAt?: any;
}

// App-level types (mapped from Firebase)
export interface RawMaterialItem {
  id: string;
  name: string;
  category: RawMaterialCategory;
  stockQty: number;
  minQty: number;
  unit: string;
  supplierName: string;
  billNo?: string;
  lastPurchaseDate?: string;
  costPerUnit?: number;
  subCategory?: string;
  status: StockStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopMaterialItem {
  id: string;
  productName: string;
  category: ShopMaterialCategory;
  stockQty: number;
  minQty: number;
  unit: string;
  attributes?: {
    color?: string;
    size?: string;
    material?: string;
  };
  price: number;
  status: StockStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockFilters {
  category?: string;
  status?: string;
  search?: string;
}

export interface StockStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}


// ==================== STOCK SERVICE CLASS ====================

export class StockService {
  private static readonly RAW_MATERIALS_COLLECTION = 'raw_materials';
  private static readonly SHOP_MATERIALS_COLLECTION = 'shop_materials';

  // ==================== HELPER: Calculate Status ====================
  
  private static calculateStatus(stockQty: number, minQty: number): StockStatus {
    if (stockQty === 0) return 'out_of_stock';
    if (stockQty > 0 && stockQty <= minQty) return 'low_stock';
    return 'in_stock';
  }

  // ==================== RAW MATERIALS CRUD ====================

  // Create raw material
  static async createRawMaterial(data: Omit<FirebaseRawMaterial, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docData = {
        ...data,
        stockQty: Number(data.stockQty) || 0,
        minQty: Number(data.minQty) || 0,
        costPerUnit: Number(data.costPerUnit) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.RAW_MATERIALS_COLLECTION), docData);
      console.log('Raw material created with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating raw material:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check if you are logged in as admin.');
      }
      throw error;
    }
  }

  // Get all raw materials
  static async getRawMaterials(filters: StockFilters = {}): Promise<RawMaterialItem[]> {
    try {
      const snapshot = await getDocs(collection(db, this.RAW_MATERIALS_COLLECTION));
      
      let materials: RawMaterialItem[] = snapshot.docs.map(doc => this.mapDocToRawMaterial(doc));

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        materials = materials.filter(m => m.category === filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        materials = materials.filter(m => m.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        materials = materials.filter(m =>
          m.name.toLowerCase().includes(searchLower) ||
          m.category.toLowerCase().includes(searchLower) ||
          m.supplierName.toLowerCase().includes(searchLower)
        );
      }

      // Sort by name
      materials.sort((a, b) => a.name.localeCompare(b.name));

      return materials;
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      throw new Error('Failed to fetch raw materials');
    }
  }

  // Get single raw material
  static async getRawMaterial(id: string): Promise<RawMaterialItem | null> {
    try {
      const docRef = doc(db, this.RAW_MATERIALS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return this.mapDocToRawMaterial(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching raw material:', error);
      throw new Error('Failed to fetch raw material');
    }
  }

  // Update raw material
  static async updateRawMaterial(id: string, updates: Partial<FirebaseRawMaterial>): Promise<void> {
    try {
      const docRef = doc(db, this.RAW_MATERIALS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating raw material:', error);
      throw error;
    }
  }

  // Delete raw material
  static async deleteRawMaterial(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.RAW_MATERIALS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting raw material:', error);
      throw new Error('Failed to delete raw material');
    }
  }

  // Subscribe to raw materials (real-time)
  static subscribeToRawMaterials(callback: (materials: RawMaterialItem[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.RAW_MATERIALS_COLLECTION);
      console.log('Setting up raw materials subscription...');
      
      return onSnapshot(collectionRef, 
        (snapshot) => {
          console.log('Raw materials snapshot received, docs count:', snapshot.docs.length);
          const materials = snapshot.docs.map(doc => this.mapDocToRawMaterial(doc));
          materials.sort((a, b) => a.name.localeCompare(b.name));
          callback(materials);
        },
        (error) => {
          console.error('Error in raw materials subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up raw materials subscription:', error);
      callback([]);
      return () => {};
    }
  }

  // Map Firestore document to RawMaterialItem
  private static mapDocToRawMaterial(doc: any): RawMaterialItem {
    const data = doc.data();
    const stockQty = Number(data.stockQty) || 0;
    const minQty = Number(data.minQty) || 0;
    
    return {
      id: doc.id,
      name: data.name || '',
      category: data.category || 'Wood',
      stockQty,
      minQty,
      unit: data.unit || 'pieces',
      supplierName: data.supplierName || '',
      billNo: data.billNo,
      lastPurchaseDate: data.lastPurchaseDate,
      costPerUnit: Number(data.costPerUnit) || 0,
      subCategory: data.subCategory,
      status: this.calculateStatus(stockQty, minQty),
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }


  // ==================== SHOP MATERIALS CRUD ====================

  // Create shop material
  static async createShopMaterial(data: Omit<FirebaseShopMaterial, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docData = {
        ...data,
        stockQty: Number(data.stockQty) || 0,
        minQty: Number(data.minQty) || 0,
        price: Number(data.price) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.SHOP_MATERIALS_COLLECTION), docData);
      console.log('Shop material created with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating shop material:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check if you are logged in as admin.');
      }
      throw error;
    }
  }

  // Get all shop materials
  static async getShopMaterials(filters: StockFilters = {}): Promise<ShopMaterialItem[]> {
    try {
      const snapshot = await getDocs(collection(db, this.SHOP_MATERIALS_COLLECTION));
      
      let materials: ShopMaterialItem[] = snapshot.docs.map(doc => this.mapDocToShopMaterial(doc));

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        materials = materials.filter(m => m.category === filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        materials = materials.filter(m => m.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        materials = materials.filter(m =>
          m.productName.toLowerCase().includes(searchLower) ||
          m.category.toLowerCase().includes(searchLower) ||
          (m.attributes?.color?.toLowerCase().includes(searchLower))
        );
      }

      // Sort by name
      materials.sort((a, b) => a.productName.localeCompare(b.productName));

      return materials;
    } catch (error) {
      console.error('Error fetching shop materials:', error);
      throw new Error('Failed to fetch shop materials');
    }
  }

  // Get single shop material
  static async getShopMaterial(id: string): Promise<ShopMaterialItem | null> {
    try {
      const docRef = doc(db, this.SHOP_MATERIALS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return this.mapDocToShopMaterial(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching shop material:', error);
      throw new Error('Failed to fetch shop material');
    }
  }

  // Update shop material
  static async updateShopMaterial(id: string, updates: Partial<FirebaseShopMaterial>): Promise<void> {
    try {
      const docRef = doc(db, this.SHOP_MATERIALS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating shop material:', error);
      throw error;
    }
  }

  // Delete shop material
  static async deleteShopMaterial(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.SHOP_MATERIALS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting shop material:', error);
      throw new Error('Failed to delete shop material');
    }
  }

  // Subscribe to shop materials (real-time)
  static subscribeToShopMaterials(callback: (materials: ShopMaterialItem[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.SHOP_MATERIALS_COLLECTION);
      console.log('Setting up shop materials subscription...');
      
      return onSnapshot(collectionRef, 
        (snapshot) => {
          console.log('Shop materials snapshot received, docs count:', snapshot.docs.length);
          const materials = snapshot.docs.map(doc => this.mapDocToShopMaterial(doc));
          materials.sort((a, b) => a.productName.localeCompare(b.productName));
          callback(materials);
        },
        (error) => {
          console.error('Error in shop materials subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up shop materials subscription:', error);
      callback([]);
      return () => {};
    }
  }

  // Map Firestore document to ShopMaterialItem
  private static mapDocToShopMaterial(doc: any): ShopMaterialItem {
    const data = doc.data();
    const stockQty = Number(data.stockQty) || 0;
    const minQty = Number(data.minQty) || 0;
    
    return {
      id: doc.id,
      productName: data.productName || '',
      category: data.category || 'Cushions',
      stockQty,
      minQty,
      unit: data.unit || 'pieces',
      attributes: data.attributes || {},
      price: Number(data.price) || 0,
      status: this.calculateStatus(stockQty, minQty),
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }

  // ==================== STATISTICS ====================

  // Get raw materials stats
  static getRawMaterialStats(materials: RawMaterialItem[]): StockStats {
    return {
      total: materials.length,
      inStock: materials.filter(m => m.status === 'in_stock').length,
      lowStock: materials.filter(m => m.status === 'low_stock').length,
      outOfStock: materials.filter(m => m.status === 'out_of_stock').length,
    };
  }

  // Get shop materials stats
  static getShopMaterialStats(materials: ShopMaterialItem[]): StockStats {
    return {
      total: materials.length,
      inStock: materials.filter(m => m.status === 'in_stock').length,
      lowStock: materials.filter(m => m.status === 'low_stock').length,
      outOfStock: materials.filter(m => m.status === 'out_of_stock').length,
    };
  }
}
