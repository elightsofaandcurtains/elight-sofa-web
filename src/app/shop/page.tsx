"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Package, RefreshCw } from "lucide-react";
import { ProductService, ProductItem, ProductCategory } from "@/lib/firebase/products";
import {
  CATEGORIES,
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
} from "@/lib/constants";
import LuxuryProductCard from "@/components/LuxuryProductCard";
import HorizontalFilters from "@/components/HorizontalFilters";

interface FilterState {
  sofaType: string;
  seatingCapacity: string;
  material: string;
  color: string;
  frameMaterial: string;
  cushionType: string;
  priceRange: string;
  usage: string;
  customization: string;
  availability: string;
  curtainType: string;
  curtainFabric: string;
  lightControl: string;
  pattern: string;
  size: string;
  mountingStyle: string;
  roomType: string;
  customOrder: string;
  chairType: string;
  chairUsage: string;
  chairMaterial: string;
  comfortLevel: string;
  designStyle: string;
  chairSeatingCapacity: string;
  chairColor: string;
  chairAvailability: string;
  tableType: string;
  tableMaterial: string;
  tableShape: string;
  tableSeating: string;
  tableUsage: string;
  tableStyle: string;
  tableAvailability: string;
  bedroomType: string;
  bedSize: string;
  bedroomMaterial: string;
  bedroomStyle: string;
  storageOption: string;
  bedroomColor: string;
  bedroomAvailability: string;
}

const initialFilters: FilterState = {
  sofaType: "All",
  seatingCapacity: "All",
  material: "All",
  color: "All",
  frameMaterial: "All",
  cushionType: "All",
  priceRange: "All",
  usage: "All",
  customization: "All",
  availability: "All",
  curtainType: "All",
  curtainFabric: "All",
  lightControl: "All",
  pattern: "All",
  size: "All",
  mountingStyle: "All",
  roomType: "All",
  customOrder: "All",
  chairType: "All",
  chairUsage: "All",
  chairMaterial: "All",
  comfortLevel: "All",
  designStyle: "All",
  chairSeatingCapacity: "All",
  chairColor: "All",
  chairAvailability: "All",
  tableType: "All",
  tableMaterial: "All",
  tableShape: "All",
  tableSeating: "All",
  tableUsage: "All",
  tableStyle: "All",
  tableAvailability: "All",
  bedroomType: "All",
  bedSize: "All",
  bedroomMaterial: "All",
  bedroomStyle: "All",
  storageOption: "All",
  bedroomColor: "All",
  bedroomAvailability: "All",
};

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time Firebase subscription
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = ProductService.subscribeToProducts((fetchedProducts) => {
      // Only show products that are in stock or low stock (not out of stock for public view)
      // Or show all - depending on business requirement
      setProducts(fetchedProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    setSearchQuery("");
  };

  const getPriceRange = (priceRangeLabel: string) => {
    if (priceRangeLabel === "All") return { min: 0, max: Infinity };

    const matches = priceRangeLabel.match(/₹([\d,]+)/g);
    if (matches && matches.length >= 2) {
      const min = parseInt(matches[0].replace(/₹|,/g, ''));
      const max = parseInt(matches[1].replace(/₹|,/g, ''));
      return { min, max };
    }

    if (priceRangeLabel.includes('+')) {
      const match = priceRangeLabel.match(/₹([\d,]+)/);
      if (match) {
        const min = parseInt(match[1].replace(/,/g, ''));
        return { min, max: Infinity };
      }
    }

    return { min: 0, max: Infinity };
  };

  // Filter products from Firebase data
  const filteredProducts = products.filter((product) => {
    // Category filter
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

    // Search filter
    const matchesSearch = searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.material && product.material.toLowerCase().includes(searchQuery.toLowerCase()));

    // Price range filter
    const priceRange = getPriceRange(filters.priceRange);
    const matchesPrice = filters.priceRange === "All" ||
      (product.price >= priceRange.min && product.price <= priceRange.max);

    // Material filter
    const matchesMaterial = filters.material === "All" ||
      product.material === filters.material ||
      (product.material && product.material.includes(filters.material));

    // Sofa-specific filters
    const matchesSofaType = filters.sofaType === "All" || product.sofaType === filters.sofaType;
    const matchesSeatingCapacity = filters.seatingCapacity === "All" || product.seatingCapacity === filters.seatingCapacity;

    // Chair-specific filters
    const matchesChairType = filters.chairType === "All" || product.chairType === filters.chairType;

    // Table-specific filters
    const matchesTableType = filters.tableType === "All" || product.tableType === filters.tableType;

    // Bedroom-specific filters
    const matchesBedroomType = filters.bedroomType === "All" || product.bedroomType === filters.bedroomType;

    // Curtain-specific filters
    const matchesCurtainType = filters.curtainType === "All" || product.curtainType === filters.curtainType;
    const matchesCurtainFabric = filters.curtainFabric === "All" || product.curtainFabric === filters.curtainFabric;

    return matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesMaterial &&
      matchesSofaType &&
      matchesSeatingCapacity &&
      matchesChairType &&
      matchesTableType &&
      matchesBedroomType &&
      matchesCurtainType &&
      matchesCurtainFabric;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] pt-24 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2D2926] mb-4">
            Our Collections
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our curated selection of luxury furniture pieces and premium curtains
          </p>
          <p className="text-sm text-[#D4AF37] mt-2">
            {products.length} products available
          </p>
        </motion.div>

        {/* Horizontal Filters */}
        <HorizontalFilters
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearAllFilters}
          filteredCount={filteredProducts.length}
        />

        <div className="w-full">
          {/* Search Bar - Mobile */}
          <div className="lg:hidden mb-6">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block mb-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] bg-white shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Products Grid - REAL-TIME FIREBASE DATA */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <LuxuryProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-4">
                {products.length === 0
                  ? "No products available yet"
                  : "No products found matching your criteria"}
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-[#D4AF37] text-white font-medium rounded hover:bg-[#B8941F] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Custom Inquiry CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-[#D4AF37]/10 to-[#B8941F]/10 rounded-xl border border-[#D4AF37]/20 text-center">
          <h3 className="text-2xl font-bold text-[#2D2926] mb-4">
            Need Something Custom?
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            We create bespoke furniture pieces and custom curtains tailored to your exact vision and space requirements
          </p>
          <a
            href="/inquiry"
            className="inline-block px-8 py-3 bg-[#D4AF37] text-white font-semibold rounded-lg hover:bg-[#B8941F] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Request Custom Quote
          </a>
        </div>
      </div>
    </div>
  );
}
