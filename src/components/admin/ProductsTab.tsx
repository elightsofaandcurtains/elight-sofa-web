"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  Star,
  CheckCircle,
  Package,
  AlertTriangle,
  XCircle,
  IndianRupee,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ProductService, ProductItem, ProductStats, ProductCategory } from "@/lib/firebase/products";
import { formatCurrency, cn } from "@/lib/utils";
import AddProductModal from "./AddProductModal";
import ViewProductModal from "./ViewProductModal";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";

const categoryTabs: (ProductCategory | 'All')[] = ["All", "Sofas", "Chairs", "Tables", "Bedroom", "Curtains"];

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: "-50%" }}
    animate={{ opacity: 1, y: 0, x: "-50%" }}
    exit={{ opacity: 0, y: 50, x: "-50%" }}
    className={cn(
      "fixed bottom-6 left-1/2 transform px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-[100]",
      type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
    )}
  >
    <CheckCircle size={20} />
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-4 hover:opacity-80">×</button>
  </motion.div>
);

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", getStatusStyles())}>
      {status}
    </span>
  );
};

export default function ProductsTab() {
  const [activeFilter, setActiveFilter] = useState<ProductCategory | 'All'>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([]);
  const [stats, setStats] = useState<ProductStats>({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [viewProduct, setViewProduct] = useState<ProductItem | null>(null);
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Real-time Firebase subscription
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const unsubscribe = ProductService.subscribeToProducts((fetchedProducts) => {
      setProducts(fetchedProducts);
      setStats(ProductService.getProductStats(fetchedProducts));
      setCategoryCounts(ProductService.getCategoryCounts(fetchedProducts));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter products when category or search changes
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (activeFilter !== "All") {
      filtered = filtered.filter(p => p.category === activeFilter);
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.material.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProducts(filtered);
  }, [products, activeFilter, searchQuery]);

  // Handle add product
  const handleAddProduct = async (productData: any) => {
    try {
      await ProductService.createProduct(productData);
      showToast("Product added successfully!");
      setShowAddModal(false);
    } catch (error: any) {
      showToast(error.message || "Failed to add product", "error");
    }
  };

  // Handle view product
  const handleViewProduct = (product: ProductItem) => {
    setViewProduct(product);
  };

  // Handle edit product
  const handleEditProduct = (product: ProductItem) => {
    setEditProduct(product);
    setViewProduct(null);
  };

  // Handle save product (update)
  const handleSaveProduct = async (updatedProduct: ProductItem) => {
    try {
      const { id, createdAt, updatedAt, ...updateData } = updatedProduct;
      await ProductService.updateProduct(id, updateData);
      showToast("Product updated successfully!");
      setEditProduct(null);
    } catch (error: any) {
      showToast(error.message || "Failed to update product", "error");
    }
  };

  // Handle delete click
  const handleDeleteClick = (product: ProductItem) => {
    setDeleteProduct(product);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (deleteProduct) {
      try {
        await ProductService.deleteProduct(deleteProduct.id);
        showToast("Product deleted successfully!");
        setDeleteProduct(null);
      } catch (error: any) {
        showToast(error.message || "Failed to delete product", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-gray-600">Loading products from Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={18} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#2D2926] mb-2">Product Inventory</h1>
          <p className="text-gray-600">Category-wise product management • Firebase Firestore</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </motion.button>
      </motion.div>

      {/* Dashboard Summary Cards - FIREBASE ONLY */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Products", value: stats.total, icon: Package, color: "bg-blue-50 border-blue-200 text-blue-600" },
          { label: "In Stock", value: stats.inStock, icon: CheckCircle, color: "bg-green-50 border-green-200 text-green-600" },
          { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "bg-yellow-50 border-yellow-200 text-yellow-600" },
          { label: "Out of Stock", value: stats.outOfStock, icon: XCircle, color: "bg-red-50 border-red-200 text-red-600" },
          { label: "Total Value", value: formatCurrency(stats.totalValue), icon: IndianRupee, color: "bg-purple-50 border-purple-200 text-purple-600" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn("rounded-lg p-4 shadow-md border", stat.color.split(' ').slice(0, 2).join(' '))}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-[#2D2926]">{stat.value}</p>
              </div>
              <stat.icon className={cn("w-8 h-8", stat.color.split(' ')[2])} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors flex items-center space-x-2",
                  activeFilter === tab 
                    ? "bg-[#D4AF37] text-white" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
              >
                <span>{tab}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  activeFilter === tab ? "bg-white/20" : "bg-gray-200"
                )}>
                  {categoryCounts[tab] || 0}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Products Table - LIVE FIREBASE DATA */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                        {product.imageUrl ? (
                          <Image 
                            src={product.imageUrl} 
                            alt={product.name} 
                            width={48} 
                            height={48} 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[#2D2926]">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.material}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#2D2926]">{formatCurrency(product.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{product.stockQty}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{product.minStock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="fill-[#D4AF37] text-[#D4AF37]" />
                      <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({product.reviewsCount})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <motion.button 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => handleViewProduct(product)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                        title="View Product"
                      >
                        <Eye size={16} />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => handleEditProduct(product)} 
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" 
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => handleDeleteClick(product)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" 
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 mb-4">
              {products.length === 0 
                ? "No products found in Firebase" 
                : `No products found for "${activeFilter}" category`}
            </div>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors"
            >
              Add First Product
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddProductModal 
          onClose={() => setShowAddModal(false)} 
          onSave={handleAddProduct} 
        />
      )}
      {viewProduct && (
        <ViewProductModal 
          product={viewProduct} 
          onClose={() => setViewProduct(null)} 
          onEdit={() => handleEditProduct(viewProduct)} 
        />
      )}
      {editProduct && (
        <EditProductModal 
          product={editProduct} 
          onClose={() => setEditProduct(null)} 
          onSave={handleSaveProduct} 
        />
      )}
      {deleteProduct && (
        <DeleteProductModal 
          product={deleteProduct} 
          onClose={() => setDeleteProduct(null)} 
          onConfirm={handleConfirmDelete} 
        />
      )}
    </div>
  );
}
