// Firebase Products Service - Category-wise Product Inventory Management
// ❌ NO Firebase Storage - Only URL/path for images
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
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

// ==================== TYPES ====================

export type ProductCategory = 'Sofas' | 'Chairs' | 'Tables' | 'Bedroom' | 'Curtains';
export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

// Firebase Document Structure (as per requirement)
export interface FirebaseProduct {
  name: string;
  category: ProductCategory;
  price: number;
  stockQty: number;
  minStock: number;
  material: string;
  imageUrl: string; // Main image URL (first image or explicitly set)
  imageUrls?: string[]; // Array of all product images
  rating?: number;
  reviewsCount?: number;
  status: ProductStatus;
  // Category-specific fields
  sofaType?: string;
  seatingCapacity?: string;
  chairType?: string;
  tableType?: string;
  bedroomType?: string;
  curtainType?: string;
  curtainFabric?: string;
  curtainSize?: string;
  dimensions?: string;
  description?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// App-level Product type (with id)
export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stockQty: number;
  minStock: number;
  material: string;
  imageUrl: string; // Main image (for backwards compatibility)
  imageUrls: string[]; // All product images array
  videoUrls?: string[]; // Product videos array
  mediaOrder?: { url: string; type: 'image' | 'video' }[]; // Ordered media items
  rating: number;
  reviewsCount: number;
  status: ProductStatus;
  // Category-specific fields
  sofaType?: string;
  seatingCapacity?: string;
  sofaSize?: string; // For per-foot pricing (e.g., "8ft" or "8 x 6 ft")
  sofaFootPrice?: number; // Price per foot for Sofa
  chairType?: string;
  tableType?: string;
  bedroomType?: string;
  curtainType?: string;
  curtainFabric?: string;
  curtainSize?: string;
  dimensions?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: ProductCategory | 'All';
  status?: ProductStatus | 'all';
  search?: string;
}

export interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

// ==================== PRODUCT SERVICE CLASS ====================

export class ProductService {
  private static readonly COLLECTION = 'products';

  // ==================== STATUS AUTO CALCULATION (MANDATORY) ====================
  /**
   * Auto-calculate status based on stock quantity and minimum stock
   * - stockQty === 0 → Out of Stock
   * - stockQty > 0 AND stockQty <= minStock → Low Stock
   * - stockQty > minStock → In Stock
   */
  static calculateStatus(stockQty: number, minStock: number): ProductStatus {
    if (stockQty === 0) return 'Out of Stock';
    if (stockQty > 0 && stockQty <= minStock) return 'Low Stock';
    return 'In Stock';
  }

