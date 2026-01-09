"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Save, AlertTriangle } from "lucide-react";
import { ShopMaterialItem, ShopMaterialCategory, StockStatus } from "@/lib/firebase/stock";
import { cn } from "@/lib/utils";

interface EditShopMaterialModalProps {
  isOpen: boolean;
  material: ShopMaterialItem | null;
  onClose: () => void;
  onSave: (material: ShopMaterialItem) => void;
}

export default function EditShopMaterialModal({ isOpen, material, onClose, onSave }: EditShopMaterialModalProps) {
  const [formData, setFormData] = useState<ShopMaterialItem | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: ShopMaterialCategory[] = ['Cushions', 'Pillows', 'Curtains', 'Covers', 'Accessories'];
  const units = ['pieces', 'sets', 'pairs', 'meters', 'rolls'];

  useEffect(() => {
    if (material) {
      setFormData({ ...material });
      setHasChanges(false);
    }
  }, [material]);

  const calculateStatus = (stockQty: number, minQty: number): StockStatus => {
    if (stockQty === 0) return 'out_of_stock';
    if (stockQty > 0 && stockQty <= minQty) return 'low_stock';
    return 'in_stock';
  };

  const handleChange = (field: keyof ShopMaterialItem, value: any) => {
    if (!formData) return;
    
    const updated = { ...formData, [field]: value };
    
    // Auto-calculate status when stock or threshold changes
    if (field === 'stockQty' || field === 'minQty') {
      const stockQty = field === 'stockQty' ? Number(value) : formData.stockQty;
      const minQty = field === 'minQty' ? Number(value) : formData.minQty;
      updated.status = calculateStatus(stockQty, minQty);
    }
    
    setFormData(updated);
    setHasChanges(true);
  };

  const handleAttributeChange = (attr: 'color' | 'size' | 'material', value: string) => {
    if (!formData) return;
    
    const updated = {
      ...formData,
      attributes: {
        ...formData.attributes,
        [attr]: value
      }
    };
    
    setFormData(updated);
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !hasChanges) return;

    setIsSubmitting(true);
    try {
      onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !formData) return null;

  const statusBadge = {
    in_stock: { label: '🟢 In Stock', class: 'bg-green-100 text-green-800' },
    low_stock: { label: '🟡 Low Stock', class: 'bg-yellow-100 text-yellow-800' },
    out_of_stock: { label: '🔴 Out of Stock', class: 'bg-red-100 text-red-800' },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: 100 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Shop Material</h2>
                <p className="text-white/70 text-sm">{formData.productName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Status Badge */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Status:</span>
              <span className={cn("px-3 py-1 rounded-full text-sm font-semibold", statusBadge[formData.status].class)}>
                {statusBadge[formData.status].label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleChange('productName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stockQty}
                  onChange={(e) => handleChange('stockQty', Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              {/* Min Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Quantity *</label>
                <input
                  type="number"
                  value={formData.minQty}
                  onChange={(e) => handleChange('minQty', Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              {/* Attributes Section */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Color */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">🎨 Color</label>
                    <input
                      type="text"
                      value={formData.attributes?.color || ''}
                      onChange={(e) => handleAttributeChange('color', e.target.value)}
                      placeholder="e.g., Red, Blue, Beige"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">📏 Size</label>
                    <input
                      type="text"
                      value={formData.attributes?.size || ''}
                      onChange={(e) => handleAttributeChange('size', e.target.value)}
                      placeholder="e.g., Small, Medium, Large"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Material */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">🧵 Material</label>
                    <input
                      type="text"
                      value={formData.attributes?.material || ''}
                      onChange={(e) => handleAttributeChange('material', e.target.value)}
                      placeholder="e.g., Cotton, Velvet, Silk"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Auto Status Calculation</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Status is automatically calculated based on stock quantity and min quantity:
                    <br />• Stock {'>'} Min Qty = In Stock
                    <br />• Stock ≤ Min Qty = Low Stock
                    <br />• Stock = 0 = Out of Stock
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: hasChanges ? 1.02 : 1 }}
              whileTap={{ scale: hasChanges ? 0.98 : 1 }}
              onClick={handleSubmit}
              disabled={!hasChanges || isSubmitting}
              className={cn(
                "px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors",
                hasChanges
                  ? "bg-[#D4AF37] text-white hover:bg-[#B8941F]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              <Save size={18} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
