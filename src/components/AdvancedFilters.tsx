"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import {
    SOFA_TYPES,
    SEATING_CAPACITY,
    SOFA_MATERIALS,
    COLORS,
    FRAME_MATERIALS,
    CUSHION_TYPES,
    PRICE_RANGES,
    USAGE_TYPES,
    CUSTOMIZATION_OPTIONS,
    AVAILABILITY_STATUS,
    CURTAIN_TYPES,
    CURTAIN_FABRICS,
    LIGHT_CONTROL,
    CURTAIN_PATTERNS,
    CURTAIN_SIZES,
    MOUNTING_STYLES,
    ROOM_TYPES,
    CURTAIN_PRICE_RANGES,
    CUSTOM_ORDER_OPTIONS,
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
}

interface AdvancedFiltersProps {
    selectedCategory: string;
    filters: FilterState;
    onFilterChange: (filterType: keyof FilterState, value: string) => void;
    onClearFilters: () => void;
}

interface FilterSectionProps {
    title: string;
    options: string[] | { label: string; min: number; max: number }[];
    selectedValue: string;
    onSelect: (value: string) => void;
    isExpanded: boolean;
    onToggle: () => void;
}

const FilterSection = ({
    title,
    options,
    selectedValue,
    onSelect,
    isExpanded,
    onToggle,
}: FilterSectionProps) => {
    const hasSelection = selectedValue !== "All";

    return (
        <div className="border-b border-gray-200 pb-4 mb-4">
            <button
                onClick={onToggle}
                className={`flex items-center justify-between w-full text-left font-medium transition-colors ${hasSelection
                    ? "text-[#D4AF37]"
                    : "text-gray-900 hover:text-[#D4AF37]"
                    }`}
            >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="truncate">{title}</span>
                    {hasSelection && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37] text-white whitespace-nowrap">
                            {selectedValue}
                        </span>
                    )}
                </div>
                <div className="ml-2 flex-shrink-0">
                    {isExpanded ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                            {options.map((option) => {
                                const value = typeof option === "string" ? option : option.label;
                                const isSelected = selectedValue === value;

                                return (
                                    <button
                                        key={value}
                                        onClick={() => onSelect(value)}
                                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${isSelected
                                            ? "bg-[#D4AF37] text-white shadow-sm"
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-sm"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="truncate">{value}</span>
                                            {isSelected && (
                                                <span className="text-white ml-2 flex-shrink-0">✓</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ActiveFiltersDisplay = ({ filters, onFilterChange }: {
    filters: FilterState;
    onFilterChange: (filterType: keyof FilterState, value: string) => void;
}) => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => value !== "All");

    if (activeFilters.length === 0) return null;

    return (
        <div className="mb-4 p-3 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
            <div className="flex items-center space-x-2 mb-2">
                <Filter size={14} className="text-[#D4AF37]" />
                <span className="text-sm font-medium text-[#D4AF37]">Active Filters</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {activeFilters.map(([key, value]) => (
                    <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37] text-white"
                    >
                        {value}
                        <button
                            onClick={() => onFilterChange(key as keyof FilterState, "All")}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default function AdvancedFilters({
    selectedCategory,
    filters,
    onFilterChange,
    onClearFilters,
}: AdvancedFiltersProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        sofaType: true,
        seatingCapacity: true,
        material: true,
        color: false,
        frameMaterial: false,
        cushionType: false,
        priceRange: false,
        usage: false,
        customization: false,
        availability: false,
        curtainType: true,
        curtainFabric: true,
        lightControl: false,
        pattern: false,
        size: false,
        mountingStyle: false,
        roomType: false,
        customOrder: false,
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== "All");

    const renderSofaFilters = () => (
        <>
            <FilterSection
                title="Sofa Type"
                options={SOFA_TYPES}
                selectedValue={filters.sofaType}
                onSelect={(value) => onFilterChange("sofaType", value)}
                isExpanded={expandedSections.sofaType}
                onToggle={() => toggleSection("sofaType")}
            />

            <FilterSection
                title="Seating Capacity"
                options={SEATING_CAPACITY}
                selectedValue={filters.seatingCapacity}
                onSelect={(value) => onFilterChange("seatingCapacity", value)}
                isExpanded={expandedSections.seatingCapacity}
                onToggle={() => toggleSection("seatingCapacity")}
            />

            <FilterSection
                title="Material / Fabric"
                options={SOFA_MATERIALS}
                selectedValue={filters.material}
                onSelect={(value) => onFilterChange("material", value)}
                isExpanded={expandedSections.material}
                onToggle={() => toggleSection("material")}
            />

            <FilterSection
                title="Color"
                options={COLORS}
                selectedValue={filters.color}
                onSelect={(value) => onFilterChange("color", value)}
                isExpanded={expandedSections.color}
                onToggle={() => toggleSection("color")}
            />

            <FilterSection
                title="Frame Material"
                options={FRAME_MATERIALS}
                selectedValue={filters.frameMaterial}
                onSelect={(value) => onFilterChange("frameMaterial", value)}
                isExpanded={expandedSections.frameMaterial}
                onToggle={() => toggleSection("frameMaterial")}
            />

            <FilterSection
                title="Cushion Type"
                options={CUSHION_TYPES}
                selectedValue={filters.cushionType}
                onSelect={(value) => onFilterChange("cushionType", value)}
                isExpanded={expandedSections.cushionType}
                onToggle={() => toggleSection("cushionType")}
            />

            <FilterSection
                title="Price Range"
                options={PRICE_RANGES}
                selectedValue={filters.priceRange}
                onSelect={(value) => onFilterChange("priceRange", value)}
                isExpanded={expandedSections.priceRange}
                onToggle={() => toggleSection("priceRange")}
            />

            <FilterSection
                title="Usage"
                options={USAGE_TYPES}
                selectedValue={filters.usage}
                onSelect={(value) => onFilterChange("usage", value)}
                isExpanded={expandedSections.usage}
                onToggle={() => toggleSection("usage")}
            />

            <FilterSection
                title="Customization"
                options={CUSTOMIZATION_OPTIONS}
                selectedValue={filters.customization}
                onSelect={(value) => onFilterChange("customization", value)}
                isExpanded={expandedSections.customization}
                onToggle={() => toggleSection("customization")}
            />

            <FilterSection
                title="Availability"
                options={AVAILABILITY_STATUS}
                selectedValue={filters.availability}
                onSelect={(value) => onFilterChange("availability", value)}
                isExpanded={expandedSections.availability}
                onToggle={() => toggleSection("availability")}
            />
        </>
    );

    const renderCurtainFilters = () => (
        <>
            <FilterSection
                title="Curtain Type"
                options={CURTAIN_TYPES}
                selectedValue={filters.curtainType}
                onSelect={(value) => onFilterChange("curtainType", value)}
                isExpanded={expandedSections.curtainType}
                onToggle={() => toggleSection("curtainType")}
            />

            <FilterSection
                title="Fabric Type"
                options={CURTAIN_FABRICS}
                selectedValue={filters.curtainFabric}
                onSelect={(value) => onFilterChange("curtainFabric", value)}
                isExpanded={expandedSections.curtainFabric}
                onToggle={() => toggleSection("curtainFabric")}
            />

            <FilterSection
                title="Light Control"
                options={LIGHT_CONTROL}
                selectedValue={filters.lightControl}
                onSelect={(value) => onFilterChange("lightControl", value)}
                isExpanded={expandedSections.lightControl}
                onToggle={() => toggleSection("lightControl")}
            />

            <FilterSection
                title="Color"
                options={COLORS}
                selectedValue={filters.color}
                onSelect={(value) => onFilterChange("color", value)}
                isExpanded={expandedSections.color}
                onToggle={() => toggleSection("color")}
            />

            <FilterSection
                title="Pattern"
                options={CURTAIN_PATTERNS}
                selectedValue={filters.pattern}
                onSelect={(value) => onFilterChange("pattern", value)}
                isExpanded={expandedSections.pattern}
                onToggle={() => toggleSection("pattern")}
            />

            <FilterSection
                title="Size"
                options={CURTAIN_SIZES}
                selectedValue={filters.size}
                onSelect={(value) => onFilterChange("size", value)}
                isExpanded={expandedSections.size}
                onToggle={() => toggleSection("size")}
            />

            <FilterSection
                title="Mounting Style"
                options={MOUNTING_STYLES}
                selectedValue={filters.mountingStyle}
                onSelect={(value) => onFilterChange("mountingStyle", value)}
                isExpanded={expandedSections.mountingStyle}
                onToggle={() => toggleSection("mountingStyle")}
            />

            <FilterSection
                title="Room Type"
                options={ROOM_TYPES}
                selectedValue={filters.roomType}
                onSelect={(value) => onFilterChange("roomType", value)}
                isExpanded={expandedSections.roomType}
                onToggle={() => toggleSection("roomType")}
            />

            <FilterSection
                title="Price Range"
                options={CURTAIN_PRICE_RANGES}
                selectedValue={filters.priceRange}
                onSelect={(value) => onFilterChange("priceRange", value)}
                isExpanded={expandedSections.priceRange}
                onToggle={() => toggleSection("priceRange")}
            />

            <FilterSection
                title="Custom Order"
                options={CUSTOM_ORDER_OPTIONS}
                selectedValue={filters.customOrder}
                onSelect={(value) => onFilterChange("customOrder", value)}
                isExpanded={expandedSections.customOrder}
                onToggle={() => toggleSection("customOrder")}
            />
        </>
    );

    return (
        <div className="space-y-4">
            <ActiveFiltersDisplay filters={filters} onFilterChange={onFilterChange} />

            {hasActiveFilters && (
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Filters Applied</span>
                    <button
                        onClick={onClearFilters}
                        className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                        <X size={14} />
                        <span>Clear All</span>
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* Always show sofa filters for Sofas, Chairs, and All categories */}
                {(selectedCategory === "Sofas" || selectedCategory === "Chairs" || selectedCategory === "All") && (
                    <div>
                        {selectedCategory !== "All" && (
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-200 pb-2">
                                {selectedCategory === "Chairs" ? "Chair" : "Sofa"} Filters
                            </h3>
                        )}
                        {renderSofaFilters()}
                    </div>
                )}

                {/* Always show curtain filters for Curtains and All categories */}
                {(selectedCategory === "Curtains" || selectedCategory === "All") && (
                    <div>
                        {selectedCategory !== "All" && (
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-200 pb-2">
                                Curtain Filters
                            </h3>
                        )}
                        {renderCurtainFilters()}
                    </div>
                )}

                {/* Show message for other categories */}
                {selectedCategory !== "All" &&
                    selectedCategory !== "Sofas" &&
                    selectedCategory !== "Chairs" &&
                    selectedCategory !== "Curtains" && (
                        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                            <p className="mb-2">No specific filters available for {selectedCategory}</p>
                            <p>Select "All", "Sofas", "Chairs", or "Curtains" for detailed filtering options</p>
                        </div>
                    )}
            </div>
        </div>
    );
}