"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  AnalyticsService,
  SalesDataPoint,
  CategorySalesData,
  TopProduct,
} from "@/lib/firebase/analytics";

interface QuickStats {
  totalRevenue: number;
  totalSales: number;
  productsSold: number;
  growthRate: number;
  totalProducts: number;
}

export default function AnalyticsTab() {
  // Real-time state from Firestore
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time Firestore data
  useEffect(() => {
    setIsLoading(true);

    // Subscribe to quick stats
    const unsubStats = AnalyticsService.subscribeToQuickStats((stats) => {
      setQuickStats(stats);
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

    // Subscribe to top products
    const unsubTopProducts = AnalyticsService.subscribeToTopProducts((data) => {
      setTopProducts(data);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubStats();
      unsubSales();
      unsubCategory();
      unsubTopProducts();
    };
  }, []);

  // Build quick stats array from real Firestore data
  const statsCards = [
    {
      title: "Total Revenue",
      value: quickStats?.totalRevenue ?? 0,
      change: quickStats?.growthRate ?? 0,
      isPositive: (quickStats?.growthRate ?? 0) >= 0,
      icon: DollarSign,
      isCurrency: true,
    },
    {
      title: "Total Sales",
      value: quickStats?.totalSales ?? 0,
      change: 0,
      isPositive: true,
      icon: ShoppingCart,
    },
    {
      title: "Products Sold",
      value: quickStats?.productsSold ?? 0,
      change: 0,
      isPositive: true,
      icon: Package,
    },
    {
      title: "Growth Rate",
      value: quickStats?.growthRate ?? 0,
      change: 0,
      isPositive: (quickStats?.growthRate ?? 0) >= 0,
      icon: TrendingUp,
      suffix: "%",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-serif font-bold text-[#2D2926] mb-2">
          Analytics & Reports
        </h1>
        <p className="text-gray-600">Comprehensive insights into your business</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                    <stat.icon className="text-[#D4AF37]" size={24} />
                  </div>
                  {stat.change !== 0 && (
                    <div
                      className={`text-sm font-semibold ${stat.isPositive ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {stat.isPositive ? "+" : ""}
                      {stat.change}%
                    </div>
                  )}
                </div>
                <h3 className="text-sm text-gray-600 uppercase tracking-wider mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-[#2D2926]">
                  {stat.isCurrency
                    ? formatCurrency(stat.value)
                    : stat.value.toLocaleString()}
                  {stat.suffix}
                </p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4">
            Revenue & Profit Trend
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
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D2926" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2D2926" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#2D2926"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Sales by Category */}
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

      {/* Top Products & Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4">
            Top 5 Performing Products
          </h2>
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              No sales data available yet
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-[#2D2926]">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#2D2926]">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Monthly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold text-[#2D2926] mb-4">
            Monthly Performance
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
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#D4AF37" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#2D2926]">
            Monthly Breakdown
          </h2>
        </div>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : salesData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No sales data available yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.map((data, index) => {
                  const profitMargin = data.revenue > 0
                    ? ((data.profit / data.revenue) * 100).toFixed(1)
                    : "0.0";
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D2926]">
                        {data.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(data.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(data.profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        {profitMargin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
