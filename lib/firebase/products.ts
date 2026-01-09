// Firebase Products Service
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
    DocumentData,
    writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { ProductDocument } from '../../types/firebase';

export interface ProductFilters {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    status?: string;
    material?: string;
    search?: string;
    // Category-specific filters
    sofaType?: string;
    chairType?: string;
    tableType?: string;
    bedroomType?: string;
    curtainType?: string;
}

export interface ProductQueryOptions {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    startAfter?: QueryDocumentSnapshot<DocumentData>;
}

export class ProductsService {
    private static readonly COLLECTION = 'products';

    // Get all products with filtering and pagination
    static async getProducts(
        filters: ProductFilters = {},
        options: ProductQueryOptions = {}
    ) {
        try {
            let q = query(collection(db, this.COLLECTION));

            // Apply filters
            if (filters.category && filters.category !== 'All') {
                q = query(q, where('category', '==', filters.category));
            }

            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }

            if (filters.material && filters.material !== 'All') {
                q = query(q, where('material', '==', filters.material));
            }

            // Price range filter
            if (filters.priceMin !== undefined) {
                q = query(q, where('price', '>=', filters.priceMin));
            }
            if (filters.priceMax !== undefined) {
                q = query(q, where('price', '<=', filters.priceMax));
            }

            // Category-specific filters
            if (filters.sofaType && filters.sofaType !== 'All') {
                q = query(q, where('sofaProperties.sofaType', '==', filters.sofaType));
            }
            if (filters.chairType && filters.chairType !== 'All') {
                q = query(q, where('chairProperties.chairType', '==', filters.chairType));
            }
            if (filters.tableType && filters.tableType !== 'All') {
                q = query(q, where('tableProperties.tableType', '==', filters.tableType));
            }
            if (filters.bedroomType && filters.bedroomType !== 'All') {
                q = query(q, where('bedroomProperties.bedroomType', '==', filters.bedroomType));
            }
            if (filters.curtainType && filters.curtainType !== 'All') {
                q = query(q, where('curtainProperties.curtainType', '==', filters.curtainType));
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
            const products: ProductDocument[] = [];

            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() } as ProductDocument);
            });

            return {
                products,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore: querySnapshot.docs.length === (options.limit || 50)
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products');
        }
    }

    // Search products by name or description
    static async searchProducts(searchTerm: string, limit = 20) {
        try {
            // Note: Firestore doesn't support full-text search natively
            // This is a basic implementation. For production, consider using Algolia or similar
            const q = query(
                collection(db, this.COLLECTION),
                orderBy('name'),
                limit(limit)
            );

            const querySnapshot = await getDocs(q);
            const products: ProductDocument[] = [];

            querySnapshot.forEach((doc) => {
                const product = { id: doc.id, ...doc.data() } as ProductDocument;
                // Client-side filtering for search term
                if (
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.material.toLowerCase().includes(searchTerm.toLowerCase())
                ) {
                    products.push(product);
                }
            });

            return products;
        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error('Failed to search products');
        }
    }

    // Get single product by ID
    static async getProduct(productId: string): Promise<ProductDocument | null> {
        try {
            const docRef = doc(db, this.COLLECTION, productId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as ProductDocument;
            }

            return null;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw new Error('Failed to fetch product');
        }
    }

    // Create new product
    static async createProduct(productData: Omit<ProductDocument, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const docRef = await addDoc(collection(db, this.COLLECTION), {
                ...productData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error creating product:', error);
            throw new Error('Failed to create product');
        }
    }

    // Update product
    static async updateProduct(productId: string, updates: Partial<ProductDocument>) {
        try {
            const docRef = doc(db, this.COLLECTION, productId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating product:', error);
            throw new Error('Failed to update product');
        }
    }

    // Delete product
    static async deleteProduct(productId: string) {
        try {
            const docRef = doc(db, this.COLLECTION, productId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw new Error('Failed to delete product');
        }
    }

    // Update product stock
    static async updateStock(productId: string, newStock: number) {
        try {
            const docRef = doc(db, this.COLLECTION, productId);

            // Determine status based on stock level
            let status: 'in_stock' | 'low_stock' | 'out_of_stock';
            if (newStock === 0) {
                status = 'out_of_stock';
            } else if (newStock <= 5) {
                status = 'low_stock';
            } else {
                status = 'in_stock';
            }

            await updateDoc(docRef, {
                stock: newStock,
                status,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating stock:', error);
            throw new Error('Failed to update stock');
        }
    }

    // Bulk update products
    static async bulkUpdateProducts(updates: Array<{ id: string; data: Partial<ProductDocument> }>) {
        try {
            const batch = writeBatch(db);

            updates.forEach(({ id, data }) => {
                const docRef = doc(db, this.COLLECTION, id);
                batch.update(docRef, {
                    ...data,
                    updatedAt: serverTimestamp()
                });
            });

            await batch.commit();
        } catch (error) {
            console.error('Error bulk updating products:', error);
            throw new Error('Failed to bulk update products');
        }
    }

    // Get products by category
    static async getProductsByCategory(category: string, limit = 20) {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('category', '==', category),
                orderBy('createdAt', 'desc'),
                limit(limit)
            );

            const querySnapshot = await getDocs(q);
            const products: ProductDocument[] = [];

            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() } as ProductDocument);
            });

            return products;
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw new Error('Failed to fetch products by category');
        }
    }

    // Get low stock products
    static async getLowStockProducts() {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('status', 'in', ['low_stock', 'out_of_stock']),
                orderBy('stock', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const products: ProductDocument[] = [];

            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() } as ProductDocument);
            });

            return products;
        } catch (error) {
            console.error('Error fetching low stock products:', error);
            throw new Error('Failed to fetch low stock products');
        }
    }

    // Get featured products (high rating, in stock)
    static async getFeaturedProducts(limit = 8) {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('status', '==', 'in_stock'),
                where('rating', '>=', 4.5),
                orderBy('rating', 'desc'),
                orderBy('reviews', 'desc'),
                limit(limit)
            );

            const querySnapshot = await getDocs(q);
            const products: ProductDocument[] = [];

            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() } as ProductDocument);
            });

            return products;
        } catch (error) {
            console.error('Error fetching featured products:', error);
            throw new Error('Failed to fetch featured products');
        }
    }

    // Get product statistics
    static async getProductStats() {
        try {
            const q = query(collection(db, this.COLLECTION));
            const querySnapshot = await getDocs(q);

            let totalProducts = 0;
            let inStock = 0;
            let lowStock = 0;
            let outOfStock = 0;
            const categoryCount: Record<string, number> = {};

            querySnapshot.forEach((doc) => {
                const product = doc.data() as ProductDocument;
                totalProducts++;

                // Count by status
                if (product.status === 'in_stock') inStock++;
                else if (product.status === 'low_stock') lowStock++;
                else if (product.status === 'out_of_stock') outOfStock++;

                // Count by category
                categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
            });

            return {
                totalProducts,
                inStock,
                lowStock,
                outOfStock,
                categoryCount
            };
        } catch (error) {
            console.error('Error fetching product stats:', error);
            throw new Error('Failed to fetch product stats');
        }
    }
}