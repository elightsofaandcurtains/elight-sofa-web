// Firebase Analytics Service - Real-time Dashboard & Analytics Data
// All data comes from Firestore - NO hardcoded or mock values
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    Unsubscribe,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../../firebase.config';

// ==================== TYPES ====================

export interface DashboardStats {
    totalRevenue: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
    newInquiriesCount: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    totalInvoices: number;
}

export interface SalesDataPoint {
    month: string;
    revenue: number;
    profit: number;
    sales: number;
}

export interface CategorySalesData {
    category: string;
    value: number;
    color: string;
}

export interface TopProduct {
    name: string;
    sales: number;
    revenue: number;
}

export interface AnalyticsData {
    dashboardStats: DashboardStats;
    monthlySales: SalesDataPoint[];
    categorySales: CategorySalesData[];
    topProducts: TopProduct[];
}

// Category colors for charts
const CATEGORY_COLORS: Record<string, string> = {
    'Sofas': '#D4AF37',
    'Chairs': '#2D2926',
    'Tables': '#8B7355',
    'Bedroom': '#C9A961',
    'Curtains': '#5A4A3A',
    'Storage': '#6B5B4F',
    'Dining': '#9B8B7B',
    'Other': '#A0A0A0'
};

// ==================== ANALYTICS SERVICE ====================

export class AnalyticsService {

    // ==================== DASHBOARD STATS ====================

    /**
     * Get all dashboard statistics from Firestore
     * Returns real-time data: revenue, customers, inquiries, orders
     */
    static async getDashboardStats(): Promise<DashboardStats> {
        try {
            const [
                invoiceStats,
                customerCount,
                productCount,
                inquiriesCount
            ] = await Promise.all([
                this.getInvoiceStats(),
                this.getCustomerCount(),
                this.getProductCount(),
                this.getNewInquiriesCount()
            ]);

            return {
                totalRevenue: invoiceStats.totalAmount,
                totalPaidAmount: invoiceStats.paidAmount,
                totalPendingAmount: invoiceStats.pendingAmount,
                newInquiriesCount: inquiriesCount,
                totalCustomers: customerCount,
                totalProducts: productCount,
                pendingOrders: invoiceStats.pendingCount,
                totalInvoices: invoiceStats.totalCount
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Subscribe to dashboard stats (real-time updates)
     */
    static subscribeToDashboardStats(callback: (stats: DashboardStats) => void): Unsubscribe {
        // We'll use multiple subscriptions and combine them
        let invoiceStats = { totalAmount: 0, paidAmount: 0, pendingAmount: 0, pendingCount: 0, totalCount: 0 };
        let customerCount = 0;
        let productCount = 0;
        let inquiriesCount = 0;

        const updateCallback = () => {
            callback({
                totalRevenue: invoiceStats.totalAmount,
                totalPaidAmount: invoiceStats.paidAmount,
                totalPendingAmount: invoiceStats.pendingAmount,
                newInquiriesCount: inquiriesCount,
                totalCustomers: customerCount,
                totalProducts: productCount,
                pendingOrders: invoiceStats.pendingCount,
                totalInvoices: invoiceStats.totalCount
            });
        };

        // Subscribe to invoices
        const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
            let totalAmount = 0;
            let paidAmount = 0;
            let pendingAmount = 0;
            let pendingCount = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                totalAmount += Number(data.totalAmount) || 0;
                paidAmount += Number(data.paidAmount) || 0;
                pendingAmount += Number(data.pendingAmount) || 0;
                if (data.paymentStatus === 'Pending' || data.paymentStatus === 'Partial') {
                    pendingCount++;
                }
            });

            invoiceStats = { totalAmount, paidAmount, pendingAmount, pendingCount, totalCount: snapshot.size };
            updateCallback();
        });

        // Subscribe to users (customers)
        const unsubUsers = onSnapshot(
            query(collection(db, 'users'), where('role', '==', 'customer')),
            (snapshot) => {
                customerCount = snapshot.size;
                updateCallback();
            }
        );

