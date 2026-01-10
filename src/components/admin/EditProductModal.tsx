"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { X, Save, Link as LinkIcon, Loader2 } from "lucide-react";
import { ProductItem, ProductCategory, ProductService } from "@/lib/firebase/products";
import {
  SOFA_TYPES,
  SEATING_CAPACITY,
  SOFA_MATERIALS,
  CHAIR_TYPES,
  CHAIR_MATERIALS,
  TABLE_TYPES,
  TABLE_MATERIALS,
  BEDROOM_TYPES,
  BEDROOM_MATERIALS,
  CURTAIN_TYPES,
  CURTAIN_FABRICS,
  SIZES,
} from "@/lib/constants";
import { calculateSofaRate } from "@/lib/pricingUtils";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.enum(["Sofas", "Chairs", "Tables", "Bedroom", "Curtains"]),
  price: z.number().min(1, "Price must be greater than 0"),
  stockQty: z.number().min(0, "Stock cannot be negative"),
  minStock: z.number().min(1, "Minimum stock must be at least 1"),
  material: z.string().min(1, "Please select a material"),
  imageUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  imageUrls: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  description: z.string().optional(),
  sofaType: z.string().optional(),
  seatingCapacity: z.string().optional(),
  sofaSize: z.string().optional(),
  sofaFootPrice: z.number().optional(),
  chairType: z.string().optional(),
  tableType: z.string().optional(),
  bedroomType: z.string().optional(),
  curtainType: z.string().optional(),
  curtainFabric: z.string().optional(),
  curtainSize: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductModalProps {
  product: ProductItem;
  onClose: () => void;
  onSave: (productData: ProductItem) => void;
}

