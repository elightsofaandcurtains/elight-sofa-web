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
    <div className="min-h-screen bg-[#F9F8F6] pt-24 pb-12 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated Header with Video Background */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative overflow-hidden rounded-3xl"
        >
          {/* Video Background for Header */}
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src="/sofa-background.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Header Content */}
          <div className="relative z-10 py-24 md:py-32 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1 bg-[#D4AF37]/90 text-white text-sm font-medium rounded-full mb-4">
                Premium Collection
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg"
            >
              Our Collections
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base md:text-lg text-white/90 max-w-2xl mx-auto px-4 drop-shadow-md"
            >
              Discover our curated selection of luxury furniture pieces and premium curtains
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
              <span className="text-sm text-[#D4AF37] font-medium drop-shadow-md">
                {products.length} products available
              </span>
              <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
            </motion.div>
          </div>
        </motion.div>

        {/* Horizontal Filters with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <HorizontalFilters
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearAllFilters}
            filteredCount={filteredProducts.length}
          />
        </motion.div>

        <div className="w-full">
          {/* Search Bar - Mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="lg:hidden mb-6"
          >
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 bg-white shadow-sm transition-all"
              />
            </div>
          </motion.div>

          {/* Search Bar - Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="hidden lg:block mb-8"
          >
            <div className="max-w-md mx-auto">
              <div className="relative group">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 bg-white shadow-sm transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Products Grid with staggered animation */}
          {filteredProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <LuxuryProductCard
                    product={product}
                    index={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-12 text-center shadow-sm"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <p className="text-xl text-gray-600 mb-4">
                {products.length === 0
                  ? "No products available yet"
                  : "No products found matching your criteria"}
              </p>
              <motion.button
                onClick={clearAllFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors"
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Custom Inquiry CTA with animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-8 sm:p-12 bg-gradient-to-r from-[#2D2926] to-[#3D3936] rounded-2xl text-center relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium rounded-full mb-4"
            >
              Bespoke Service
            </motion.span>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4"
            >
              Need Something Custom?
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              We create bespoke furniture pieces and custom curtains tailored to your exact vision
            </motion.p>

            <motion.a
              href="/inquiry"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(212, 175, 55, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-[#D4AF37] text-white font-semibold rounded-xl hover:bg-[#B8941F] transition-all shadow-lg"
            >
              Request Custom Quote
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
