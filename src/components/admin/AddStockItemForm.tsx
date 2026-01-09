"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Package, Factory, ShoppingBag, Layers, Scissors, Hammer, Droplets, Wrench } from "lucide-react";
import { RawMaterialCategory, ShopMaterialCategory } from "@/lib/firebase/stock";

interface AddStockItemFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (stockData: any) => void;
    type: 'raw' | 'shop';
}

export default function AddStockItemForm({ isOpen, onClose, onSubmit, type }: AddStockItemFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        subCategory: "",
        currentStock: "",
        minThreshold: "",
        unit: "",
        supplier: "",
        purchaseBillNo: "",
        lastPurchaseDate: "",
        price: "",
        color: "",
        size: "",
        materialType: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rawMaterialCategories: RawMaterialCategory[] = ["Wood", "Foam", "Fabric", "Hardware", "Chemical", "Frames"];
    const shopMaterialCategories: ShopMaterialCategory[] = ["Cushions", "Pillows", "Curtains", "Covers", "Accessories"];

    const units = ["pieces", "sheets", "meters", "liters", "kg", "boxes", "rolls", "sets", "pairs"];

    const woodSubCategories = ["Teak", "Pine", "Plywood", "MDF", "Particle Board"];
    const foamSubCategories = ["Soft Foam", "Medium Foam", "Hard Foam", "Memory Foam"];
    const fabricSubCategories = ["Cotton", "Velvet", "Leather", "Synthetic", "Linen"];
    const hardwareSubCategories = ["Springs", "Nails", "Screws", "Hinges", "Handles"];
    const chemicalSubCategories = ["Adhesives", "Polish", "Stain", "Varnish", "Cleaner"];

    const getSubCategories = (category: string) => {
        switch (category) {
            case "Wood": return woodSubCategories;
            case "Foam": return foamSubCategories;
            case "Fabric": return fabricSubCategories;
            case "Hardware": return hardwareSubCategories;
            case "Chemical": return chemicalSubCategories;
            default: return [];
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.currentStock.trim()) newErrors.currentStock = "Stock quantity is required";
        else if (isNaN(Number(formData.currentStock)) || Number(formData.currentStock) < 0)
            newErrors.currentStock = "Stock quantity must be ≥ 0";
        if (!formData.minThreshold.trim()) newErrors.minThreshold = "Minimum quantity is required";
        else if (isNaN(Number(formData.minThreshold)) || Number(formData.minThreshold) < 0)
            newErrors.minThreshold = "Minimum quantity must be ≥ 0";
        if (!formData.unit) newErrors.unit = "Unit is required";

        if (type === 'raw') {
            if (!formData.supplier.trim()) newErrors.supplier = "Supplier name is required";
        } else {
            if (!formData.price.trim()) newErrors.price = "Price is required";
            else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0)
                newErrors.price = "Price must be > 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const stockData = {
                ...formData,
                currentStock: Number(formData.currentStock),
                minThreshold: Number(formData.minThreshold),
                price: Number(formData.price) || 0,
            };

            await onSubmit(stockData);

            // Reset form
            setFormData({
                name: "",
                category: "",
                subCategory: "",
                currentStock: "",
                minThreshold: "",
                unit: "",
                supplier: "",
                purchaseBillNo: "",
                lastPurchaseDate: "",
                price: "",
                color: "",
                size: "",
                materialType: "",
            });
            setErrors({});
        } catch (error) {
            console.error("Error adding stock item:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Wood": return <Layers className="text-amber-600" size={20} />;
            case "Foam": return <Package className="text-blue-600" size={20} />;
            case "Fabric": return <Scissors className="text-purple-600" size={20} />;
            case "Hardware": return <Hammer className="text-gray-600" size={20} />;
            case "Chemical": return <Droplets className="text-green-600" size={20} />;
            case "Frames": return <Wrench className="text-orange-600" size={20} />;
            case "Cushions": return <Package className="text-blue-600" size={20} />;
            case "Pillows": return <Package className="text-purple-600" size={20} />;
            case "Curtains": return <Scissors className="text-green-600" size={20} />;
            case "Covers": return <Layers className="text-gray-600" size={20} />;
            case "Accessories": return <Wrench className="text-pink-600" size={20} />;
            default: return <Package className="text-gray-600" size={20} />;
        }
    };

    if (!isOpen) return null;

    const categories = type === 'raw' ? rawMaterialCategories : shopMaterialCategories;
    const title = type === 'raw' ? 'Add Raw Material' : 'Add Shop Material';
    const icon = type === 'raw' ? <Factory size={24} /> : <ShoppingBag size={24} />;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#D4AF37]/20 rounded-lg">
                            <div className="text-[#D4AF37]">{icon}</div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-[#2D2926]">{title}</h2>
                            <p className="text-gray-600">Add to Firebase - Elight Sofa House</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#2D2926] flex items-center space-x-2">
                                <Package size={20} />
                                <span>Basic Information</span>
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {type === 'raw' ? 'Material Name' : 'Product Name'} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.name ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder={type === 'raw' ? "Enter material name" : "Enter product name"}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => {
                                        handleInputChange("category", e.target.value);
                                        handleInputChange("subCategory", "");
                                    }}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.category ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                            </div>

                            {type === 'raw' && formData.category && getSubCategories(formData.category).length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sub Category / Variant
                                    </label>
                                    <select
                                        value={formData.subCategory}
                                        onChange={(e) => handleInputChange("subCategory", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    >
                                        <option value="">Select sub category</option>
                                        {getSubCategories(formData.category).map((subCat) => (
                                            <option key={subCat} value={subCat}>
                                                {subCat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {type === 'shop' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            🎨 Color
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => handleInputChange("color", e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                            placeholder="Enter color"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            📏 Size
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.size}
                                            onChange={(e) => handleInputChange("size", e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                            placeholder="Enter size"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            🧵 Material Type
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.materialType}
                                            onChange={(e) => handleInputChange("materialType", e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                            placeholder="Enter material type"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Stock & Purchase Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#2D2926] flex items-center space-x-2">
                                {getCategoryIcon(formData.category)}
                                <span>Stock Information</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Qty *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.currentStock}
                                        onChange={(e) => handleInputChange("currentStock", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.currentStock ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="0"
                                        min="0"
                                    />
                                    {errors.currentStock && <p className="text-red-500 text-sm mt-1">{errors.currentStock}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Qty *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minThreshold}
                                        onChange={(e) => handleInputChange("minThreshold", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.minThreshold ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="0"
                                        min="0"
                                    />
                                    {errors.minThreshold && <p className="text-red-500 text-sm mt-1">{errors.minThreshold}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit *
                                </label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange("unit", e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.unit ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select unit</option>
                                    {units.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                                {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                            </div>

                            {type === 'shop' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange("price", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.price ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>
                            )}

                            {type === 'raw' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Supplier Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.supplier}
                                            onChange={(e) => handleInputChange("supplier", e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#D4AF37] ${errors.supplier ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="Enter supplier name"
                                        />
                                        {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bill No
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.purchaseBillNo}
                                            onChange={(e) => handleInputChange("purchaseBillNo", e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                            placeholder="Enter bill number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Purchase Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.lastPurchaseDate}
                                            onChange={(e) => handleInputChange("lastPurchaseDate", e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cost Per Unit (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => handleInputChange("price", e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Status Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>📊 Auto Status:</strong> Status will be calculated automatically:
                            <br />• Stock {'>'} Min Qty = 🟢 In Stock
                            <br />• Stock ≤ Min Qty = 🟡 Low Stock  
                            <br />• Stock = 0 = 🔴 Out of Stock
                        </p>
                    </div>

                    <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Adding to Firebase...</span>
                                </>
                            ) : (
                                <>
                                    <Package size={20} />
                                    <span>Add {type === 'raw' ? 'Raw Material' : 'Shop Material'}</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
