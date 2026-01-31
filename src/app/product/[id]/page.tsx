"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  ArrowLeft,
  Truck,
  Shield,
  Palette,
  Phone,
  MessageCircle,
  Mail,
  Send,
  Ruler,
  Sparkles,
  Package,
  Loader2
} from "lucide-react";
import { ProductService, ProductItem } from "@/lib/firebase/products";
import { formatCurrency, cn } from "@/lib/utils";
import ProductInquiryModal from "@/components/ProductInquiryModal";
import ProductImageGallery from "@/components/ProductImageGallery";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const productId = params.id as string;
      setLoading(true);

      try {
        // Fetch product from Firebase
        const foundProduct = await ProductService.getProduct(productId);

        if (foundProduct) {
          console.log('Product loaded:', {
            id: foundProduct.id,
            name: foundProduct.name,
            mediaOrder: foundProduct.mediaOrder,
            mediaOrderLength: foundProduct.mediaOrder?.length,
            imageUrls: foundProduct.imageUrls,
            videoUrls: foundProduct.videoUrls,
            sofaSize: foundProduct.sofaSize,
            sofaFootPrice: foundProduct.sofaFootPrice,
          });
          setProduct(foundProduct);

          // Fetch related products from same category
          const allProducts = await ProductService.getProducts({ category: foundProduct.category });
          const related = allProducts.filter(p => p.id !== productId).slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [params.id]);

  const handleWhatsAppInquiry = () => {
    if (!product) return;
    const message = encodeURIComponent(
      `Hi, I'm interested in the ${product.name} (${product.category}). Please share more details about pricing and availability.`
    );
    window.open(`https://wa.me/919714392926?text=${message}`, '_blank');
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+919714392926';
  };

  const handleEmailInquiry = () => {
    if (!product) return;
    const subject = encodeURIComponent(`Inquiry: ${product.name}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in the ${product.name} (${product.category}).\n\nPlease share more details about pricing, customization options, and availability.\n\nThank you.`
    );
    window.location.href = `mailto:elightsofaandcurtains@gmail.com?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF9F7] to-[#F5F3F0] pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF9F7] to-[#F5F3F0] pt-24 flex flex-col items-center justify-center px-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-serif text-[#2D2926] mb-4">Product Not Found</h1>
        <p className="text-[#8B8680] mb-6">The product you're looking for doesn't exist.</p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors"
        >
          Back to Collections
        </Link>
      </div>
    );
  }

  const getAvailabilityInfo = () => {
    switch (product.status) {
      case 'In Stock':
        return { text: 'In Stock', subtext: 'Ready for delivery', color: 'text-emerald-600', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-500' };
      case 'Low Stock':
        return { text: 'Limited Stock', subtext: `Only ${product.stockQty} left`, color: 'text-[#D4AF37]', bgColor: 'bg-amber-50', dotColor: 'bg-[#D4AF37]' };
      case 'Out of Stock':
        return { text: 'Made to Order', subtext: '4-6 weeks delivery', color: 'text-[#5C5856]', bgColor: 'bg-gray-50', dotColor: 'bg-[#5C5856]' };
      default:
        return { text: 'Available', subtext: 'Contact for details', color: 'text-gray-600', bgColor: 'bg-gray-50', dotColor: 'bg-gray-500' };
    }
  };

  const availabilityInfo = getAvailabilityInfo();

  // Get category-specific details
  const getCategorySpecificDetails = () => {
    const details: { label: string; value: string | undefined }[] = [];

    switch (product.category) {
      case "Sofas":
        if (product.sofaType) details.push({ label: "Sofa Type", value: product.sofaType });
        if (product.seatingCapacity) details.push({ label: "Seating Capacity", value: product.seatingCapacity });
        break;
      case "Chairs":
        if (product.chairType) details.push({ label: "Chair Type", value: product.chairType });
        break;
      case "Tables":
        if (product.tableType) details.push({ label: "Table Type", value: product.tableType });
        break;
      case "Bedroom":
        if (product.bedroomType) details.push({ label: "Furniture Type", value: product.bedroomType });
        break;
      case "Curtains":
        if (product.curtainType) details.push({ label: "Curtain Type", value: product.curtainType });
        if (product.curtainFabric) details.push({ label: "Fabric", value: product.curtainFabric });
        if (product.curtainSize) details.push({ label: "Size", value: product.curtainSize });
        break;
    }

    return details.filter(d => d.value);
  };

  const categoryDetails = getCategorySpecificDetails();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF9F7] to-[#F5F3F0] pt-20 pb-20 lg:pt-24 lg:pb-0 w-full overflow-x-hidden">
      {/* Main Content */}
      <div className="w-full overflow-x-hidden">
        <div className="w-full mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-4 sm:py-6 lg:py-12 max-w-7xl">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#8B8680] hover:text-[#D4AF37] transition-colors mb-4 sm:mb-6 lg:mb-8 group"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px] group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Back</span>
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-16 w-full">
            {/* Left: Product Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1 space-y-3 sm:space-y-4 lg:space-y-6 w-full min-w-0"
            >
              {/* Category */}
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#D4AF37] font-medium">
                {product.category}
              </p>

              {/* Product Name */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2D2926] leading-tight break-words hyphens-auto">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={cn(
                        "sm:w-[18px] sm:h-[18px]",
                        i < Math.floor(product.rating)
                          ? "fill-[#D4AF37] text-[#D4AF37]"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-[#8B8680]">
                  {product.rating.toFixed(1)} ({product.reviewsCount})
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-base text-[#5C5856] leading-relaxed break-words hyphens-auto">
                {product.description || `Experience unparalleled comfort and elegance with our ${product.name}. Crafted with premium ${product.material} and designed to transform your living space into a sanctuary of style and relaxation. Each piece is meticulously handcrafted by our master artisans.`}
              </p>

              {/* Price */}
              <div className="py-3 sm:py-4 border-y border-[#E8E6E3] w-full min-w-0">
                {/* Sofa Per-Foot Pricing */}
                {product.category === 'Sofas' && product.sofaSize && product.sofaFootPrice ? (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 sm:p-4 lg:p-5 w-full">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-amber-700 text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                      <Ruler size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                      <span>Per-Foot Pricing</span>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-600">Size</span>
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-[#2D2926]">{product.sofaSize}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-600">Rate per Foot</span>
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-amber-600">₹{product.sofaFootPrice.toLocaleString('en-IN')}/ft</span>
                      </div>
                      <div className="border-t border-amber-200 pt-2 sm:pt-3 flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-gray-700 font-medium">Total Price</span>
                        <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#D4AF37]">{formatCurrency(product.price)}</span>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-amber-600 mt-2 sm:mt-3 italic">* Sofa prices are calculated based on size in feet</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-[#8B8680] mb-1">Starting from</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D2926]">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#8B8680] mt-1 sm:mt-2">*Final price may vary based on customization</p>
                  </>
                )}
              </div>

              {/* Availability */}
              <div className={cn("inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl max-w-full", availabilityInfo.bgColor)}>
                <span className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse flex-shrink-0", availabilityInfo.dotColor)} />
                <div className="min-w-0 flex-1">
                  <span className={cn("text-xs sm:text-sm font-semibold", availabilityInfo.color)}>{availabilityInfo.text}</span>
                  <span className="text-[10px] sm:text-xs text-[#8B8680] ml-1 sm:ml-2">• {availabilityInfo.subtext}</span>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4 shadow-sm border border-[#E8E6E3] w-full">
                <h3 className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider text-[#8B8680] font-semibold">Specifications</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full">
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-[#8B8680]">Material</p>
                    <p className="text-xs sm:text-sm font-medium text-[#2D2926] break-words">{product.material}</p>
                  </div>
                  {product.dimensions && (
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <p className="text-[10px] sm:text-xs text-[#8B8680]">Dimensions</p>
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-[#2D2926] break-all leading-tight">
                        {product.dimensions}
                      </p>
                    </div>
                  )}
                  {categoryDetails.map((detail, index) => (
                    <div key={index} className="space-y-0.5 sm:space-y-1 min-w-0">
                      <p className="text-[10px] sm:text-xs text-[#8B8680]">{detail.label}</p>
                      <p className="text-xs sm:text-sm font-medium text-[#2D2926] break-words">{detail.value}</p>
                    </div>
                  ))}
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-[#8B8680]">Stock</p>
                    <p className="text-xs sm:text-sm font-medium text-[#2D2926]">{product.stockQty} units</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-[#8B8680]">Customization</p>
                    <p className="text-xs sm:text-sm font-medium text-emerald-600">Available</p>
                  </div>
                </div>
              </div>

              {/* Inquiry Actions */}
              <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 w-full">
                {/* Primary CTA */}
                <motion.button
                  onClick={() => router.push(`/custom-inquiry?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}&id=${product.id}`)}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(212, 175, 55, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#D4AF37] text-white 
                         font-semibold rounded-lg sm:rounded-xl hover:bg-[#B8941F] transition-all duration-300 shadow-lg text-xs sm:text-sm md:text-base"
                >
                  <Send size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                  <span>Request Inquiry</span>
                </motion.button>

                {/* Secondary CTAs */}
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5 w-full">
                  <motion.button
                    onClick={handleWhatsAppInquiry}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-0.5 sm:px-1 py-2 sm:py-2.5 border-2 border-emerald-200 
                           text-emerald-600 rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all duration-300 min-w-0"
                  >
                    <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium leading-tight truncate w-full px-0.5">WhatsApp</span>
                  </motion.button>
                  <motion.button
                    onClick={handleCallNow}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-0.5 sm:px-1 py-2 sm:py-2.5 border-2 border-blue-200 
                           text-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-300 min-w-0"
                  >
                    <Phone size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium leading-tight truncate w-full px-0.5">Call Now</span>
                  </motion.button>
                  <motion.button
                    onClick={handleEmailInquiry}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-0.5 sm:px-1 py-2 sm:py-2.5 border-2 border-[#D4AF37]/30 
                           text-[#D4AF37] rounded-lg sm:rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-300 min-w-0"
                  >
                    <Mail size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium leading-tight truncate w-full px-0.5">Email</span>
                  </motion.button>
                </div>

                {/* Wishlist */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-xs sm:text-sm",
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "border-[#E8E6E3] text-[#8B8680] hover:border-red-200 hover:text-red-400"
                  )}
                >
                  <Heart size={14} className="sm:w-4 sm:h-4 flex-shrink-0" fill={isWishlisted ? "currentColor" : "none"} />
                  <span className="font-medium">{isWishlisted ? 'Saved' : 'Save to Wishlist'}</span>
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3 pt-3 sm:pt-4 lg:pt-6 border-t border-[#E8E6E3]">
                <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 lg:gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center flex-shrink-0">
                    <Truck size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] text-[#D4AF37]" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#5C5856] leading-tight">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 lg:gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center flex-shrink-0">
                    <Shield size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] text-[#D4AF37]" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#5C5856] leading-tight">Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 lg:gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center flex-shrink-0">
                    <Palette size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] text-[#D4AF37]" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#5C5856] leading-tight">Customizable</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 lg:gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] text-[#D4AF37]" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-[#5C5856] leading-tight">Handcrafted</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Product Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start"
            >
              <ProductImageGallery
                images={product.imageUrls}
                mainImage={product.imageUrl}
                productName={product.name}
                videoUrls={product.videoUrls}
                mediaOrder={product.mediaOrder}
              />
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20 pt-12 border-t border-[#E8E6E3] w-full max-w-full overflow-x-hidden"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2D2926] mb-8 break-words">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
                {relatedProducts.map((relatedProduct, index) => (
                  <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 w-full max-w-full"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#F5F3F0] w-full">
                        {relatedProduct.imageUrl ? (
                          <Image
                            src={relatedProduct.imageUrl}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 w-full max-w-full overflow-x-hidden">
                        <p className="text-[10px] uppercase tracking-wider text-[#8B8680] mb-1 truncate">
                          {relatedProduct.category}
                        </p>
                        <h3 className="text-sm font-medium text-[#2D2926] line-clamp-1 group-hover:text-[#D4AF37] transition-colors break-words">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-xs text-[#8B8680] mt-1">Starting from</p>
                        <p className="text-sm font-bold text-[#2D2926] break-words">
                          {formatCurrency(relatedProduct.price)}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Mobile Sticky Inquiry Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E3] p-3 shadow-lg z-40">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#8B8680] truncate">{product.name}</p>
              <p className="text-base font-bold text-[#2D2926]">{formatCurrency(product.price)}</p>
            </div>
            <motion.button
              onClick={() => router.push(`/custom-inquiry?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}&id=${product.id}`)}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-[#D4AF37] text-white font-semibold rounded-xl flex items-center gap-2 text-sm"
            >
              <Send size={16} />
              Inquire
            </motion.button>
          </div>
        </div>

        {/* Inquiry Modal */}
        {showInquiryModal && (
          <ProductInquiryModal
            product={{
              id: product.id,
              name: product.name,
              category: product.category,
              price: product.price,
              image: product.imageUrl,
              material: product.material,
              dimensions: product.dimensions || '',
              warranty: '',
              rating: product.rating,
              reviews: product.reviewsCount,
              stock: product.stockQty,
              status: product.status === 'In Stock' ? 'in_stock' : product.status === 'Low Stock' ? 'low_stock' : 'out_of_stock',
            }}
            isOpen={showInquiryModal}
            onClose={() => setShowInquiryModal(false)}
          />
        )}
      </div>
    </div>
  );
}
