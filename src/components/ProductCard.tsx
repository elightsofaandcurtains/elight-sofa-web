"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Send, Package } from "lucide-react";
import { ProductItem } from "@/lib/firebase/products";
import { formatCurrency, cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductItem;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();

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
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}
          <div className={cn(
            "absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
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
          <div className="mb-3">
            <span className="text-xs text-[#8B8680]">Starting from</span>
            <div className="text-xl font-bold text-[#2D2926]">{formatCurrency(product.price)}</div>
          </div>
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
