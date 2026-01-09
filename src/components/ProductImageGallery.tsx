"use client";

import { useState, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Package, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
    mainImage?: string;
}

// Maximum thumbnails to show before "+X more"
const MAX_VISIBLE_THUMBNAILS = 5;

/**
 * ProductImageGallery Component
 * 
 * Features:
 * - Main image viewer with selected image display
 * - Thumbnail row with max 5 visible + "+X more" indicator
 * - Lightbox modal for full gallery view
 * - Keyboard navigation support
 * - Lazy loading for performance
 * - No duplicate images
 * - Responsive design
 */
function ProductImageGallery({ images, productName, mainImage }: ProductImageGalleryProps) {
    // Deduplicate and normalize images array
    const normalizedImages = useMemo(() => {
        const uniqueImages: string[] = [];
        const seen = new Set<string>();

        // If mainImage provided and valid, add it first
        if (mainImage && !seen.has(mainImage)) {
            uniqueImages.push(mainImage);
            seen.add(mainImage);
        }

        // Add remaining images, avoiding duplicates
        images.forEach(img => {
            if (img && typeof img === 'string' && !seen.has(img)) {
                uniqueImages.push(img);
                seen.add(img);
            }
        });

        return uniqueImages;
    }, [images, mainImage]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

    // Calculate visible thumbnails and remaining count
    const visibleThumbnails = useMemo(() => {
        return normalizedImages.slice(0, MAX_VISIBLE_THUMBNAILS);
    }, [normalizedImages]);

    const remainingCount = useMemo(() => {
        return Math.max(0, normalizedImages.length - MAX_VISIBLE_THUMBNAILS);
    }, [normalizedImages]);

    // Get current selected image
    const currentImage = normalizedImages[selectedIndex] || '';

    // Handle thumbnail click
    const handleThumbnailClick = useCallback((index: number) => {
        setSelectedIndex(index);
    }, []);

    // Handle "+X more" click - opens lightbox
    const handleMoreClick = useCallback(() => {
        setIsLightboxOpen(true);
    }, []);

    // Navigate to previous image
    const goToPrevious = useCallback(() => {
        setSelectedIndex(prev =>
            prev === 0 ? normalizedImages.length - 1 : prev - 1
        );
    }, [normalizedImages.length]);

    // Navigate to next image
    const goToNext = useCallback(() => {
        setSelectedIndex(prev =>
            prev === normalizedImages.length - 1 ? 0 : prev + 1
        );
    }, [normalizedImages.length]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        } else if (e.key === 'Escape') {
            setIsLightboxOpen(false);
        }
    }, [goToPrevious, goToNext]);

    // Handle image load error
    const handleImageError = useCallback((index: number) => {
        setImageLoadErrors(prev => new Set(prev).add(index));
    }, []);

    // If no images, show placeholder
    if (normalizedImages.length === 0) {
        return (
            <div className="space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#F5F4F2] to-[#E8E6E3] shadow-2xl flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-300" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
            {/* Main Image Viewer */}
            <motion.div
                className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#F5F4F2] to-[#E8E6E3] shadow-2xl cursor-zoom-in group"
                onClick={() => setIsLightboxOpen(true)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 p-4"
                    >
                        {imageLoadErrors.has(selectedIndex) ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
                                <Package className="w-24 h-24 text-gray-300" />
                            </div>
                        ) : (
                            <Image
                                src={currentImage}
                                alt={`${productName} - Image ${selectedIndex + 1}`}
                                fill
                                className="object-contain"
                                priority={selectedIndex === 0}
                                onError={() => handleImageError(selectedIndex)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Zoom indicator */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
                </div>

                {/* Image counter badge */}
                {normalizedImages.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                        {selectedIndex + 1} / {normalizedImages.length}
                    </div>
                )}
            </motion.div>

            {/* Thumbnail Row */}
            {normalizedImages.length > 1 && (
                <div className="flex gap-3 justify-center">
                    {visibleThumbnails.map((imageUrl, index) => (
                        <ThumbnailButton
                            key={`thumb-${index}-${imageUrl}`}
                            imageUrl={imageUrl}
                            index={index}
                            isSelected={selectedIndex === index}
                            productName={productName}
                            onClick={() => handleThumbnailClick(index)}
                            hasError={imageLoadErrors.has(index)}
                            onError={() => handleImageError(index)}
                        />
                    ))}

                    {/* "+X more" button */}
                    {remainingCount > 0 && (
                        <button
                            onClick={handleMoreClick}
                            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-dashed border-[#D4AF37] 
                       bg-[#D4AF37]/10 flex items-center justify-center hover:bg-[#D4AF37]/20 
                       transition-all duration-200"
                            aria-label={`View ${remainingCount} more images`}
                        >
                            <span className="text-[#D4AF37] font-semibold text-sm">
                                +{remainingCount}
                            </span>
                        </button>
                    )}
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <LightboxModal
                        images={normalizedImages}
                        selectedIndex={selectedIndex}
                        productName={productName}
                        onClose={() => setIsLightboxOpen(false)}
                        onSelectIndex={setSelectedIndex}
                        onPrevious={goToPrevious}
                        onNext={goToNext}
                        imageLoadErrors={imageLoadErrors}
                        onImageError={handleImageError}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Memoized Thumbnail Button Component
interface ThumbnailButtonProps {
    imageUrl: string;
    index: number;
    isSelected: boolean;
    productName: string;
    onClick: () => void;
    hasError: boolean;
    onError: () => void;
}

const ThumbnailButton = memo(function ThumbnailButton({
    imageUrl,
    index,
    isSelected,
    productName,
    onClick,
    hasError,
    onError,
}: ThumbnailButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200",
                isSelected
                    ? "border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/30"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
            )}
            aria-label={`View image ${index + 1}`}
            aria-pressed={isSelected}
        >
            {hasError ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-300" />
                </div>
            ) : (
                <Image
                    src={imageUrl}
                    alt={`${productName} thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={onError}
                />
            )}
        </button>
    );
});

// Lightbox Modal Component
interface LightboxModalProps {
    images: string[];
    selectedIndex: number;
    productName: string;
    onClose: () => void;
    onSelectIndex: (index: number) => void;
    onPrevious: () => void;
    onNext: () => void;
    imageLoadErrors: Set<number>;
    onImageError: (index: number) => void;
}

const LightboxModal = memo(function LightboxModal({
    images,
    selectedIndex,
    productName,
    onClose,
    onSelectIndex,
    onPrevious,
    onNext,
    imageLoadErrors,
    onImageError,
}: LightboxModalProps) {
    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            onPrevious();
        } else if (e.key === 'ArrowRight') {
            onNext();
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [onPrevious, onNext, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery lightbox"
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close lightbox"
            >
                <X className="w-6 h-6 text-white" />
            </button>

            {/* Main image area */}
            <div
                className="flex-1 flex items-center justify-center p-4 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Previous button */}
                {images.length > 1 && (
                    <button
                        onClick={onPrevious}
                        className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                )}

                {/* Current image */}
                <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative max-w-4xl max-h-[70vh] w-full h-full"
                >
                    {imageLoadErrors.has(selectedIndex) ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-24 h-24 text-gray-500" />
                        </div>
                    ) : (
                        <Image
                            src={images[selectedIndex]}
                            alt={`${productName} - Image ${selectedIndex + 1}`}
                            fill
                            className="object-contain"
                            priority
                            onError={() => onImageError(selectedIndex)}
                        />
                    )}
                </motion.div>

                {/* Next button */}
                {images.length > 1 && (
                    <button
                        onClick={onNext}
                        className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>

            {/* Thumbnail strip at bottom */}
            <div
                className="p-4 bg-black/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-2 justify-center overflow-x-auto pb-2 max-w-full">
                    {images.map((imageUrl, index) => (
                        <button
                            key={`lightbox-thumb-${index}`}
                            onClick={() => onSelectIndex(index)}
                            className={cn(
                                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                selectedIndex === index
                                    ? "border-[#D4AF37] opacity-100"
                                    : "border-transparent opacity-50 hover:opacity-80"
                            )}
                            aria-label={`Select image ${index + 1}`}
                            aria-pressed={selectedIndex === index}
                        >
                            {imageLoadErrors.has(index) ? (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-500" />
                                </div>
                            ) : (
                                <Image
                                    src={imageUrl}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={64}
                                    height={64}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                    onError={() => onImageError(index)}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Image counter */}
                <p className="text-center text-white/70 text-sm mt-2">
                    {selectedIndex + 1} of {images.length}
                </p>
            </div>
        </motion.div>
    );
});

export default memo(ProductImageGallery);