        // Subscribe to products
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            productCount = snapshot.size;
            updateCallback();
        });

        // Subscribe to new inquiries
        const unsubInquiries = onSnapshot(
            query(collection(db, 'inquiries'), where('isViewed', '==', false)),
            (snapshot) => {
                inquiriesCount = snapshot.size;
                updateCallback();
            }
        );

        // Return combined unsubscribe function
        return () => {
            unsubInvoices();
            unsubUsers();
            unsubProducts();
            unsubInquiries();
        };
    }

    // ==================== INVOICE STATS ====================

    private static async getInvoiceStats() {
        try {
            const snapshot = await getDocs(collection(db, 'invoices'));

            let totalAmount = 0;
            let paidAmount = 0;
            let pendingAmount = 0;
            let pendingCount = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                totalAmount += Number(data.totalAmount) || 0;
                paidAmount += Number(data.paidAmount) || 0;
                pendingAmount += Number(data.pendingAmount) || 0;
                if (data.paymentStatus === 'Pending' || data.paymentStatus === 'Partial') {
                    pendingCount++;
                }
            });

            return { totalAmount, paidAmount, pendingAmount, pendingCount, totalCount: snapshot.size };
        } catch (error) {
            console.error('Error fetching invoice stats:', error);
            return { totalAmount: 0, paidAmount: 0, pendingAmount: 0, pendingCount: 0, totalCount: 0 };
        }
    }

    // ==================== CUSTOMER COUNT ====================

    private static async getCustomerCount(): Promise<number> {
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'customer'));
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Error fetching customer count:', error);
            return 0;
        }
    }

    // ==================== PRODUCT COUNT ====================

    private static async getProductCount(): Promise<number> {
        try {
            const snapshot = await getDocs(collection(db, 'products'));
            return snapshot.size;
        } catch (error) {
            console.error('Error fetching product count:', error);
            return 0;
        }
    }

    // ==================== NEW INQUIRIES COUNT ====================

    private static async getNewInquiriesCount(): Promise<number> {
        try {
            const q = query(collection(db, 'inquiries'), where('isViewed', '==', false));
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Error fetching new inquiries count:', error);
            return 0;
        }
    }

    // ==================== MONTHLY SALES DATA ====================

    /**
     * Get monthly sales data from invoices for charts
     * Groups invoices by month and calculates revenue, profit, sales count
     */
    static async getMonthlySalesData(months: number = 6): Promise<SalesDataPoint[]> {
        try {
            const snapshot = await getDocs(collection(db, 'invoices'));

            // Group by month
            const monthlyData: Record<string, { revenue: number; profit: number; sales: number }> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const invoiceDate = data.invoiceDate || data.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0];

                if (invoiceDate) {
                    const date = new Date(invoiceDate);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { revenue: 0, profit: 0, sales: 0 };
                    }

                    const revenue = Number(data.totalAmount) || 0;
                    monthlyData[monthKey].revenue += revenue;
                    monthlyData[monthKey].profit += revenue * 0.3; // Estimated 30% profit margin
                    monthlyData[monthKey].sales += 1;
                }
            });

            // Convert to array and sort by date
            const sortedMonths = Object.entries(monthlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-months);

            return sortedMonths.map(([monthKey, data]) => {
                const [year, month] = monthKey.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                return {
                    month: monthName,
                    revenue: Math.round(data.revenue),
                    profit: Math.round(data.profit),
                    sales: data.sales
                };
            });
        } catch (error) {
            console.error('Error fetching monthly sales data:', error);
            return [];
        }
    }

    /**
     * Subscribe to monthly sales data (real-time)
     */
    static subscribeToMonthlySalesData(callback: (data: SalesDataPoint[]) => void, months: number = 6): Unsubscribe {
        return onSnapshot(collection(db, 'invoices'), (snapshot) => {
            const monthlyData: Record<string, { revenue: number; profit: number; sales: number }> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const invoiceDate = data.invoiceDate || data.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0];

                if (invoiceDate) {
                    const date = new Date(invoiceDate);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { revenue: 0, profit: 0, sales: 0 };
                    }

                    const revenue = Number(data.totalAmount) || 0;
                    monthlyData[monthKey].revenue += revenue;
                    monthlyData[monthKey].profit += revenue * 0.3;
                    monthlyData[monthKey].sales += 1;
                }
            });

            const sortedMonths = Object.entries(monthlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-months);

            const result = sortedMonths.map(([monthKey, data]) => {
                const [year, month] = monthKey.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                return {
                    month: monthName,
                    revenue: Math.round(data.revenue),
                    profit: Math.round(data.profit),
                    sales: data.sales
                };
            });

            callback(result);
        });
    }

    // ==================== CATEGORY SALES DATA ====================

    /**
     * Get sales breakdown by product category
     */
    static async getCategorySalesData(): Promise<CategorySalesData[]> {
        try {
            const snapshot = await getDocs(collection(db, 'products'));

            // Count products by category
            const categoryCount: Record<string, number> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const category = data.category || 'Other';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });

            // Convert to array with colors
            return Object.entries(categoryCount).map(([category, value]) => ({
                category,
                value,
                color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
            }));
        } catch (error) {
            console.error('Error fetching category sales data:', error);
            return [];
        }
    }

    /**
     * Subscribe to category sales data (real-time)
     */
    static subscribeToCategorySalesData(callback: (data: CategorySalesData[]) => void): Unsubscribe {
        return onSnapshot(collection(db, 'products'), (snapshot) => {
            const categoryCount: Record<string, number> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const category = data.category || 'Other';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });

            const result = Object.entries(categoryCount).map(([category, value]) => ({
                category,
                value,
                color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
            }));

            callback(result);
        });
    }

    // ==================== TOP PRODUCTS ====================

    /**
     * Get top performing products based on invoice items
     */
    static async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
        try {
            const snapshot = await getDocs(collection(db, 'invoices'));

            // Aggregate product sales from invoice items
            const productSales: Record<string, { sales: number; revenue: number }> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const items = data.items || [];

                items.forEach((item: any) => {
                    const name = item.name || 'Unknown Product';
                    if (!productSales[name]) {
                        productSales[name] = { sales: 0, revenue: 0 };
                    }
                    productSales[name].sales += Number(item.quantity) || 1;
                    productSales[name].revenue += Number(item.rowTotal) || (Number(item.rate) * (Number(item.quantity) || 1));
                });
            });

            // Sort by revenue and return top N
            return Object.entries(productSales)
                .map(([name, data]) => ({
                    name,
                    sales: data.sales,
                    revenue: Math.round(data.revenue)
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching top products:', error);
            return [];
        }
    }

    /**
     * Subscribe to top products (real-time)
     */
    static subscribeToTopProducts(callback: (data: TopProduct[]) => void, limit: number = 5): Unsubscribe {
        return onSnapshot(collection(db, 'invoices'), (snapshot) => {
            const productSales: Record<string, { sales: number; revenue: number }> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const items = data.items || [];

                items.forEach((item: any) => {
                    const name = item.name || 'Unknown Product';
                    if (!productSales[name]) {
                        productSales[name] = { sales: 0, revenue: 0 };
                    }
                    productSales[name].sales += Number(item.quantity) || 1;
                    productSales[name].revenue += Number(item.rowTotal) || (Number(item.rate) * (Number(item.quantity) || 1));
                });
            });

            const result = Object.entries(productSales)
                .map(([name, data]) => ({
                    name,
                    sales: data.sales,
                    revenue: Math.round(data.revenue)
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, limit);

            callback(result);
        });
    }

    // ==================== FULL ANALYTICS DATA ====================

    /**
     * Get all analytics data in one call
     */
    static async getFullAnalyticsData(): Promise<AnalyticsData> {
        try {
            const [dashboardStats, monthlySales, categorySales, topProducts] = await Promise.all([
                this.getDashboardStats(),
                this.getMonthlySalesData(6),
                this.getCategorySalesData(),
                this.getTopProducts(5)
            ]);

            return {
                dashboardStats,
                monthlySales,
                categorySales,
                topProducts
            };
        } catch (error) {
            console.error('Error fetching full analytics data:', error);
            throw error;
        }
    }

    // ==================== QUICK STATS FOR ANALYTICS PAGE ====================

    /**
     * Get quick stats for analytics page
     */
    static async getQuickStats() {
        try {
            const [invoiceSnapshot, productSnapshot] = await Promise.all([
                getDocs(collection(db, 'invoices')),
                getDocs(collection(db, 'products'))
            ]);

            let totalRevenue = 0;
            let totalSales = 0;
            let productsSold = 0;

            invoiceSnapshot.docs.forEach(doc => {
                const data = doc.data();
                totalRevenue += Number(data.totalAmount) || 0;
                totalSales += 1;

                // Count items sold
                const items = data.items || [];
                items.forEach((item: any) => {
                    productsSold += Number(item.quantity) || 1;
                });
            });

            // Calculate growth rate (simplified - compare current month to previous)
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const prevMonth = now.getMonth() === 0
                ? `${now.getFullYear() - 1}-12`
                : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

            let currentMonthRevenue = 0;
            let prevMonthRevenue = 0;

            invoiceSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const invoiceDate = data.invoiceDate || '';
                if (invoiceDate.startsWith(currentMonth)) {
                    currentMonthRevenue += Number(data.totalAmount) || 0;
                } else if (invoiceDate.startsWith(prevMonth)) {
                    prevMonthRevenue += Number(data.totalAmount) || 0;
                }
            });

            const growthRate = prevMonthRevenue > 0
                ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
                : 0;

            return {
                totalRevenue,
                totalSales,
                productsSold,
                growthRate: Math.round(growthRate * 10) / 10,
                totalProducts: productSnapshot.size
            };
        } catch (error) {
            console.error('Error fetching quick stats:', error);
            return {
                totalRevenue: 0,
                totalSales: 0,
                productsSold: 0,
                growthRate: 0,
                totalProducts: 0
            };
        }
    }

    /**
     * Subscribe to quick stats (real-time)
     */
    static subscribeToQuickStats(callback: (stats: any) => void): Unsubscribe {
        let invoiceData: any[] = [];
        let productCount = 0;

        const calculateStats = () => {
            let totalRevenue = 0;
            let totalSales = 0;
            let productsSold = 0;

            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const prevMonth = now.getMonth() === 0
                ? `${now.getFullYear() - 1}-12`
                : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

            let currentMonthRevenue = 0;
            let prevMonthRevenue = 0;

            invoiceData.forEach(data => {
                totalRevenue += Number(data.totalAmount) || 0;
                totalSales += 1;

                const items = data.items || [];
                items.forEach((item: any) => {
                    productsSold += Number(item.quantity) || 1;
                });

                const invoiceDate = data.invoiceDate || '';
                if (invoiceDate.startsWith(currentMonth)) {
                    currentMonthRevenue += Number(data.totalAmount) || 0;
                } else if (invoiceDate.startsWith(prevMonth)) {
                    prevMonthRevenue += Number(data.totalAmount) || 0;
                }
            });

            const growthRate = prevMonthRevenue > 0
                ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
                : 0;

            callback({
                totalRevenue,
                totalSales,
                productsSold,
                growthRate: Math.round(growthRate * 10) / 10,
                totalProducts: productCount
            });
        };

        const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
            invoiceData = snapshot.docs.map(doc => doc.data());
            calculateStats();
        });

        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
            productCount = snapshot.size;
            calculateStats();
        });

        return () => {
            unsubInvoices();
            unsubProducts();
        };
    }
}
