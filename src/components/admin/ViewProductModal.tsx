"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Edit, Star, Calendar, Package, Tag, Ruler, Clock } from "lucide-react";
import { ProductItem } from "@/lib/firebase/products";
import { formatCurrency, cn } from "@/lib/utils";

interface ViewProductModalProps {
  product: ProductItem;
  onClose: () => void;
  onEdit: () => void;
}

export default function ViewProductModal({ product, onClose, onEdit }: ViewProductModalProps) {
  const getStatusStyles = (status: string) => {
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

  const getCategorySpecificDetails = () => {
    const details: { label: string; value: string | undefined }[] = [];

    switch (product.category) {
      case "Sofas":
        if (product.sofaType) details.push({ label: "Sofa Type", value: product.sofaType });
        if (product.seatingCapacity) details.push({ label: "Seating Capacity", value: product.seatingCapacity });
        break;
      case "Chairs":
        if (product.chairType) details.push({ label: "Chair Type", value: product.chairType });
        break;
      case "Tables":
        if (product.tableType) details.push({ label: "Table Type", value: product.tableType });
        break;
      case "Bedroom":
        if (product.bedroomType) details.push({ label: "Furniture Type", value: product.bedroomType });
        break;
      case "Curtains":
        if (product.curtainType) details.push({ label: "Curtain Type", value: product.curtainType });
        if (product.curtainFabric) details.push({ label: "Fabric", value: product.curtainFabric });
        if (product.curtainSize) details.push({ label: "Size", value: product.curtainSize });
        break;
    }

    return details.filter(d => d.value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543]">
            <h2 className="text-2xl font-bold text-white">Product Details</h2>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2"
              >
                <Edit size={18} />
                <span>Edit</span>
              </motion.button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-24 h-24 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Additional Images Thumbnails */}
                  {product.imageUrls && product.imageUrls.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {product.imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-16 h-16 rounded-lg overflow-hidden border-2",
                            index === 0 ? "border-[#D4AF37]" : "border-gray-200"
                          )}
                        >
                          <Image
                            src={url}
                            alt={`${product.name} - ${index + 1}`}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Error';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image URLs Info */}
                  {product.imageUrls && product.imageUrls.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        {product.imageUrls.length} Image{product.imageUrls.length > 1 ? 's' : ''} uploaded
                      </p>
                      <p className="text-xs text-gray-400 break-all truncate">{product.imageUrl}</p>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  {/* Name & Category */}
                  <div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {product.category}
                    </span>
                    <h3 className="text-2xl font-bold text-[#2D2926] mt-2">{product.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-[#D4AF37]">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={cn(
                            star <= Math.floor(product.rating)
                              ? "fill-[#D4AF37] text-[#D4AF37]"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                      <span className="ml-2 text-lg font-semibold text-[#2D2926]">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-500">({product.reviewsCount} reviews)</span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center space-x-4 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Package size={20} className="text-gray-500" />
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-semibold">{product.stockQty} units</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Min Stock:</span>
                      <span className="font-semibold">{product.minStock}</span>
                    </div>
                    <span className={cn("px-3 py-1 text-sm font-semibold rounded-full border", getStatusStyles(product.status))}>
                      {product.status}
                    </span>
                  </div>

                  {/* Basic Details */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Tag size={18} className="text-[#D4AF37]" />
                      <div>
                        <p className="text-xs text-gray-500">Material</p>
                        <p className="font-medium text-[#2D2926]">{product.material || '-'}</p>
                      </div>
                    </div>
                    {product.dimensions && (
                      <div className="flex items-center space-x-2">
                        <Ruler size={18} className="text-[#D4AF37]" />
                        <div>
                          <p className="text-xs text-gray-500">Dimensions</p>
                          <p className="font-medium text-[#2D2926]">{product.dimensions}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} className="text-[#D4AF37]" />
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="font-medium text-[#2D2926] text-sm">{formatDate(product.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-[#D4AF37]" />
                      <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="font-medium text-[#2D2926] text-sm">{formatDate(product.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <div>
                      <h4 className="font-semibold text-[#2D2926] mb-2">Description</h4>
                      <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Specific Details */}
              {getCategorySpecificDetails().length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-[#2D2926] mb-4">{product.category} Specifications</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getCategorySpecificDetails().map((detail, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">{detail.label}</p>
                        <p className="font-medium text-[#2D2926]">{detail.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Value Calculation */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm text-amber-700">Total Stock Value</p>
                    <p className="text-2xl font-bold text-amber-800">
                      {formatCurrency(product.price * product.stockQty)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-amber-600">
                    {product.stockQty} units × {formatCurrency(product.price)}
                  </div>
                </div>
              </div>

              {/* Product ID */}
              <div className="mt-4 text-sm text-gray-500 text-center">
                Product ID: <span className="font-mono">{product.id}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
