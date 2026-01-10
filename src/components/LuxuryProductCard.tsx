"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Send, Package, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { ProductItem } from "@/lib/firebase/products";
import { formatCurrency, cn } from "@/lib/utils";

interface LuxuryProductCardProps {
  product: ProductItem;
  index?: number;
}

export default function LuxuryProductCard({ product, index = 0 }: LuxuryProductCardProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  // Get first image and first video from mediaOrder (respecting order)
  const getFirstMedia = () => {
    let firstImage: string | null = null;
    let firstVideo: string | null = null;

    if (product.mediaOrder && product.mediaOrder.length > 0) {
      // Use mediaOrder - first item is the main display
      const firstMedia = product.mediaOrder[0];
      if (firstMedia.type === 'image') {
        firstImage = firstMedia.url;
      } else if (firstMedia.type === 'video') {
        firstVideo = firstMedia.url;
      }

      // Find first of each type
      for (const media of product.mediaOrder) {
        if (media.type === 'image' && !firstImage) {
          firstImage = media.url;
        }
        if (media.type === 'video' && !firstVideo) {
          firstVideo = media.url;
        }
        if (firstImage && firstVideo) break;
      }
    }

    // Fallback to separate arrays if mediaOrder not available
    if (!firstImage) {
      firstImage = product.imageUrl || (product.imageUrls && product.imageUrls[0]) || null;
    }
    if (!firstVideo && product.videoUrls && product.videoUrls.length > 0) {
      firstVideo = product.videoUrls[0];
    }

    return { firstImage, firstVideo };
  };

  const { firstImage, firstVideo } = getFirstMedia();
  const hasVideo = !!firstVideo;

  const getStockBadge = () => {
    switch (product.status) {
      case 'In Stock':
        return { text: 'In Stock', color: 'bg-emerald-500/90 text-white' };
      case 'Low Stock':
        return { text: 'Low Stock', color: 'bg-[#D4AF37]/90 text-white' };
      case 'Out of Stock':
        return { text: 'Made to Order', color: 'bg-[#8B8680]/90 text-white' };
      default:
        return { text: 'Available', color: 'bg-gray-500/90 text-white' };
    }
  };

  const handleInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/custom-inquiry?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}&id=${product.id}`);
  };

  const toggleVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleShowVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVideo(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  const stockBadge = getStockBadge();

  // Get category-specific type label
  const getTypeLabel = () => {
    switch (product.category) {
      case 'Sofas':
        return product.sofaType;
      case 'Chairs':
        return product.chairType;
      case 'Tables':
        return product.tableType;
      case 'Bedroom':
        return product.bedroomType;
      case 'Curtains':
        return product.curtainType;
      default:
        return null;
    }
  };

  const typeLabel = getTypeLabel();

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        whileHover={{
          y: -8,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                   transition-all duration-500 border border-gray-100 hover:border-[#D4AF37]/40"
      >
        {/* Gold accent line on hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] z-10"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Image/Video Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#F8F8F8] to-[#F0F0F0]">
          {/* Show Video if available and toggled */}
          {hasVideo && showVideo ? (
            <div className="w-full h-full relative">
              <video
                ref={videoRef}
                src={firstVideo!}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                onClick={(e) => e.preventDefault()}
              />
              {/* Video Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20">
                <button
                  onClick={toggleVideo}
                  className="p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>
              {/* Back to Image button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowVideo(false);
                  setIsPlaying(false);
                  if (videoRef.current) videoRef.current.pause();
                }}
                className="absolute top-2 left-2 px-2 py-1 bg-black/60 hover:bg-black/80 rounded text-white text-xs transition-colors z-20"
              >
                Show Image
              </button>
            </div>
          ) : (
            <motion.div
              className="w-full h-full"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </motion.div>
          )}

          {/* Play Video Button (when video available but not showing) */}
          {hasVideo && !showVideo && (
            <button
              onClick={handleShowVideo}
              className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/90 hover:bg-purple-700 text-white text-xs font-medium rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <Play size={14} fill="white" />
              Play Video
            </button>
          )}

          {/* Overlay on hover */}
          {!showVideo && (
            <motion.div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
            />
          )}

          {/* Stock Badge with animation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "absolute top-4 right-4 px-3 py-1.5 text-xs font-medium tracking-wide rounded-full backdrop-blur-md shadow-sm z-10",
              stockBadge.color
            )}
          >
            {stockBadge.text}
          </motion.div>

          {/* Stock Quantity (if low) */}
          {product.status === 'Low Stock' && product.stockQty > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm"
            >
              Only {product.stockQty} left
            </motion.div>
          )}

          {/* Quick view indicator - hide when video is playing */}
          {!showVideo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-4 py-2 bg-white/90 text-[#2D2926] text-sm font-medium rounded-full shadow-lg backdrop-blur-sm">
                View Details
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Category with animated underline */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-[2px] bg-[#D4AF37] group-hover:w-10 transition-all duration-300"></span>
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#8B8680] font-medium">
              {product.category}
            </p>
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-serif font-semibold text-[#2D2926] leading-tight 
                         group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>

          {/* Rating with animation */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Star
                    size={14}
                    className={cn(
                      "transition-colors",
                      i < Math.floor(product.rating)
                        ? "fill-[#D4AF37] text-[#D4AF37]"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                </motion.div>
              ))}
            </div>
            <span className="text-xs text-[#8B8680]">({product.reviewsCount})</span>
          </div>

          {/* Price with highlight */}
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#8B8680]">Starting from</span>
              <span className="text-xl font-bold text-[#2D2926] group-hover:text-[#D4AF37] transition-colors">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>

          {/* Sofa Note */}
          {product.category === 'Sofas' && (
            <p className="text-[10px] text-gray-400 italic">* Price calculated per foot</p>
          )}

          {/* Minimal Highlights */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#5C5856] text-[10px] font-medium rounded-full group-hover:bg-[#D4AF37]/10 transition-colors">
              {product.material}
            </span>
            {typeLabel && (
              <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#5C5856] text-[10px] font-medium rounded-full group-hover:bg-[#D4AF37]/10 transition-colors">
                {typeLabel}
              </span>
            )}
            {product.curtainFabric && (
              <span className="px-2.5 py-1 bg-[#F5F5F5] text-[#5C5856] text-[10px] font-medium rounded-full group-hover:bg-[#D4AF37]/10 transition-colors">
                {product.curtainFabric}
              </span>
            )}
          </div>

          {/* Request Inquiry Button */}
          <motion.button
            onClick={handleInquiry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 bg-[#D4AF37] text-white font-medium rounded-xl 
                     flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-all
                     shadow-md hover:shadow-xl group-hover:shadow-[#D4AF37]/20"
          >
            <Send size={16} className="group-hover:rotate-12 transition-transform" />
            Request Inquiry
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}
