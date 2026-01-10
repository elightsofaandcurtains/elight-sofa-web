"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Send, Package, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { ProductItem } from "@/lib/firebase/products";
import { formatCurrency, cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductItem;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
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

  const getStockLabel = () => {
    switch (product.status) {
      case 'In Stock': return 'In Stock';
      case 'Low Stock': return 'Low Stock';
      case 'Out of Stock': return 'Made to Order';
      default: return 'Available';
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

  const getTypeLabel = () => {
    switch (product.category) {
      case 'Sofas': return product.sofaType;
      case 'Chairs': return product.chairType;
      case 'Tables': return product.tableType;
      case 'Bedroom': return product.bedroomType;
      case 'Curtains': return product.curtainType;
      default: return null;
    }
  };

  const typeLabel = getTypeLabel();

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
        className="group bg-[#FAF9F7] rounded-[16px] overflow-hidden shadow-md cursor-pointer border border-transparent hover:border-[#D4AF37]/30"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#F5F4F2] to-[#EBE9E5]">
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
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
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
            <>
              {firstImage ? (
                <Image src={firstImage} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </>
          )}

          {/* Play Video Button */}
          {hasVideo && !showVideo && (
            <button
              onClick={handleShowVideo}
              className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-purple-600/90 hover:bg-purple-700 text-white text-xs font-medium rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <Play size={12} fill="white" />
              Video
            </button>
          )}

          <div className={cn(
            "absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm z-10",
            product.status === 'In Stock' ? 'bg-emerald-500/90 text-white' :
              product.status === 'Low Stock' ? 'bg-[#D4AF37]/90 text-white' : 'bg-[#8B8680]/90 text-white'
          )}>
            {getStockLabel()}
          </div>
        </div>
        <div className="p-5">
          <p className="text-[11px] text-[#8B8680] uppercase tracking-[0.15em] font-medium mb-1">{product.category}</p>
          <h3 className="text-lg font-serif font-semibold mb-2 text-[#2D2926] group-hover:text-[#D4AF37] transition-colors line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={cn(i < Math.floor(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "fill-gray-200 text-gray-200")} />
            ))}
            <span className="text-xs text-[#8B8680] ml-1">({product.reviewsCount})</span>
          </div>

          {/* Pricing Section */}
          <div className="mb-3">
            <span className="text-xs text-[#8B8680]">Starting from</span>
            <div className="text-xl font-bold text-[#2D2926]">{formatCurrency(product.price)}</div>
          </div>

          {/* Sofa Note */}
          {product.category === 'Sofas' && (
            <p className="text-[9px] text-gray-400 italic mb-2">* Price calculated per foot</p>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-[#F0EFED] text-[#5C5856] text-[10px] font-medium rounded-full">{product.material}</span>
            {typeLabel && <span className="px-2.5 py-1 bg-[#F0EFED] text-[#5C5856] text-[10px] font-medium rounded-full">{typeLabel}</span>}
          </div>
          <motion.button onClick={handleInquiry} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-2.5 bg-[#D4AF37] text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#B8941F] text-sm shadow-md hover:shadow-lg">
            <Send size={14} />
            Request Inquiry
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}