export default function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(product.category);
  const [imagePreview, setImagePreview] = useState<string>(product.imageUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      category: product.category,
      price: product.price,
      stockQty: product.stockQty,
      minStock: product.minStock,
      material: product.material,
      imageUrl: product.imageUrl || "",
      imageUrls: product.imageUrls || [],
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      dimensions: product.dimensions || "",
      description: product.description || "",
      sofaType: product.sofaType,
      seatingCapacity: product.seatingCapacity,
      sofaSize: (product as any).sofaSize || "",
      sofaFootPrice: (product as any).sofaFootPrice || 0,
      chairType: product.chairType,
      tableType: product.tableType,
      bedroomType: product.bedroomType,
      curtainType: product.curtainType,
      curtainFabric: product.curtainFabric,
      curtainSize: product.curtainSize,
    },
  });

  const watchedStockQty = watch("stockQty");
  const watchedMinStock = watch("minStock");

  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category);
    setValue("category", category);
  };

  const handleImageUrlChange = (url: string) => {
    setValue("imageUrl", url);
    setImagePreview(url);
  };

  // Calculate preview status
  const previewStatus = ProductService.calculateStatus(
    Number(watchedStockQty) || 0,
    Number(watchedMinStock) || 5
  );

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const updatedProduct: ProductItem = {
        ...product,
        ...data,
        imageUrls: data.imageUrls || product.imageUrls || [],
        status: ProductService.calculateStatus(data.stockQty, data.minStock),
      };
      await onSave(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaterialOptions = (): string[] => {
    switch (selectedCategory) {
      case "Sofas": return SOFA_MATERIALS;
      case "Chairs": return CHAIR_MATERIALS;
      case "Tables": return TABLE_MATERIALS;
      case "Bedroom": return BEDROOM_MATERIALS;
      case "Curtains": return CURTAIN_FABRICS;
      default: return [];
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
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543]">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Product</h2>
              <p className="text-gray-300 text-sm mt-1">Update product in Firebase Firestore</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">

              {/* Status Preview */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-[#2D2926]">Auto-Calculated Status</h3>
                  <p className="text-sm text-gray-500">Based on Stock Qty and Min Stock</p>
                </div>
                <span className={`px-4 py-2 rounded-full font-semibold ${getStatusStyles(previewStatus)}`}>
                  {previewStatus}
                </span>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(["Sofas", "Chairs", "Tables", "Bedroom", "Curtains"] as ProductCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${selectedCategory === cat
                        ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                        : "border-gray-200 bg-white hover:border-[#D4AF37] text-gray-700"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    {...register("stockQty", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  {errors.stockQty && <p className="mt-1 text-sm text-red-600">{errors.stockQty.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock *</label>
                  <input
                    {...register("minStock", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  {errors.minStock && <p className="mt-1 text-sm text-red-600">{errors.minStock.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                  <select
                    {...register("material")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    <option value="">Select Material</option>
                    {getMaterialOptions().filter(m => m !== "All").map((material) => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                  {errors.material && <p className="mt-1 text-sm text-red-600">{errors.material.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                  <input
                    {...register("dimensions")}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder='e.g., 84" W x 38" D x 36" H'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                  <input
                    {...register("rating", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviews Count</label>
                  <input
                    {...register("reviewsCount", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Category-Specific Fields */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-[#2D2926] mb-4">{selectedCategory} Specific Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedCategory === "Sofas" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sofa Type</label>
                        <select {...register("sofaType")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                          <option value="">Select Type</option>
                          {SOFA_TYPES.filter(t => t !== "All").map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Seating Capacity</label>
                        <select {...register("seatingCapacity")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                          <option value="">Select Capacity</option>
                          {SEATING_CAPACITY.filter(c => c !== "All").map(cap => (
                            <option key={cap} value={cap}>{cap}</option>
                          ))}
                        </select>
                      </div>

                      {/* Per-Foot Pricing Section */}
                      <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                          <span>📐</span> Per-Foot Pricing (Optional)
                        </h4>
                        <p className="text-sm text-amber-600 mb-4">
                          Enter size and price per foot to auto-calculate the product price.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Size (ft)</label>
                            <input
                              {...register("sofaSize")}
                              type="text"
                              className="w-full px-4 py-3 border border-amber-300 bg-white rounded-lg focus:outline-none focus:border-[#D4AF37]"
                              placeholder="e.g., 8ft or 8 x 6 ft"
                            />
                            <p className="text-xs text-gray-500 mt-1">Single: 8ft | Area: 8 x 6 ft</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">₹ per Foot</label>
                            <input
                              {...register("sofaFootPrice", { valueAsNumber: true })}
                              type="number"
                              min="0"
                              className="w-full px-4 py-3 border border-amber-300 bg-white rounded-lg focus:outline-none focus:border-[#D4AF37]"
                              placeholder="e.g., 2500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Calculated Price</label>
                            <div className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg text-gray-600">
                              {(() => {
                                const size = watch("sofaSize");
                                const footPrice = watch("sofaFootPrice");
                                if (size && footPrice && footPrice > 0) {
                                  const calc = calculateSofaRate(size, footPrice);
                                  if (calc.isValid) {
                                    return `₹${calc.rate.toLocaleString('en-IN')} (${calc.totalFeet} ft)`;
                                  }
                                  return calc.error || 'Invalid size';
                                }
                                return 'Enter size & ₹/ft';
                              })()}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const size = watch("sofaSize");
                            const footPrice = watch("sofaFootPrice");
                            if (size && footPrice && footPrice > 0) {
                              const calc = calculateSofaRate(size, footPrice);
                              if (calc.isValid) {
                                setValue("price", calc.rate);
                              }
                            }
                          }}
                          className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                        >
                          Apply Calculated Price
                        </button>
                      </div>
                    </>
                  )}

                  {selectedCategory === "Chairs" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chair Type</label>
                      <select {...register("chairType")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                        <option value="">Select Type</option>
                        {CHAIR_TYPES.filter(t => t !== "All").map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedCategory === "Tables" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Table Type</label>
                      <select {...register("tableType")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                        <option value="">Select Type</option>
                        {TABLE_TYPES.filter(t => t !== "All").map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedCategory === "Bedroom" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedroom Furniture Type</label>
                      <select {...register("bedroomType")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                        <option value="">Select Type</option>
                        {BEDROOM_TYPES.filter(t => t !== "All").map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedCategory === "Curtains" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Curtain Type</label>
                        <select {...register("curtainType")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                          <option value="">Select Type</option>
                          {CURTAIN_TYPES.filter(t => t !== "All").map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fabric</label>
                        <select {...register("curtainFabric")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                          <option value="">Select Fabric</option>
                          {CURTAIN_FABRICS.filter(f => f !== "All").map(fabric => (
                            <option key={fabric} value={fabric}>{fabric}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                        <select {...register("curtainSize")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                          <option value="">Select Size</option>
                          {SIZES.filter(s => s !== "All").map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Image URL Field */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <LinkIcon className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-blue-800">Image URL Only</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        Enter image URL from external CDN, local path, or any web URL.
                        <span className="font-semibold"> No file upload to Firebase Storage.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  {...register("imageUrl")}
                  type="url"
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}

                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Invalid+URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  placeholder="Enter product description..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Saving to Firebase...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
