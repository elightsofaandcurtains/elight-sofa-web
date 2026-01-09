"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Filter, SlidersHorizontal } from "lucide-react";
import {
    CATEGORIES,
    SOFA_TYPES,
    SEATING_CAPACITY,
    SOFA_MATERIALS,
    COLORS,
    FRAME_MATERIALS,
    CUSHION_TYPES,
    PRICE_RANGES,
    USAGE_TYPES,
    CUSTOMIZATION_OPTIONS,
    AVAILABILITY_OPTIONS,
    CURTAIN_TYPES,
    CURTAIN_FABRICS,
    LIGHT_CONTROL,
    PATTERNS,
    SIZES,
    MOUNTING_STYLES,
    ROOM_TYPES,
    CURTAIN_PRICE_RANGES,
    CUSTOM_ORDER_OPTIONS,
    CHAIR_TYPES,
    CHAIR_USAGE,
    CHAIR_MATERIALS,
    COMFORT_LEVELS,
    DESIGN_STYLES,
    SEATING_CAPACITY_CHAIRS,
    CHAIR_PRICE_RANGES,
    CHAIR_COLORS,
    CHAIR_AVAILABILITY,
    TABLE_TYPES,
    TABLE_MATERIALS,
    TABLE_SHAPES,
    TABLE_SEATING,
    TABLE_USAGE,
    TABLE_PRICE_RANGES,
    TABLE_STYLES,
    TABLE_AVAILABILITY,
    BEDROOM_TYPES,
    BED_SIZES,
    BEDROOM_MATERIALS,
    BEDROOM_STYLES,
    STORAGE_OPTIONS,
    BEDROOM_COLORS,
    BEDROOM_PRICE_RANGES,
    BEDROOM_AVAILABILITY,
} from "@/lib/constants";

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
    // Chair filters
    chairType: string;
    chairUsage: string;
    chairMaterial: string;
    comfortLevel: string;
    designStyle: string;
    chairSeatingCapacity: string;
    chairColor: string;
    chairAvailability: string;
    // Table filters
    tableType: string;
    tableMaterial: string;
    tableShape: string;
    tableSeating: string;
    tableUsage: string;
    tableStyle: string;
    tableAvailability: string;
    // Bedroom filters
    bedroomType: string;
    bedSize: string;
    bedroomMaterial: string;
    bedroomStyle: string;
    storageOption: string;
    bedroomColor: string;
    bedroomAvailability: string;
}

interface HorizontalFiltersProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    filters: FilterState;
    onFilterChange: (filterType: keyof FilterState, value: string) => void;
    onClearFilters: () => void;
    filteredCount: number;
}