  // ==================== CREATE PRODUCT ====================
  static async createProduct(data: Omit<FirebaseProduct, 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const stockQty = Number(data.stockQty) || 0;
      const minStock = Number(data.minStock) || 5;

      // Debug log incoming data
      console.log('🔥 Creating product - Full incoming data:', JSON.stringify(data, null, 2));
      console.log('🔥 Creating product - Key fields:', {
        sofaSize: (data as any).sofaSize,
        sofaFootPrice: (data as any).sofaFootPrice,
        mediaOrder: (data as any).mediaOrder,
        mediaOrderLength: (data as any).mediaOrder?.length,
        imageUrls: (data as any).imageUrls,
        imageUrlsLength: (data as any).imageUrls?.length,
        videoUrls: (data as any).videoUrls,
        videoUrlsLength: (data as any).videoUrls?.length,
      });

      // Build document data, excluding undefined values
      const docData: Record<string, any> = {
        name: data.name,
        category: data.category,
        price: Number(data.price) || 0,
        stockQty,
        minStock,
        material: data.material,
        imageUrl: data.imageUrl || '',
        rating: Number(data.rating) || 0,
        reviewsCount: Number(data.reviewsCount) || 0,
        status: this.calculateStatus(stockQty, minStock),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Only add optional fields if they have values (not undefined/empty)
      if (data.sofaType) docData.sofaType = data.sofaType;
      if (data.seatingCapacity) docData.seatingCapacity = data.seatingCapacity;
      if ((data as any).sofaSize) docData.sofaSize = (data as any).sofaSize;
      if ((data as any).sofaFootPrice && Number((data as any).sofaFootPrice) > 0) {
        docData.sofaFootPrice = Number((data as any).sofaFootPrice);
      }
      if (data.chairType) docData.chairType = data.chairType;
      if (data.tableType) docData.tableType = data.tableType;
      if (data.bedroomType) docData.bedroomType = data.bedroomType;
      if (data.curtainType) docData.curtainType = data.curtainType;
      if (data.curtainFabric) docData.curtainFabric = data.curtainFabric;
      if (data.curtainSize) docData.curtainSize = data.curtainSize;
      if (data.dimensions) docData.dimensions = data.dimensions;
      if (data.description) docData.description = data.description;
      if ((data as any).imageUrls?.length) docData.imageUrls = (data as any).imageUrls;
      if ((data as any).videoUrls?.length) docData.videoUrls = (data as any).videoUrls;
      if ((data as any).mediaOrder?.length) docData.mediaOrder = (data as any).mediaOrder;

      console.log('Final docData to save:', docData);

      const docRef = await addDoc(collection(db, this.COLLECTION), docData);
      console.log('Product created with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating product:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check if you are logged in as admin.');
      }
      throw error;
    }
  }

  // ==================== GET ALL PRODUCTS ====================
  static async getProducts(filters: ProductFilters = {}): Promise<ProductItem[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));

      let products: ProductItem[] = snapshot.docs.map(doc => this.mapDocToProduct(doc));

      // Apply filters
      if (filters.category && filters.category !== 'All') {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        products = products.filter(p => p.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower) ||
          p.material.toLowerCase().includes(searchLower)
        );
      }

      // Sort by name
      products.sort((a, b) => a.name.localeCompare(b.name));

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // ==================== GET SINGLE PRODUCT ====================
  static async getProduct(id: string): Promise<ProductItem | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        console.log('Raw Firebase data for product:', id, {
          mediaOrder: rawData.mediaOrder,
          sofaSize: rawData.sofaSize,
          sofaFootPrice: rawData.sofaFootPrice,
          imageUrls: rawData.imageUrls,
          videoUrls: rawData.videoUrls
        });
        return this.mapDocToProduct(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // ==================== UPDATE PRODUCT ====================
  static async updateProduct(id: string, updates: Partial<FirebaseProduct>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);

      // Build update data, excluding undefined values
      const finalUpdates: Record<string, any> = { updatedAt: serverTimestamp() };

      // Add only defined values
      if (updates.name !== undefined) finalUpdates.name = updates.name;
      if (updates.category !== undefined) finalUpdates.category = updates.category;
      if (updates.price !== undefined) finalUpdates.price = Number(updates.price);
      if (updates.stockQty !== undefined) finalUpdates.stockQty = Number(updates.stockQty);
      if (updates.minStock !== undefined) finalUpdates.minStock = Number(updates.minStock);
      if (updates.material !== undefined) finalUpdates.material = updates.material;
      if (updates.imageUrl !== undefined) finalUpdates.imageUrl = updates.imageUrl;
      if ((updates as any).imageUrls !== undefined) finalUpdates.imageUrls = (updates as any).imageUrls;
      if ((updates as any).videoUrls !== undefined) finalUpdates.videoUrls = (updates as any).videoUrls;
      if ((updates as any).mediaOrder !== undefined) finalUpdates.mediaOrder = (updates as any).mediaOrder;
      if (updates.rating !== undefined) finalUpdates.rating = Number(updates.rating);
      if (updates.reviewsCount !== undefined) finalUpdates.reviewsCount = Number(updates.reviewsCount);
      if (updates.dimensions !== undefined) finalUpdates.dimensions = updates.dimensions;
      if (updates.description !== undefined) finalUpdates.description = updates.description;

      // Category-specific fields - only add if they have values
      if (updates.sofaType) finalUpdates.sofaType = updates.sofaType;
      if (updates.seatingCapacity) finalUpdates.seatingCapacity = updates.seatingCapacity;
      if ((updates as any).sofaSize) finalUpdates.sofaSize = (updates as any).sofaSize;
      if ((updates as any).sofaFootPrice) finalUpdates.sofaFootPrice = Number((updates as any).sofaFootPrice);
      if (updates.chairType) finalUpdates.chairType = updates.chairType;
      if (updates.tableType) finalUpdates.tableType = updates.tableType;
      if (updates.bedroomType) finalUpdates.bedroomType = updates.bedroomType;
      if (updates.curtainType) finalUpdates.curtainType = updates.curtainType;
      if (updates.curtainFabric) finalUpdates.curtainFabric = updates.curtainFabric;
      if (updates.curtainSize) finalUpdates.curtainSize = updates.curtainSize;

      // Recalculate status if stock or minStock is being updated
      if ('stockQty' in finalUpdates || 'minStock' in finalUpdates) {
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists()) {
          const currentData = currentDoc.data();
          const newStockQty = finalUpdates.stockQty !== undefined ? Number(finalUpdates.stockQty) : Number(currentData.stockQty);
          const newMinStock = finalUpdates.minStock !== undefined ? Number(finalUpdates.minStock) : Number(currentData.minStock);
          finalUpdates.status = this.calculateStatus(newStockQty, newMinStock);
        }
      }

      await updateDoc(docRef, finalUpdates);
      console.log('Product updated:', id);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // ==================== DELETE PRODUCT ====================
  static async deleteProduct(id: string, deleteMedia: boolean = true): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);

      // Get product data first to collect media URLs
      if (deleteMedia) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mediaUrls: string[] = [];

          // Collect all media URLs
          if (data.imageUrl) mediaUrls.push(data.imageUrl);
          if (Array.isArray(data.imageUrls)) mediaUrls.push(...data.imageUrls);
          if (Array.isArray(data.videoUrls)) mediaUrls.push(...data.videoUrls);

          // Filter only GitHub URLs and remove duplicates
          const githubUrls = [...new Set(mediaUrls)].filter(url =>
            url && typeof url === 'string' && url.includes('raw.githubusercontent.com')
          );

          // Delete media from GitHub
          if (githubUrls.length > 0) {
            try {
              const response = await fetch('/api/upload/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: githubUrls }),
              });
              const result = await response.json();
              console.log('Media deletion result:', result);
            } catch (mediaError) {
              console.error('Error deleting media from GitHub:', mediaError);
              // Continue with product deletion even if media deletion fails
            }
          }
        }
      }

      await deleteDoc(docRef);
      console.log('Product deleted:', id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  // ==================== REAL-TIME SUBSCRIPTION ====================
  static subscribeToProducts(callback: (products: ProductItem[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.COLLECTION);
      console.log('Setting up products subscription...');

      return onSnapshot(collectionRef,
        (snapshot) => {
          console.log('Products snapshot received, docs count:', snapshot.docs.length);
          const products = snapshot.docs.map(doc => this.mapDocToProduct(doc));
          products.sort((a, b) => a.name.localeCompare(b.name));
          callback(products);
        },
        (error) => {
          console.error('Error in products subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up products subscription:', error);
      callback([]);
      return () => { };
    }
  }

  // ==================== MAP DOCUMENT TO PRODUCT ====================
  private static mapDocToProduct(doc: any): ProductItem {
    const data = doc.data();
    const stockQty = Number(data.stockQty) || 0;
    const minStock = Number(data.minStock) || 5;

    console.log('📦 mapDocToProduct - Raw Firebase data:', {
      id: doc.id,
      mediaOrder: data.mediaOrder,
      mediaOrderLength: data.mediaOrder?.length,
      sofaSize: data.sofaSize,
      sofaFootPrice: data.sofaFootPrice,
      imageUrls: data.imageUrls,
      videoUrls: data.videoUrls,
    });

    // Build imageUrls array - ensure no duplicates and proper order
    let imageUrls: string[] = [];

    // First, add from imageUrls array if exists
    if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
      imageUrls = [...data.imageUrls].filter(url => url && typeof url === 'string');
    }

    // If imageUrl exists and not already in array, add it as first
    if (data.imageUrl && typeof data.imageUrl === 'string') {
      if (!imageUrls.includes(data.imageUrl)) {
        imageUrls.unshift(data.imageUrl);
      }
    }

    // Remove duplicates while preserving order
    imageUrls = [...new Set(imageUrls)];

    // Determine main image: use imageUrl if set, otherwise first from array
    const mainImage = data.imageUrl || imageUrls[0] || '';

    // Build videoUrls array
    let videoUrls: string[] = [];
    if (Array.isArray(data.videoUrls) && data.videoUrls.length > 0) {
      videoUrls = [...data.videoUrls].filter(url => url && typeof url === 'string');
    }

    // Build mediaOrder array
    let mediaOrder: { url: string; type: 'image' | 'video' }[] = [];
    if (Array.isArray(data.mediaOrder) && data.mediaOrder.length > 0) {
      mediaOrder = data.mediaOrder.filter((m: any) => m && m.url && m.type);
    }

    return {
      id: doc.id,
      name: data.name || '',
      category: data.category || 'Sofas',
      price: Number(data.price) || 0,
      stockQty,
      minStock,
      material: data.material || '',
      imageUrl: mainImage,
      imageUrls: imageUrls,
      videoUrls: videoUrls,
      mediaOrder: mediaOrder,
      rating: Number(data.rating) || 0,
      reviewsCount: Number(data.reviewsCount) || 0,
      status: this.calculateStatus(stockQty, minStock),
      // Category-specific
      sofaType: data.sofaType,
      seatingCapacity: data.seatingCapacity,
      sofaSize: data.sofaSize,
      sofaFootPrice: data.sofaFootPrice ? Number(data.sofaFootPrice) : undefined,
      chairType: data.chairType,
      tableType: data.tableType,
      bedroomType: data.bedroomType,
      curtainType: data.curtainType,
      curtainFabric: data.curtainFabric,
      curtainSize: data.curtainSize,
      dimensions: data.dimensions,
      description: data.description,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }

  // ==================== STATISTICS (FIREBASE ONLY - NO HARDCODED) ====================
  static getProductStats(products: ProductItem[]): ProductStats {
    return {
      total: products.length,
      inStock: products.filter(p => p.status === 'In Stock').length,
      lowStock: products.filter(p => p.status === 'Low Stock').length,
      outOfStock: products.filter(p => p.status === 'Out of Stock').length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stockQty), 0),
    };
  }

  // ==================== GET PRODUCTS BY CATEGORY ====================
  static async getProductsByCategory(category: ProductCategory): Promise<ProductItem[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('category', '==', category)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.mapDocToProduct(doc));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // ==================== GET CATEGORY COUNTS ====================
  static getCategoryCounts(products: ProductItem[]): Record<string, number> {
    const counts: Record<string, number> = {
      All: products.length,
      Sofas: 0,
      Chairs: 0,
      Tables: 0,
      Bedroom: 0,
      Curtains: 0,
    };

    products.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });

    return counts;
  }
}
