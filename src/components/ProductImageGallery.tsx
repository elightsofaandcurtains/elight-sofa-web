"use client";

import { useState, useCallback, useMemo, memo, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Package, ZoomIn, Play, Pause, Volume2, VolumeX, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
    mainImage?: string;
    videoUrls?: string[];
    mediaOrder?: MediaItem[];
}

// Maximum thumbnails to show before "+X more"
const MAX_VISIBLE_THUMBNAILS = 5;

function ProductImageGallery({ images, productName, mainImage, videoUrls = [], mediaOrder = [] }: ProductImageGalleryProps) {
    // Debug log
    console.log('ProductImageGallery received:', {
        productName,
        mediaOrder,
        mediaOrderLength: mediaOrder?.length,
        images,
        videoUrls
    });

    // Build media items array from props - PRIORITIZE mediaOrder
    const mediaItems = useMemo(() => {
        const items: MediaItem[] = [];
        const seen = new Set<string>();

        // If mediaOrder is provided and has items, use it as the primary source
        if (mediaOrder && Array.isArray(mediaOrder) && mediaOrder.length > 0) {
            console.log('Using mediaOrder for gallery:', mediaOrder);
            mediaOrder.forEach(item => {
                if (item && item.url && !seen.has(item.url)) {
                    items.push({ url: item.url, type: item.type });
                    seen.add(item.url);
                }
            });
            return items; // Return early - only use mediaOrder
        }

        // Fallback: Build from images and videos if no mediaOrder
        console.log('No mediaOrder, building from images/videos');
        if (mainImage && !seen.has(mainImage)) {
            items.push({ url: mainImage, type: 'image' });
            seen.add(mainImage);
        }

        images.forEach(img => {
            if (img && !seen.has(img)) {
                items.push({ url: img, type: 'image' });
                seen.add(img);
            }
        });

        videoUrls.forEach(vid => {
            if (vid && !seen.has(vid)) {
                items.push({ url: vid, type: 'video' });
                seen.add(vid);
            }
        });

        return items;
    }, [images, mainImage, videoUrls, mediaOrder]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const visibleThumbnails = useMemo(() => {
        return mediaItems.slice(0, MAX_VISIBLE_THUMBNAILS);
    }, [mediaItems]);

    const remainingCount = useMemo(() => {
        return Math.max(0, mediaItems.length - MAX_VISIBLE_THUMBNAILS);
    }, [mediaItems]);

    const currentMedia = mediaItems[selectedIndex];

    const handleThumbnailClick = useCallback((index: number) => {
        setSelectedIndex(index);
        setIsPlaying(false);
    }, []);

    const handleMoreClick = useCallback(() => {
        setIsLightboxOpen(true);
    }, []);

    const goToPrevious = useCallback(() => {
        setSelectedIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
        setIsPlaying(false);
    }, [mediaItems.length]);

    const goToNext = useCallback(() => {
        setSelectedIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1);
        setIsPlaying(false);
    }, [mediaItems.length]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        else if (e.key === 'ArrowRight') goToNext();
        else if (e.key === 'Escape') setIsLightboxOpen(false);
    }, [goToPrevious, goToNext]);

    const handleImageError = useCallback((index: number) => {
        setImageLoadErrors(prev => new Set(prev).add(index));
    }, []);

    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }, [isMuted]);

    if (mediaItems.length === 0) {
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
            {/* Main Media Viewer */}
            <motion.div
                className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#F5F4F2] to-[#E8E6E3] shadow-2xl group"
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
                        className="absolute inset-0"
                    >
                        {currentMedia?.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-black">
                                <video
                                    ref={videoRef}
                                    src={currentMedia.url}
                                    className="w-full h-full object-contain"
                                    loop
                                    muted={isMuted}
                                    playsInline
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />
                                {/* Video Controls */}
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                                    <button
                                        onClick={togglePlay}
                                        className="p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                                    >
                                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                    </button>
                                    <button
                                        onClick={toggleMute}
                                        className="p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                                    >
                                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                    </button>
                                </div>
                            </div>
                        ) : imageLoadErrors.has(selectedIndex) ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
                                <Package className="w-24 h-24 text-gray-300" />
                            </div>
                        ) : (
                            <div
                                className="w-full h-full p-4 cursor-zoom-in"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                <Image
                                    src={currentMedia?.url || ''}
                                    alt={`${productName} - Image ${selectedIndex + 1}`}
                                    fill
                                    className="object-contain"
                                    priority={selectedIndex === 0}
                                    onError={() => handleImageError(selectedIndex)}
                                />
                                {/* Zoom indicator for images */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Media counter badge */}
                {mediaItems.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-10">
                        {selectedIndex + 1} / {mediaItems.length}
                    </div>
                )}

                {/* Video badge */}
                {currentMedia?.type === 'video' && (
                    <div className="absolute top-4 left-4 bg-purple-600/90 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 z-10">
                        <Video size={14} />
                        Video
                    </div>
                )}
            </motion.div>

            {/* Thumbnail Row */}
            {mediaItems.length > 1 && (
                <div className="flex gap-3 justify-center">
                    {visibleThumbnails.map((media, index) => (
                        <ThumbnailButton
                            key={`thumb-${index}-${media.url}`}
                            media={media}
                            index={index}
                            isSelected={selectedIndex === index}
                            productName={productName}
                            onClick={() => handleThumbnailClick(index)}
                            hasError={imageLoadErrors.has(index)}
                            onError={() => handleImageError(index)}
                        />
                    ))}

                    {remainingCount > 0 && (
                        <button
                            onClick={handleMoreClick}
                            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-dashed border-[#D4AF37] 
                                     bg-[#D4AF37]/10 flex items-center justify-center hover:bg-[#D4AF37]/20 
                                     transition-all duration-200"
                        >
                            <span className="text-[#D4AF37] font-semibold text-sm">+{remainingCount}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <LightboxModal
                        mediaItems={mediaItems}
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


// Thumbnail Button Component
interface ThumbnailButtonProps {
    media: MediaItem;
    index: number;
    isSelected: boolean;
    productName: string;
    onClick: () => void;
    hasError: boolean;
    onError: () => void;
}

const ThumbnailButton = memo(function ThumbnailButton({
    media,
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
                "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 relative",
                isSelected
                    ? "border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/30"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
            )}
        >
            {media.type === 'video' ? (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center relative">
                    <Video className="w-6 h-6 text-purple-500" />
                    <div className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-[8px] text-center py-0.5">
                        VIDEO
                    </div>
                </div>
            ) : hasError ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-300" />
                </div>
            ) : (
                <Image
                    src={media.url}
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
    mediaItems: MediaItem[];
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
    mediaItems,
    selectedIndex,
    productName,
    onClose,
    onSelectIndex,
    onPrevious,
    onNext,
    imageLoadErrors,
    onImageError,
}: LightboxModalProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const currentMedia = mediaItems[selectedIndex];

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') onPrevious();
        else if (e.key === 'ArrowRight') onNext();
        else if (e.key === 'Escape') onClose();
    }, [onPrevious, onNext, onClose]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
                <X className="w-6 h-6 text-white" />
            </button>

            <div className="flex-1 flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
                {mediaItems.length > 1 && (
                    <button onClick={onPrevious} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                )}

                <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative max-w-4xl max-h-[70vh] w-full h-full flex items-center justify-center"
                >
                    {currentMedia?.type === 'video' ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <video
                                ref={videoRef}
                                src={currentMedia.url}
                                className="max-w-full max-h-full object-contain"
                                loop
                                muted={isMuted}
                                playsInline
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                <button onClick={togglePlay} className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white">
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                </button>
                                <button onClick={toggleMute} className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white">
                                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </button>
                            </div>
                        </div>
                    ) : imageLoadErrors.has(selectedIndex) ? (
                        <Package className="w-24 h-24 text-gray-500" />
                    ) : (
                        <Image
                            src={currentMedia?.url || ''}
                            alt={`${productName} - Image ${selectedIndex + 1}`}
                            fill
                            className="object-contain"
                            priority
                            onError={() => onImageError(selectedIndex)}
                        />
                    )}
                </motion.div>

                {mediaItems.length > 1 && (
                    <button onClick={onNext} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>

            <div className="p-4 bg-black/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 justify-center overflow-x-auto pb-2 max-w-full">
                    {mediaItems.map((media, index) => (
                        <button
                            key={`lightbox-thumb-${index}`}
                            onClick={() => onSelectIndex(index)}
                            className={cn(
                                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative",
                                selectedIndex === index ? "border-[#D4AF37] opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                            )}
                        >
                            {media.type === 'video' ? (
                                <div className="w-full h-full bg-purple-900 flex items-center justify-center">
                                    <Video className="w-6 h-6 text-purple-300" />
                                </div>
                            ) : imageLoadErrors.has(index) ? (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-500" />
                                </div>
                            ) : (
                                <Image src={media.url} alt={`Thumbnail ${index + 1}`} width={64} height={64} className="object-cover w-full h-full" loading="lazy" onError={() => onImageError(index)} />
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-center text-white/70 text-sm mt-2">{selectedIndex + 1} of {mediaItems.length}</p>
            </div>
        </motion.div>
    );
});

export default memo(ProductImageGallery);