interface FilterDropdownProps {
    title: string;
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

const FilterDropdown = ({ title, options, selectedValue, onSelect }: FilterDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSelection = selectedValue !== "All";

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${hasSelection
                    ? "bg-[#D4AF37] text-white border-[#D4AF37]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#D4AF37]"
                    }`}
            >
                <span className="text-sm font-medium">{title}</span>
                {hasSelection && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {selectedValue}
                    </span>
                )}
                <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-y-auto"
                        >
                            <div className="p-2">
                                {options.map((option) => {
                                    const isSelected = selectedValue === option;

                                    return (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                onSelect(option);
                                                setIsOpen(false);
                                            }}
                                            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${isSelected
                                                ? "bg-[#D4AF37] text-white"
                                                : "hover:bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                {isSelected && <span className="text-white">✓</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function HorizontalFilters({
    selectedCategory,
    onCategoryChange,
    filters,
    onFilterChange,
    onClearFilters,
    filteredCount,
}: HorizontalFiltersProps) {
    const [showAllFilters, setShowAllFilters] = useState(false);

    const activeFilters = Object.entries(filters).filter(([_, value]) => value !== "All");
    const hasActiveFilters = activeFilters.length > 0;

    const isSofaCategory = selectedCategory === "Sofas";
    const isChairCategory = selectedCategory === "Chairs";
    const isCurtainCategory = selectedCategory === "Curtains";

    const getMainFilters = () => {
        const mainFilters = [];

        if (isSofaCategory || selectedCategory === "All") {
            mainFilters.push(
                { key: "sofaType", title: "Sofa Type", options: SOFA_TYPES },
                { key: "seatingCapacity", title: "Capacity", options: SEATING_CAPACITY },
                { key: "material", title: "Material", options: SOFA_MATERIALS },
                { key: "color", title: "Color", options: COLORS },
                { key: "frameMaterial", title: "Frame Material", options: FRAME_MATERIALS },
                { key: "cushionType", title: "Cushion Type", options: CUSHION_TYPES },
                { key: "usage", title: "Usage", options: USAGE_TYPES },
                { key: "customization", title: "Customization", options: CUSTOMIZATION_OPTIONS },
                { key: "availability", title: "Availability", options: AVAILABILITY_OPTIONS },
                { key: "priceRange", title: "Price", options: PRICE_RANGES }
            );
        }

        if (isChairCategory || selectedCategory === "All") {
            mainFilters.push(
                { key: "chairType", title: "🔎 Chair Type", options: CHAIR_TYPES },
                { key: "chairUsage", title: "🏠 Usage / Space", options: CHAIR_USAGE },
                { key: "chairMaterial", title: "🪵 Material", options: CHAIR_MATERIALS },
                { key: "comfortLevel", title: "💺 Comfort Level", options: COMFORT_LEVELS },
                { key: "designStyle", title: "🎨 Design Style", options: DESIGN_STYLES },
                { key: "chairSeatingCapacity", title: "👥 Seating Capacity", options: SEATING_CAPACITY_CHAIRS },
                { key: "chairColor", title: "🎨 Color", options: CHAIR_COLORS },
                { key: "chairAvailability", title: "📦 Availability", options: CHAIR_AVAILABILITY },
                { key: "priceRange", title: "💰 Price Range", options: isChairCategory ? CHAIR_PRICE_RANGES : PRICE_RANGES }
            );
        }

        if (selectedCategory === "Tables" || selectedCategory === "All") {
            mainFilters.push(
                { key: "tableType", title: "🪑 Table Type", options: TABLE_TYPES },
                { key: "tableMaterial", title: "🪵 Material", options: TABLE_MATERIALS },
                { key: "tableShape", title: "⭕ Shape", options: TABLE_SHAPES },
                { key: "tableSeating", title: "👥 Seating", options: TABLE_SEATING },
                { key: "tableUsage", title: "🏠 Usage", options: TABLE_USAGE },
                { key: "tableStyle", title: "🎨 Style", options: TABLE_STYLES },
                { key: "tableAvailability", title: "📦 Availability", options: TABLE_AVAILABILITY },
                { key: "priceRange", title: "💰 Price Range", options: selectedCategory === "Tables" ? TABLE_PRICE_RANGES : PRICE_RANGES }
            );
        }

        if (selectedCategory === "Bedroom" || selectedCategory === "All") {
            mainFilters.push(
                { key: "bedroomType", title: "🛏️ Bedroom Type", options: BEDROOM_TYPES },
                { key: "bedSize", title: "📏 Bed Size", options: BED_SIZES },
                { key: "bedroomMaterial", title: "🪵 Material", options: BEDROOM_MATERIALS },
                { key: "bedroomStyle", title: "🎨 Style", options: BEDROOM_STYLES },
                { key: "storageOption", title: "📦 Storage", options: STORAGE_OPTIONS },
                { key: "bedroomColor", title: "🎨 Color", options: BEDROOM_COLORS },
                { key: "bedroomAvailability", title: "📦 Availability", options: BEDROOM_AVAILABILITY },
                { key: "priceRange", title: "💰 Price Range", options: selectedCategory === "Bedroom" ? BEDROOM_PRICE_RANGES : PRICE_RANGES }
            );
        }

        if (isCurtainCategory || selectedCategory === "All") {
            mainFilters.push(
                { key: "curtainType", title: "Curtain Type", options: CURTAIN_TYPES },
                { key: "curtainFabric", title: "Fabric", options: CURTAIN_FABRICS },
                { key: "lightControl", title: "Light Control", options: LIGHT_CONTROL },
                { key: "pattern", title: "Pattern", options: PATTERNS },
                { key: "size", title: "Size", options: SIZES },
                { key: "mountingStyle", title: "Mounting Style", options: MOUNTING_STYLES },
                { key: "roomType", title: "Room Type", options: ROOM_TYPES },
                { key: "customOrder", title: "Custom Order", options: CUSTOM_ORDER_OPTIONS },
                { key: "color", title: "Color", options: COLORS },
                { key: "priceRange", title: "Price", options: isCurtainCategory ? CURTAIN_PRICE_RANGES : PRICE_RANGES }
            );
        }

        // For "All" category, show only the most common/useful filters to avoid overwhelming users
        if (selectedCategory === "All") {
            // Return only the most essential filters for cross-category browsing
            const essentialFilters = [
                { key: "priceRange", title: "💰 Price Range", options: PRICE_RANGES },
                { key: "material", title: "🪵 Material", options: SOFA_MATERIALS },
                { key: "color", title: "🎨 Color", options: COLORS },
                { key: "availability", title: "📦 Availability", options: AVAILABILITY_OPTIONS }
            ];
            return essentialFilters;
        }

        // Remove duplicates when specific category is selected
        const uniqueFilters = [];
        const seenKeys = new Set();

        for (const filter of mainFilters) {
            if (!seenKeys.has(filter.key)) {
                seenKeys.add(filter.key);
                uniqueFilters.push(filter);
            }
        }

        return uniqueFilters;
    };

    const mainFilters = getMainFilters();

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <SlidersHorizontal size={20} className="text-[#D4AF37]" />
                        <h3 className="text-lg font-semibold text-[#2D2926]">Filters</h3>
                    </div>
                    <div className="text-sm text-gray-600">
                        {filteredCount} products found
                    </div>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                        <X size={14} />
                        <span>Clear All</span>
                    </button>
                )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                            ? "bg-[#D4AF37] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="mb-4 p-3 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
                    <div className="flex items-center space-x-2 mb-2">
                        <Filter size={14} className="text-[#D4AF37]" />
                        <span className="text-sm font-medium text-[#D4AF37]">
                            Active Filters ({activeFilters.length})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {activeFilters.map(([key, value]) => {
                            // Get filter display name
                            const getFilterDisplayName = (filterKey: string) => {
                                const filterMap: Record<string, string> = {
                                    chairType: "🔎 Chair Type",
                                    chairUsage: "🏠 Usage",
                                    chairMaterial: "🪵 Material",
                                    comfortLevel: "💺 Comfort",
                                    designStyle: "🎨 Style",
                                    chairSeatingCapacity: "👥 Capacity",
                                    chairColor: "🎨 Color",
                                    chairAvailability: "📦 Availability",
                                    tableType: "🪑 Table Type",
                                    tableMaterial: "🪵 Material",
                                    tableShape: "⭕ Shape",
                                    tableSeating: "👥 Seating",
                                    tableUsage: "🏠 Usage",
                                    tableStyle: "🎨 Style",
                                    tableAvailability: "📦 Availability",
                                    bedroomType: "🛏️ Bedroom Type",
                                    bedSize: "📏 Bed Size",
                                    bedroomMaterial: "🪵 Material",
                                    bedroomStyle: "🎨 Style",
                                    storageOption: "📦 Storage",
                                    bedroomColor: "🎨 Color",
                                    bedroomAvailability: "📦 Availability",
                                    priceRange: "💰 Price",
                                    sofaType: "Sofa Type",
                                    seatingCapacity: "Capacity",
                                    material: "Material",
                                    color: "Color",
                                    frameMaterial: "Frame",
                                    cushionType: "Cushion",
                                    usage: "Usage",
                                    customization: "Custom",
                                    availability: "Stock",
                                    curtainType: "Type",
                                    curtainFabric: "Fabric",
                                    lightControl: "Light",
                                    pattern: "Pattern",
                                    size: "Size",
                                    mountingStyle: "Mount",
                                    roomType: "Room",
                                    customOrder: "Order"
                                };
                                return filterMap[filterKey] || filterKey;
                            };

                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#D4AF37] text-white"
                                >
                                    <span className="mr-1">{getFilterDisplayName(key)}:</span>
                                    <span>{value}</span>
                                    <button
                                        onClick={() => onFilterChange(key as keyof FilterState, "All")}
                                        className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                        title="Remove filter"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Filter Dropdowns */}
            <div className="flex flex-wrap gap-3 mb-4">
                {mainFilters.slice(0, showAllFilters ? mainFilters.length : 5).map((filter) => (
                    <FilterDropdown
                        key={filter.key}
                        title={filter.title}
                        options={filter.options}
                        selectedValue={filters[filter.key as keyof FilterState]}
                        onSelect={(value) => onFilterChange(filter.key as keyof FilterState, value)}
                    />
                ))}

                {mainFilters.length > 5 && (
                    <button
                        onClick={() => setShowAllFilters(!showAllFilters)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-[#D4AF37] transition-colors"
                    >
                        <span className="text-sm font-medium">
                            {showAllFilters ? "Show Less" : `+${mainFilters.length - 5} More`}
                        </span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${showAllFilters ? "rotate-180" : ""}`}
                        />
                    </button>
                )}
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden">
                <button
                    onClick={() => setShowAllFilters(!showAllFilters)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                >
                    <SlidersHorizontal size={16} />
                    <span className="text-sm font-medium">
                        {showAllFilters ? "Hide Filters" : "Show All Filters"}
                    </span>
                </button>
            </div>
        </div>
    );
}