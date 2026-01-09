// Firebase Analytics Service
import {
    collection,
    doc,
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { ProductsService } from './products';
import { InvoicesService } from './invoices';
import { PaymentsService } from './payments';
import { InquiriesService } from './inquiries';

export interface DashboardStats {
    totalRevenue: number;
    newInquiries: number;
    totalCustomers: number;
    pendingOrders: number;
    revenueGrowth: number;
    inquiryGrowth: number;
    customerGrowth: number;
    orderGrowth: number;
}

export interface SalesData {
    month: string;
    revenue: number;
    profit: number;
    sales: number;
}

export interface CategorySales {
    category: string;
    value: number;
    color: string;
}

export class AnalyticsService {
    // Get dashboard statistics
    static async getDashboardStats(): Promise<DashboardStats> {
        try {
            const [
                invoiceStats,
                inquiryStats,
                paymentStats,
                productStats
            ] = await Promise.all([
                InvoicesService.getInvoiceStats(),
                InquiriesService.getInquiryStats(),
                PaymentsService.getPaymentStats(),
                ProductsService.getProductStats()
            ]);

            // Calculate growth rates (simplified - in production, compare with previous period)
            const revenueGrowth = 12.5; // Mock data
            const inquiryGrowth = 8.2;
            const customerGrowth = 5.1;
            const orderGrowth = -2.3;

            return {
                totalRevenue: invoiceStats.totalRevenue,
                newInquiries: inquiryStats.newInquiries,
                totalCustomers: paymentStats.totalReceivables > 0 ? Math.floor(paymentStats.totalReceivables / 25000) : 0,
                pendingOrders: invoiceStats.pendingInvoices,
                revenueGrowth,
                inquiryGrowth,
                customerGrowth,
                orderGrowth
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw new Error('Failed to fetch dashboard statistics');
        }
    }

    // Get sales trend data
    static async getSalesTrendData(): Promise<SalesData[]> {
        try {
            const invoiceStats = await InvoicesService.getInvoiceStats();

            // Convert monthly sales to trend data
            const salesData: SalesData[] = [];

            Object.entries(invoiceStats.monthlySales).forEach(([month, revenue]) => {
                // Calculate estimated profit (30% margin) and sales count
                const profit = revenue * 0.3;
                const sales = Math.floor(revenue / 25000); // Estimated average order value

                salesData.push({
                    month: this.formatMonth(month),
                    revenue,
                    profit,
                    sales
                });
            });

            // Sort by month and return last 6 months
            return salesData
                .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
                .slice(-6);
        } catch (error) {
            console.error('Error fetching sales trend data:', error);
            throw new Error('Failed to fetch sales trend data');
        }
    }

    // Get category sales breakdown
    static async getCategorySalesData(): Promise<CategorySales[]> {
        try {
            const productStats = await ProductsService.getProductStats();

            const colors = ['#D4AF37', '#2D2926', '#8B7355', '#C9A961', '#5A4A3A'];
            const categorySales: CategorySales[] = [];

            Object.entries(productStats.categoryCount).forEach(([category, count], index) => {
                categorySales.push({
                    category,
                    value: count,
                    color: colors[index % colors.length]
                });
            });

            return categorySales;
        } catch (error) {
            console.error('Error fetching category sales data:', error);
            throw new Error('Failed to fetch category sales data');
        }
    }

    // Get top selling products
    static async getTopProducts(limit = 5) {
        try {
            // This would require tracking sales data in production
            // For now, return products with highest ratings as proxy
            const { products } = await ProductsService.getProducts(
                {},
                { orderBy: 'rating', orderDirection: 'desc', limit }
            );

            return products.map(product => ({
                name: product.name,
                sales: product.reviews, // Using reviews as proxy for sales
                revenue: product.price * product.reviews * 0.1 // Estimated revenue
            }));
        } catch (error) {
            console.error('Error fetching top products:', error);
            throw new Error('Failed to fetch top products');
        }
    }

    // Get recent activity
    static async getRecentActivity() {
        try {
            const [recentInvoices, recentInquiries, recentPayments] = await Promise.all([
                InvoicesService.getRecentInvoices(5),
                InquiriesService.getRecentInquiries(5),
                PaymentsService.getRecentPayments(5)
            ]);

            const activities = [
                ...recentInvoices.map(invoice => ({
                    type: 'invoice',
                    title: `Invoice ${invoice.invoiceNumber} created`,
                    description: `Customer: ${invoice.customerDetails.name}`,
                    amount: invoice.calculations.grandTotal,
                    timestamp: invoice.createdAt
                })),
                ...recentInquiries.map(inquiry => ({
                    type: 'inquiry',
                    title: 'New inquiry received',
                    description: `${inquiry.firstName} ${inquiry.lastName} - ${inquiry.interestArea}`,
                    amount: inquiry.budget,
                    timestamp: inquiry.createdAt
                })),
                ...recentPayments.map(payment => ({
                    type: 'payment',
                    title: `Payment ${payment.status}`,
                    description: `${payment.party} - ${payment.mode}`,
                    amount: payment.amount,
                    timestamp: payment.date
                }))
            ];

            // Sort by timestamp and return latest 10
            return activities
                .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
                .slice(0, 10);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw new Error('Failed to fetch recent activity');
        }
    }

    // Get inventory alerts
    static async getInventoryAlerts() {
        try {
            const lowStockProducts = await ProductsService.getLowStockProducts();

            return lowStockProducts.map(product => ({
                type: product.status === 'out_of_stock' ? 'critical' : 'warning',
                title: product.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock',
                description: `${product.name} - ${product.stock} remaining`,
                productId: product.id
            }));
        } catch (error) {
            console.error('Error fetching inventory alerts:', error);
            throw new Error('Failed to fetch inventory alerts');
        }
    }

    // Get overdue items summary
    static async getOverdueSummary() {
        try {
            const [overdueInvoices, overduePayments, followUpInquiries] = await Promise.all([
                InvoicesService.getOverdueInvoices(),
                PaymentsService.getOverduePayments(),
                InquiriesService.getFollowUpInquiries()
            ]);

            return {
                overdueInvoices: overdueInvoices.length,
                overduePayments: overduePayments.length,
                followUpInquiries: followUpInquiries.length,
                totalOverdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.paymentDetails.balanceAmount, 0)
            };
        } catch (error) {
            console.error('Error fetching overdue summary:', error);
            throw new Error('Failed to fetch overdue summary');
        }
    }

    // Helper method to format month string
    private static formatMonth(monthString: string): string {
        const [year, month] = monthString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // Store analytics event (for tracking user actions)
    static async trackEvent(
        eventType: string,
        eventData: Record<string, any>,
        userId?: string
    ) {
        try {
            await addDoc(collection(db, 'analytics-events'), {
                eventType,
                eventData,
                userId,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        } catch (error) {
            console.error('Error tracking event:', error);
            // Don't throw error for analytics tracking failures
        }
    }
}