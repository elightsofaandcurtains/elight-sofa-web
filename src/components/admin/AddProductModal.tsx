"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { X, Link as LinkIcon, AlertCircle, Loader2, Upload, Image as ImageIcon, Check } from "lucide-react";
import { ProductCategory } from "@/lib/firebase/products";
import { uploadImageToGitHub, uploadMultipleImagesToGitHub, isGitHubConfigured } from "@/lib/githubImageUpload";
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

// Validation schema
const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.enum(["Sofas", "Chairs", "Tables", "Bedroom", "Curtains"], {
    required_error: "Please select a category",
  }),
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
  // Category-specific
  sofaType: z.string().optional(),
  seatingCapacity: z.string().optional(),
  chairType: z.string().optional(),
  tableType: z.string().optional(),
  bedroomType: z.string().optional(),
  curtainType: z.string().optional(),
  curtainFabric: z.string().optional(),
  curtainSize: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductModalProps {
  onClose: () => void;
  onSave: (productData: any) => void;
}

export default function AddProductModal({ onClose, onSave }: AddProductModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageMode, setImageMode] = useState<"url" | "upload">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const githubConfigured = isGitHubConfigured();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stockQty: 0,
      minStock: 5,
      rating: 0,
      reviewsCount: 0,
      imageUrls: [],
    },
  });

  const watchedImageUrl = watch("imageUrl");

  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category);
    setValue("category", category);
    // Reset category-specific fields
    setValue("sofaType", undefined);
    setValue("seatingCapacity", undefined);
    setValue("chairType", undefined);
    setValue("tableType", undefined);
    setValue("bedroomType", undefined);
    setValue("curtainType", undefined);
    setValue("curtainFabric", undefined);
    setValue("curtainSize", undefined);
    setValue("material", "");
  };

  const handleImageUrlChange = (url: string) => {
    setValue("imageUrl", url);
    setImagePreview(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setIsUploading(true);
    setUploadProgress(`Uploading 0/${files.length}...`);

    try {
      // Show local previews immediately
      const localPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...localPreviews]);

      // Upload to GitHub
      const result = await uploadMultipleImagesToGitHub(Array.from(files));

      if (result.success && result.urls.length > 0) {
        const currentUrls = getValues("imageUrls") || [];
        const newUrls = [...currentUrls, ...result.urls];
        setValue("imageUrls", newUrls);
        setValue("imageUrl", newUrls[0]); // Set first image as main
        setImagePreviews(newUrls);
        setUploadProgress("");

        if (result.errors.length > 0) {
          setUploadError(`Some uploads failed: ${result.errors.join(", ")}`);
        }
      } else {
        setUploadError(result.errors.join(", ") || "Upload failed");
        setImagePreviews([]);
      }
    } catch (error) {
      setUploadError("Failed to upload images");
      setImagePreviews([]);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const currentUrls = getValues("imageUrls") || [];
    const newUrls = currentUrls.filter((_, i) => i !== index);
    setValue("imageUrls", newUrls);
    setValue("imageUrl", newUrls[0] || "");
    setImagePreviews(newUrls);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error saving product:", error);
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

  return (
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
            <h2 className="text-2xl font-bold text-white">Add New Product</h2>
            <p className="text-gray-300 text-sm mt-1">Category-wise product entry • Image URL only</p>
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

            {/* Step 1: Category Selection (REQUIRED FIRST) */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <label className="block text-sm font-semibold text-amber-800 mb-3">
                Step 1: Select Category *
              </label>
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
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Step 2: Product Details (Show only after category selected) */}
            {selectedCategory && (
              <>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      {...register("price", { valueAsNumber: true })}
                      type="number"
                      min="1"
                      step="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="0"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      {...register("stockQty", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="0"
                    />
                    {errors.stockQty && (
                      <p className="mt-1 text-sm text-red-600">{errors.stockQty.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Stock (for Low Stock alert) *
                    </label>
                    <input
                      {...register("minStock", { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="5"
                    />
                    {errors.minStock && (
                      <p className="mt-1 text-sm text-red-600">{errors.minStock.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Status auto-calculates: Stock &gt; Min = In Stock, Stock ≤ Min = Low Stock, Stock = 0 = Out of Stock
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material *
                    </label>
                    <select
                      {...register("material")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    >
                      <option value="">Select Material</option>
                      {getMaterialOptions().filter(m => m !== "All").map((material) => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                    {errors.material && (
                      <p className="mt-1 text-sm text-red-600">{errors.material.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions
                    </label>
                    <input
                      {...register("dimensions")}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder='e.g., 84" W x 38" D x 36" H'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (0-5)
                    </label>
                    <input
                      {...register("rating", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reviews Count
                    </label>
                    <input
                      {...register("reviewsCount", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Category-Specific Fields */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-[#2D2926] mb-4">
                    {selectedCategory} Specific Details
                  </h3>
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

                {/* Image Upload / URL Field */}
                <div className="border-t pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <ImageIcon className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-blue-800">Product Images</h4>
                        <p className="text-sm text-blue-600 mt-1">
                          Upload multiple images (saves to GitHub) or enter a URL.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image Mode Toggle */}
                  <div className="flex space-x-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${imageMode === "upload"
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      <Upload size={18} />
                      <span>Upload Images</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${imageMode === "url"
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      <LinkIcon size={18} />
                      <span>Enter URL</span>
                    </button>
                  </div>

                  {/* Upload Mode */}
                  {imageMode === "upload" && (
                    <div>
                      {!githubConfigured ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                          <p className="font-medium">GitHub not configured</p>
                          <p className="text-sm mt-1">
                            Add NEXT_PUBLIC_GITHUB_OWNER, NEXT_PUBLIC_GITHUB_REPO, and NEXT_PUBLIC_GITHUB_TOKEN to your .env.local file.
                          </p>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isUploading
                            ? "border-[#D4AF37] bg-[#D4AF37]/5"
                            : "border-gray-300 hover:border-[#D4AF37] hover:bg-gray-50"
                            }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          {isUploading ? (
                            <div className="flex flex-col items-center">
                              <Loader2 size={40} className="text-[#D4AF37] animate-spin mb-2" />
                              <p className="text-gray-600">{uploadProgress || "Uploading to GitHub..."}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload size={40} className="text-gray-400 mb-2" />
                              <p className="text-gray-600">Click to upload images</p>
                              <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB each • Multiple files allowed</p>
                            </div>
                          )}
                        </div>
                      )}
                      {uploadError && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {uploadError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* URL Mode */}
                  {imageMode === "url" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        {...register("imageUrl")}
                        type="url"
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                        placeholder="https://example.com/image.jpg"
                      />
                      {errors.imageUrl && (
                        <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
                      )}
                    </div>
                  )}

                  {/* Image Previews Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Uploaded Images ({imagePreviews.length}):</p>
                      <div className="grid grid-cols-4 gap-3">
                        {imagePreviews.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Error';
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-[#D4AF37] text-white text-xs px-2 py-0.5 rounded">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single URL Preview */}
                  {imageMode === "url" && imagePreview && imagePreviews.length === 0 && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Enter product description..."
                  />
                </div>
              </>
            )}

            {/* Show message if no category selected */}
            {!selectedCategory && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Please select a category first to continue adding product details.</p>
              </div>
            )}
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
              disabled={isSubmitting || !selectedCategory}
              className="px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Adding to Firebase...</span>
                </>
              ) : (
                <span>Add Product</span>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
