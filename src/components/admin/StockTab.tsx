"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Factory,
  ShoppingBag,
  Layers,
  Scissors,
  Hammer,
  Droplets,
  Wrench,
  Loader2,
  PackageX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  StockService, 
  RawMaterialItem, 
  ShopMaterialItem,
  RawMaterialCategory,
  ShopMaterialCategory,
  StockStats
} from "@/lib/firebase/stock";
import AddStockItemForm from "./AddStockItemForm";
import EditRawMaterialModal from "./EditRawMaterialModal";
import EditShopMaterialModal from "./EditShopMaterialModal";
import DeleteStockModal from "./DeleteStockModal";

interface RawMaterialFilters {
  materialType: 'all' | RawMaterialCategory;
  status: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  minQuantity: string;
  maxQuantity: string;
  supplier: string;
  billNo: string;
  searchQuery: string;
}

interface ShopMaterialFilters {
  productType: 'all' | ShopMaterialCategory;
  status: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  color: string;
  size: string;
  materialType: string;
  searchQuery: string;
}

export default function StockTab() {
  const [activeSection, setActiveSection] = useState<'raw' | 'shop'>('raw');
  const [showRawFilters, setShowRawFilters] = useState(false);
  const [showShopFilters, setShowShopFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Firebase data state
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>([]);
  const [shopMaterials, setShopMaterials] = useState<ShopMaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit modal states
  const [editRawMaterial, setEditRawMaterial] = useState<RawMaterialItem | null>(null);
  const [editShopMaterial, setEditShopMaterial] = useState<ShopMaterialItem | null>(null);

  // Delete modal states
  const [deleteRawMaterial, setDeleteRawMaterial] = useState<RawMaterialItem | null>(null);
  const [deleteShopMaterial, setDeleteShopMaterial] = useState<ShopMaterialItem | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter states
  const [rawFilters, setRawFilters] = useState<RawMaterialFilters>({
    materialType: 'all',
    status: 'all',
    minQuantity: '',
    maxQuantity: '',
    supplier: '',
    billNo: '',
    searchQuery: '',
  });

  const [shopFilters, setShopFilters] = useState<ShopMaterialFilters>({
    productType: 'all',
    status: 'all',
    color: '',
    size: '',
    materialType: '',
    searchQuery: '',
  });

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribeRaw = StockService.subscribeToRawMaterials((materials) => {
      setRawMaterials(materials);
      setIsLoading(false);
    });

    const unsubscribeShop = StockService.subscribeToShopMaterials((materials) => {
      setShopMaterials(materials);
      setIsLoading(false);
    });

    return () => {
      unsubscribeRaw();
      unsubscribeShop();
    };
  }, []);

  // Filter raw materials
  const filteredRawMaterials = useMemo(() => {
    return rawMaterials.filter(material => {
      if (rawFilters.materialType !== 'all' && material.category !== rawFilters.materialType) return false;
      if (rawFilters.status !== 'all' && material.status !== rawFilters.status) return false;
      if (rawFilters.minQuantity && material.stockQty < parseFloat(rawFilters.minQuantity)) return false;
      if (rawFilters.maxQuantity && material.stockQty > parseFloat(rawFilters.maxQuantity)) return false;
      if (rawFilters.supplier && !material.supplierName.toLowerCase().includes(rawFilters.supplier.toLowerCase())) return false;
      if (rawFilters.billNo && material.billNo && !material.billNo.toLowerCase().includes(rawFilters.billNo.toLowerCase())) return false;
      if (rawFilters.searchQuery) {
        const query = rawFilters.searchQuery.toLowerCase();
        return (
          material.name.toLowerCase().includes(query) ||
          material.category.toLowerCase().includes(query) ||
          material.supplierName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [rawMaterials, rawFilters]);

  // Filter shop materials
  const filteredShopMaterials = useMemo(() => {
    return shopMaterials.filter(material => {
      if (shopFilters.productType !== 'all' && material.category !== shopFilters.productType) return false;
      if (shopFilters.status !== 'all' && material.status !== shopFilters.status) return false;
      if (shopFilters.color && material.attributes?.color && !material.attributes.color.toLowerCase().includes(shopFilters.color.toLowerCase())) return false;
      if (shopFilters.size && material.attributes?.size && !material.attributes.size.toLowerCase().includes(shopFilters.size.toLowerCase())) return false;
      if (shopFilters.materialType && material.attributes?.material && !material.attributes.material.toLowerCase().includes(shopFilters.materialType.toLowerCase())) return false;
      if (shopFilters.searchQuery) {
        const query = shopFilters.searchQuery.toLowerCase();
        return (
          material.productName.toLowerCase().includes(query) ||
          material.category.toLowerCase().includes(query) ||
          (material.attributes?.color && material.attributes.color.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [shopMaterials, shopFilters]);

  // Calculate stats from Firebase data
  const rawStats: StockStats = StockService.getRawMaterialStats(filteredRawMaterials);
  const shopStats: StockStats = StockService.getShopMaterialStats(filteredShopMaterials);

  const clearRawFilters = () => {
    setRawFilters({
      materialType: 'all',
      status: 'all',
      minQuantity: '',
      maxQuantity: '',
      supplier: '',
      billNo: '',
      searchQuery: '',
    });
  };

  const clearShopFilters = () => {
    setShopFilters({
      productType: 'all',
      status: 'all',
      color: '',
      size: '',
      materialType: '',
      searchQuery: '',
    });
  };

  const rawActiveFiltersCount = Object.entries(rawFilters).filter(([key, value]) => {
    if (key === 'materialType' || key === 'status') return value !== 'all';
    return value !== '';
  }).length;

  const shopActiveFiltersCount = Object.entries(shopFilters).filter(([key, value]) => {
    if (key === 'productType' || key === 'status') return value !== 'all';
    return value !== '';
  }).length;

  const materialIcons: Record<string, React.ReactNode> = {
    Wood: <Layers className="text-amber-600" size={20} />,
    Foam: <Package className="text-blue-600" size={20} />,
    Fabric: <Scissors className="text-purple-600" size={20} />,
    Hardware: <Hammer className="text-gray-600" size={20} />,
    Chemical: <Droplets className="text-green-600" size={20} />,
    Frames: <Wrench className="text-orange-600" size={20} />,
  };


  // Add stock item handler
  const handleAddStockItem = async (stockData: any) => {
    try {
      if (activeSection === 'raw') {
        await StockService.createRawMaterial({
          name: stockData.name,
          category: stockData.category,
          stockQty: stockData.currentStock,
          minQty: stockData.minThreshold,
          unit: stockData.unit,
          supplierName: stockData.supplier,
          billNo: stockData.purchaseBillNo,
          lastPurchaseDate: stockData.lastPurchaseDate,
          costPerUnit: stockData.price,
          subCategory: stockData.subCategory,
        });
        showToast('Raw material added successfully!');
      } else {
        await StockService.createShopMaterial({
          productName: stockData.name,
          category: stockData.category,
          stockQty: stockData.currentStock,
          minQty: stockData.minThreshold,
          unit: stockData.unit,
          price: stockData.price,
          attributes: {
            color: stockData.color,
            size: stockData.size,
            material: stockData.materialType,
          },
        });
        showToast('Shop material added successfully!');
      }
      setShowAddForm(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to add item', 'error');
    }
  };

  // Edit handlers
  const handleSaveRawMaterial = async (updatedMaterial: RawMaterialItem) => {
    try {
      await StockService.updateRawMaterial(updatedMaterial.id, {
        name: updatedMaterial.name,
        category: updatedMaterial.category,
        stockQty: updatedMaterial.stockQty,
        minQty: updatedMaterial.minQty,
        unit: updatedMaterial.unit,
        supplierName: updatedMaterial.supplierName,
        billNo: updatedMaterial.billNo,
        lastPurchaseDate: updatedMaterial.lastPurchaseDate,
        costPerUnit: updatedMaterial.costPerUnit,
        subCategory: updatedMaterial.subCategory,
      });
      setEditRawMaterial(null);
      showToast(`${updatedMaterial.name} updated successfully!`);
    } catch (error: any) {
      showToast(error.message || 'Failed to update material', 'error');
    }
  };

  const handleSaveShopMaterial = async (updatedMaterial: ShopMaterialItem) => {
    try {
      await StockService.updateShopMaterial(updatedMaterial.id, {
        productName: updatedMaterial.productName,
        category: updatedMaterial.category,
        stockQty: updatedMaterial.stockQty,
        minQty: updatedMaterial.minQty,
        unit: updatedMaterial.unit,
        price: updatedMaterial.price,
        attributes: updatedMaterial.attributes,
      });
      setEditShopMaterial(null);
      showToast(`${updatedMaterial.productName} updated successfully!`);
    } catch (error: any) {
      showToast(error.message || 'Failed to update material', 'error');
    }
  };

  // Delete handlers
  const handleDeleteRawMaterial = async () => {
    if (!deleteRawMaterial) return;
    try {
      await StockService.deleteRawMaterial(deleteRawMaterial.id);
      showToast(`${deleteRawMaterial.name} deleted successfully!`);
      setDeleteRawMaterial(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to delete material', 'error');
    }
  };

  const handleDeleteShopMaterial = async () => {
    if (!deleteShopMaterial) return;
    try {
      await StockService.deleteShopMaterial(deleteShopMaterial.id);
      showToast(`${deleteShopMaterial.productName} deleted successfully!`);
      setDeleteShopMaterial(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to delete material', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return '🟢 In Stock';
      case 'low_stock': return '🟡 Low Stock';
      case 'out_of_stock': return '🔴 Out';
      default: return status;
    }
  };

  // Empty State Component
  const EmptyState = ({ type }: { type: 'raw' | 'shop' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-8 sm:py-16 px-4"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <PackageX size={32} className="text-gray-400 sm:hidden" />
        <PackageX size={40} className="text-gray-400 hidden sm:block" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 text-center">No Stock Data Found</h3>
      <p className="text-gray-500 text-center text-sm sm:text-base max-w-md mb-6">
        {type === 'raw' 
          ? 'No raw materials added yet.'
          : 'No shop materials added yet.'}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddForm(true)}
        className="px-4 sm:px-6 py-2 sm:py-3 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2 text-sm sm:text-base"
      >
        <Plus size={18} />
        <span>Add {type === 'raw' ? 'Raw Material' : 'Shop Material'}</span>
      </motion.button>
    </motion.div>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 size={40} className="text-[#D4AF37] animate-spin" />
          <p className="text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 px-4 sm:px-6 py-3 rounded-lg shadow-lg text-sm sm:text-base",
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          )}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2D2926] mb-1 sm:mb-2">
            Stock Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage inventory - Elight Sofa House</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Add Item</span>
        </motion.button>
      </motion.div>

      {/* Section Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveSection('raw')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap ${activeSection === 'raw'
            ? 'bg-[#D4AF37] text-white'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Factory size={18} />
          <span>Raw Materials</span>
        </button>
        <button
          onClick={() => setActiveSection('shop')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap ${activeSection === 'shop'
            ? 'bg-[#D4AF37] text-white'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <ShoppingBag size={18} />
          <span>Shop Materials</span>
        </button>
      </div>

      {/* Raw Materials Section */}
      {activeSection === 'raw' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Raw Material Categories - Responsive Grid */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
            <h3 className="text-base sm:text-lg font-semibold text-[#2D2926] mb-3 sm:mb-4">📦 Categories</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
              {[
                { name: 'Wood', icon: materialIcons.Wood },
                { name: 'Foam', icon: materialIcons.Foam },
                { name: 'Fabric', icon: materialIcons.Fabric },
                { name: 'Hardware', icon: materialIcons.Hardware },
                { name: 'Chemical', icon: materialIcons.Chemical },
                { name: 'Frames', icon: materialIcons.Frames },
              ].map((category) => (
                <motion.div
                  key={category.name}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "bg-gray-50 p-2 sm:p-4 rounded-lg text-center hover:bg-gray-100 transition-colors cursor-pointer border-2",
                    rawFilters.materialType === category.name ? "border-[#D4AF37]" : "border-transparent"
                  )}
                  onClick={() => setRawFilters({ 
                    ...rawFilters, 
                    materialType: rawFilters.materialType === category.name ? 'all' : category.name as RawMaterialCategory 
                  })}
                >
                  <div className="flex justify-center mb-1 sm:mb-2">{category.icon}</div>
                  <h4 className="font-medium text-gray-900 text-xs sm:text-sm">{category.name}</h4>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Raw Material Stats - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[
              { label: "Total", value: rawStats.total, icon: Package, color: "text-blue-600" },
              { label: "In Stock", value: rawStats.inStock, icon: CheckCircle, color: "text-green-600" },
              { label: "Low Stock", value: rawStats.lowStock, icon: AlertTriangle, color: "text-yellow-600" },
              { label: "Out", value: rawStats.outOfStock, icon: AlertTriangle, color: "text-red-600" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-3 sm:p-6 shadow-md"
              >
                <stat.icon className={cn("mb-2", stat.color)} size={20} />
                <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl sm:text-3xl font-bold text-[#2D2926]">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={rawFilters.searchQuery}
                  onChange={(e) => setRawFilters({ ...rawFilters, searchQuery: e.target.value })}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRawFilters(!showRawFilters)}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm ${rawActiveFiltersCount > 0
                    ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                    : 'bg-white text-gray-700 border-gray-300'
                    }`}
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  {rawActiveFiltersCount > 0 && (
                    <span className="bg-white text-[#D4AF37] px-1.5 py-0.5 rounded-full text-xs font-bold">
                      {rawActiveFiltersCount}
                    </span>
                  )}
                </button>
                {rawActiveFiltersCount > 0 && (
                  <button
                    onClick={clearRawFilters}
                    className="flex items-center space-x-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg text-sm"
                  >
                    <X size={14} />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {showRawFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t mt-4 pt-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <select
                    value={rawFilters.materialType}
                    onChange={(e) => setRawFilters({ ...rawFilters, materialType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                  >
                    <option value="all">All Materials</option>
                    <option value="Wood">Wood</option>
                    <option value="Foam">Foam</option>
                    <option value="Fabric">Fabric</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Frames">Frames</option>
                  </select>
                  <select
                    value={rawFilters.status}
                    onChange={(e) => setRawFilters({ ...rawFilters, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                  <input
                    type="text"
                    value={rawFilters.supplier}
                    onChange={(e) => setRawFilters({ ...rawFilters, supplier: e.target.value })}
                    placeholder="Supplier..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                  />
                </div>
              </motion.div>
            )}
          </div>


          {/* Raw Materials Table/Cards */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#2D2926]">Raw Materials</h2>
                <span className="text-xs sm:text-sm text-gray-600">
                  {filteredRawMaterials.length} of {rawMaterials.length} items
                </span>
              </div>
            </div>
            
            {rawMaterials.length === 0 ? (
              <EmptyState type="raw" />
            ) : filteredRawMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Search size={40} className="text-gray-300 mb-4" />
                <p className="text-gray-500">No materials match your filters</p>
                <button onClick={clearRawFilters} className="mt-4 text-[#D4AF37] hover:underline text-sm">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-gray-200">
                  {filteredRawMaterials.map((material) => (
                    <div key={material.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">{materialIcons[material.category] || <Package size={20} />}</div>
                          <div>
                            <p className="font-medium text-[#2D2926]">{material.name}</p>
                            <p className="text-xs text-gray-500">{material.category}</p>
                          </div>
                        </div>
                        <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(material.status))}>
                          {getStatusLabel(material.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-500">Stock:</span> <span className="font-medium">{material.stockQty} {material.unit}</span></div>
                        <div><span className="text-gray-500">Min:</span> <span className="font-medium">{material.minQty}</span></div>
                        <div><span className="text-gray-500">Supplier:</span> <span className="font-medium">{material.supplierName}</span></div>
                        <div><span className="text-gray-500">Bill:</span> <span className="font-medium">{material.billNo || 'N/A'}</span></div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => setEditRawMaterial(material)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm"
                        >
                          <Edit size={14} /><span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteRawMaterial(material)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm"
                        >
                          <Trash2 size={14} /><span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRawMaterials.map((material) => (
                        <tr key={material.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="mr-3">{materialIcons[material.category] || <Package size={20} />}</div>
                              <div>
                                <div className="text-sm font-medium text-[#2D2926]">{material.name}</div>
                                {material.subCategory && <div className="text-xs text-gray-500">{material.subCategory}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{material.category}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{material.stockQty} {material.unit}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{material.minQty}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{material.supplierName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{material.billNo || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(material.status))}>
                              {getStatusLabel(material.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => setEditRawMaterial(material)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => setDeleteRawMaterial(material)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* Shop Materials Section */}
      {activeSection === 'shop' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Shop Material Categories */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
            <h3 className="text-base sm:text-lg font-semibold text-[#2D2926] mb-3 sm:mb-4">🧺 Categories</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
              {[
                { name: 'Cushions', icon: <Package className="text-blue-600" size={20} /> },
                { name: 'Pillows', icon: <Package className="text-purple-600" size={20} /> },
                { name: 'Curtains', icon: <Scissors className="text-green-600" size={20} /> },
                { name: 'Covers', icon: <Layers className="text-gray-600" size={20} /> },
                { name: 'Accessories', icon: <Wrench className="text-pink-600" size={20} /> },
              ].map((category) => (
                <motion.div
                  key={category.name}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "bg-gray-50 p-2 sm:p-4 rounded-lg text-center hover:bg-gray-100 transition-colors cursor-pointer border-2",
                    shopFilters.productType === category.name ? "border-[#D4AF37]" : "border-transparent"
                  )}
                  onClick={() => setShopFilters({ 
                    ...shopFilters, 
                    productType: shopFilters.productType === category.name ? 'all' : category.name as ShopMaterialCategory 
                  })}
                >
                  <div className="flex justify-center mb-1 sm:mb-2">{category.icon}</div>
                  <h4 className="font-medium text-gray-900 text-xs sm:text-sm">{category.name}</h4>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Shop Material Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[
              { label: "Total", value: shopStats.total, icon: Package, color: "text-blue-600" },
              { label: "In Stock", value: shopStats.inStock, icon: CheckCircle, color: "text-green-600" },
              { label: "Low Stock", value: shopStats.lowStock, icon: AlertTriangle, color: "text-yellow-600" },
              { label: "Out", value: shopStats.outOfStock, icon: AlertTriangle, color: "text-red-600" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-3 sm:p-6 shadow-md"
              >
                <stat.icon className={cn("mb-2", stat.color)} size={20} />
                <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl sm:text-3xl font-bold text-[#2D2926]">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={shopFilters.searchQuery}
                  onChange={(e) => setShopFilters({ ...shopFilters, searchQuery: e.target.value })}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowShopFilters(!showShopFilters)}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm ${shopActiveFiltersCount > 0
                    ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                    : 'bg-white text-gray-700 border-gray-300'
                    }`}
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  {shopActiveFiltersCount > 0 && (
                    <span className="bg-white text-[#D4AF37] px-1.5 py-0.5 rounded-full text-xs font-bold">
                      {shopActiveFiltersCount}
                    </span>
                  )}
                </button>
                {shopActiveFiltersCount > 0 && (
                  <button
                    onClick={clearShopFilters}
                    className="flex items-center space-x-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg text-sm"
                  >
                    <X size={14} />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {showShopFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t mt-4 pt-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <select
                    value={shopFilters.productType}
                    onChange={(e) => setShopFilters({ ...shopFilters, productType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                  >
                    <option value="all">All Products</option>
                    <option value="Cushions">Cushions</option>
                    <option value="Pillows">Pillows</option>
                    <option value="Curtains">Curtains</option>
                    <option value="Covers">Covers</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                  <select
                    value={shopFilters.status}
                    onChange={(e) => setShopFilters({ ...shopFilters, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                  <input
                    type="text"
                    value={shopFilters.color}
                    onChange={(e) => setShopFilters({ ...shopFilters, color: e.target.value })}
                    placeholder="Color..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                  />
                </div>
              </motion.div>
            )}
          </div>


          {/* Shop Materials Table/Cards */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#2D2926]">Shop Materials</h2>
                <span className="text-xs sm:text-sm text-gray-600">
                  {filteredShopMaterials.length} of {shopMaterials.length} items
                </span>
              </div>
            </div>
            
            {shopMaterials.length === 0 ? (
              <EmptyState type="shop" />
            ) : filteredShopMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Search size={40} className="text-gray-300 mb-4" />
                <p className="text-gray-500">No materials match your filters</p>
                <button onClick={clearShopFilters} className="mt-4 text-[#D4AF37] hover:underline text-sm">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-gray-200">
                  {filteredShopMaterials.map((material) => (
                    <div key={material.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <ShoppingBag size={20} className="text-[#D4AF37]" />
                          <div>
                            <p className="font-medium text-[#2D2926]">{material.productName}</p>
                            <p className="text-xs text-gray-500">{material.category}</p>
                          </div>
                        </div>
                        <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(material.status))}>
                          {getStatusLabel(material.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-500">Stock:</span> <span className="font-medium">{material.stockQty} {material.unit}</span></div>
                        <div><span className="text-gray-500">Min:</span> <span className="font-medium">{material.minQty}</span></div>
                        <div><span className="text-gray-500">Price:</span> <span className="font-medium">₹{material.price.toLocaleString()}</span></div>
                        {material.attributes?.color && (
                          <div><span className="text-gray-500">Color:</span> <span className="font-medium">{material.attributes.color}</span></div>
                        )}
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => setEditShopMaterial(material)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm"
                        >
                          <Edit size={14} /><span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteShopMaterial(material)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm"
                        >
                          <Trash2 size={14} /><span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attributes</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredShopMaterials.map((material) => (
                        <tr key={material.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <ShoppingBag size={20} className="text-[#D4AF37] mr-3" />
                              <span className="text-sm font-medium text-[#2D2926]">{material.productName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{material.category}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">{material.stockQty} {material.unit}</div>
                            <div className="text-xs text-gray-500">Min: {material.minQty}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {material.attributes?.color && <span className="mr-2">🎨 {material.attributes.color}</span>}
                            {material.attributes?.size && <span className="mr-2">📏 {material.attributes.size}</span>}
                            {!material.attributes?.color && !material.attributes?.size && 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(material.status))}>
                              {getStatusLabel(material.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">₹{material.price.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => setEditShopMaterial(material)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => setDeleteShopMaterial(material)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddStockItemForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddStockItem}
        type={activeSection}
      />

      <EditRawMaterialModal
        isOpen={!!editRawMaterial}
        material={editRawMaterial}
        onClose={() => setEditRawMaterial(null)}
        onSave={handleSaveRawMaterial}
      />

      <EditShopMaterialModal
        isOpen={!!editShopMaterial}
        material={editShopMaterial}
        onClose={() => setEditShopMaterial(null)}
        onSave={handleSaveShopMaterial}
      />

      <DeleteStockModal
        isOpen={!!deleteRawMaterial}
        material={deleteRawMaterial}
        type="raw"
        onClose={() => setDeleteRawMaterial(null)}
        onConfirm={handleDeleteRawMaterial}
      />

      <DeleteStockModal
        isOpen={!!deleteShopMaterial}
        material={deleteShopMaterial}
        type="shop"
        onClose={() => setDeleteShopMaterial(null)}
        onConfirm={handleDeleteShopMaterial}
      />
    </div>
  );
}
