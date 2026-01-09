"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  MessageSquare,
  Users,
  Package,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AnalyticsService,
  DashboardStats,
  SalesDataPoint,
  CategorySalesData
} from "@/lib/firebase/analytics";

export default function DashboardTab() {
  const router = useRouter();

  // Real-time state from Firestore
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time Firestore data
  useEffect(() => {
    setIsLoading(true);

    // Subscribe to dashboard stats
    const unsubStats = AnalyticsService.subscribeToDashboardStats((stats) => {
      setDashboardStats(stats);
      setIsLoading(false);
    });

    // Subscribe to monthly sales data
    const unsubSales = AnalyticsService.subscribeToMonthlySalesData((data) => {
      setSalesData(data);
    });

    // Subscribe to category sales data
    const unsubCategory = AnalyticsService.subscribeToCategorySalesData((data) => {
      setCategorySales(data);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubStats();
      unsubSales();
      unsubCategory();
    };
  }, []);

  // Build stats array from real Firestore data
  const stats = [
    {
      title: "Total Revenue",
      value: isLoading ? "..." : (dashboardStats?.totalRevenue ?? 0),
      icon: DollarSign,
      trend: { value: 0, isPositive: true },
      isCurrency: true,
      isLoading,
    },
    {
      title: "New Inquiries",
      value: isLoading ? "..." : (dashboardStats?.newInquiriesCount ?? 0),
      icon: MessageSquare,
      trend: { value: 0, isPositive: true },
      onClick: () => router.push("/admin?tab=inquiries"),
      isLoading,
    },
    {
      title: "Total Customers",
      value: isLoading ? "..." : (dashboardStats?.totalCustomers ?? 0),
      icon: Users,
      trend: { value: 0, isPositive: true },
      isLoading,
    },
    {
      title: "Pending Orders",
      value: isLoading ? "..." : (dashboardStats?.pendingOrders ?? 0),
      icon: ShoppingCart,
      trend: { value: 0, isPositive: false },
      isLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-serif font-bold text-[#2D2926] mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">Welcome back! Here's your overview.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} index={index} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4">
            Monthly Sales Trend
          </h2>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : salesData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No sales data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#2D2926"
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4">
            Products by Category
          </h2>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : categorySales.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No product data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) =>
                    `${category} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h3 className="text-sm text-gray-600 uppercase tracking-wider mb-2">
            Total Products
          </h3>
          <p className="text-3xl font-bold text-[#2D2926]">
            {isLoading ? "..." : (dashboardStats?.totalProducts ?? 0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h3 className="text-sm text-gray-600 uppercase tracking-wider mb-2">
            Total Invoices
          </h3>
          <p className="text-3xl font-bold text-[#2D2926]">
            {isLoading ? "..." : (dashboardStats?.totalInvoices ?? 0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h3 className="text-sm text-gray-600 uppercase tracking-wider mb-2">
            Pending Amount
          </h3>
          <p className="text-3xl font-bold text-[#D4AF37]">
            {isLoading ? "..." : `₹${(dashboardStats?.totalPendingAmount ?? 0).toLocaleString()}`}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
