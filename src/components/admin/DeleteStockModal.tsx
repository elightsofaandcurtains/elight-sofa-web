"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, AlertTriangle, Package, ShoppingBag } from "lucide-react";
import { RawMaterialItem, ShopMaterialItem } from "@/lib/firebase/stock";
import { cn } from "@/lib/utils";

interface DeleteStockModalProps {
  isOpen: boolean;
  material: RawMaterialItem | ShopMaterialItem | null;
  type: 'raw' | 'shop';
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteStockModal({ isOpen, material, type, onClose, onConfirm }: DeleteStockModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !material) return null;

  const isRaw = type === 'raw';
  const rawMaterial = isRaw ? material as RawMaterialItem : null;
  const shopMaterial = !isRaw ? material as ShopMaterialItem : null;
  
  const stockQty = isRaw ? rawMaterial!.stockQty : shopMaterial!.stockQty;
  const unit = material.unit;
  const name = isRaw ? rawMaterial!.name : shopMaterial!.productName;
  const hasStock = stockQty > 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Trash2 size={18} className="text-white sm:hidden" />
                <Trash2 size={20} className="text-white hidden sm:block" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Delete Item</h2>
                <p className="text-white/70 text-xs sm:text-sm">This cannot be undone</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <X size={20} className="sm:hidden" />
              <X size={24} className="hidden sm:block" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Item Details */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  isRaw ? "bg-amber-100" : "bg-blue-100"
                )}>
                  {isRaw ? (
                    <Package size={16} className="text-amber-600 sm:hidden" />
                  ) : (
                    <ShoppingBag size={16} className="text-blue-600 sm:hidden" />
                  )}
                  {isRaw ? (
                    <Package size={20} className="text-amber-600 hidden sm:block" />
                  ) : (
                    <ShoppingBag size={20} className="text-blue-600 hidden sm:block" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2D2926] text-sm sm:text-base truncate">{name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{material.category}</p>
                  <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span className="text-gray-600">
                      Stock: <span className="font-medium text-[#2D2926]">{stockQty} {unit}</span>
                    </span>
                    {isRaw && rawMaterial?.supplierName && (
                      <span className="text-gray-600 hidden sm:inline">
                        Supplier: <span className="font-medium text-[#2D2926]">{rawMaterial.supplierName}</span>
                      </span>
                    )}
                    {!isRaw && shopMaterial?.price && (
                      <span className="text-gray-600">
                        Price: <span className="font-medium text-[#2D2926]">₹{shopMaterial.price.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="text-center mb-4 sm:mb-6">
              <p className="text-gray-700 text-sm sm:text-base">
                Are you sure you want to delete this item?
              </p>
            </div>

            {/* Warning for items with stock */}
            {hasStock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <AlertTriangle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0 sm:hidden" />
                  <AlertTriangle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0 hidden sm:block" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-yellow-800">⚠️ Stock Available</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This item has <span className="font-semibold">{stockQty} {unit}</span> in stock.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What will happen */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-medium text-red-800 mb-1 sm:mb-2">What will happen:</p>
              <ul className="text-xs text-red-700 space-y-0.5 sm:space-y-1">
                <li>• Item permanently removed from Firebase</li>
                <li>• Dashboard counts recalculated</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 sm:px-6 py-2 rounded-lg font-medium flex items-center space-x-1 sm:space-x-2 transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              <Trash2 size={16} className="sm:hidden" />
              <Trash2 size={18} className="hidden sm:block" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
