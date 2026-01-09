"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AlertTriangle, X, Trash2, Loader2, Package } from "lucide-react";
import { ProductItem } from "@/lib/firebase/products";
import { formatCurrency } from "@/lib/utils";

interface DeleteProductModalProps {
  product: ProductItem;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteProductModal({ product, onClose, onConfirm }: DeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting product:", error);
      setIsDeleting(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-red-800">Delete Product</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product from Firebase? This action cannot be undone.
            </p>

            {/* Product Preview */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl mb-6">
              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#2D2926] truncate">{product.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {product.category}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyles(product.status)}`}>
                    {product.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#D4AF37] mt-1">{formatCurrency(product.price)}</p>
              </div>
            </div>

            {/* Stock Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Current Stock</p>
                <p className="text-lg font-bold text-[#2D2926]">{product.stockQty} units</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500">Stock Value</p>
                <p className="text-lg font-bold text-[#D4AF37]">{formatCurrency(product.price * product.stockQty)}</p>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Warning - Firebase Delete</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>Product will be permanently removed from Firestore</li>
                    <li>Dashboard statistics will update automatically</li>
                    <li>Category counts will be recalculated</li>
                    <li>This product will no longer appear in the catalog</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Product ID */}
            <div className="text-center text-xs text-gray-400 mb-6">
              Product ID: <span className="font-mono">{product.id}</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Deleting from Firebase...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>Delete Product</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
