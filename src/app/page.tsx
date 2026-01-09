"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Shield,
  Truck,
  Clock,
  CheckCircle,
  Star,
  Play,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { mockTestimonials } from "@/data/mock";
import { ProductService, ProductItem } from "@/lib/firebase/products";
import LuxuryProductCard from "@/components/LuxuryProductCard";
import LuxuryProcessSection from "@/components/LuxuryProcessSection";

const trustBadges = [
  { icon: Award, text: "Award Winning" },
  { icon: Shield, text: "5 Year Warranty" },
  { icon: Truck, text: "Free Delivery" },
  { icon: Clock, text: "24/7 Support" },
];

export default function HomePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = ProductService.subscribeToProducts((fetchedProducts) => {
      setProducts(fetchedProducts.slice(0, 6));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[500px] w-full flex items-center justify-center -mt-16">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920"
            alt="Luxury Furniture"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center text-white px-4 w-full max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs sm:text-sm md:text-base uppercase tracking-widest mb-2 sm:mb-4 text-[#D4AF37]"
          >
            Timeless Elegance
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold mb-3 sm:mb-6"
          >
            Crafted for Generations
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto"
          >
            Discover our exclusive collection of luxury furniture
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Link href="/shop" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#D4AF37] text-white text-sm font-semibold uppercase tracking-wider hover:bg-[#B8941F] transition-colors">
                Explore Collections
              </button>
            </Link>
            <Link href="/inquiry" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-white text-white text-sm font-semibold uppercase tracking-wider hover:bg-white hover:text-[#2D2926] transition-all">
                Custom Inquiry
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={32} className="text-white" />
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-block p-3 bg-[#D4AF37]/10 rounded-full mb-3">
                  <badge.icon className="text-[#D4AF37]" size={24} />
                </div>
                <p className="font-semibold text-sm md:text-base text-[#2D2926]">
                  {badge.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Signature Collections */}
      <section className="py-16 sm:py-20 bg-[#F9F8F6]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#2D2926] mb-4">
              Signature Collections
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Each piece is meticulously crafted to perfection
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((product, index) => (
                <LuxuryProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products available yet</p>
            </div>
          )}

          <div className="text-center mt-10 sm:mt-12">
            <Link href="/shop">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#2D2926] text-white text-sm font-semibold uppercase tracking-wider hover:bg-[#1a1614] transition-colors">
                View All Collections
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
                alt="Craftsmanship"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2D2926] mb-6">
                Why Choose Elight?
              </h2>
              <div className="space-y-4">
                {[
                  "25+ years of excellence in luxury furniture",
                  "Handcrafted by master artisans",
                  "Premium materials sourced globally",
                  "Custom design consultation available",
                  "Lifetime support and warranty",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-[#D4AF37] flex-shrink-0" size={20} />
                    <p className="text-sm sm:text-base text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Process */}
      <LuxuryProcessSection />

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-[#F9F8F6]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2D2926] mb-4">
              What Our Clients Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {mockTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic text-sm sm:text-base">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-[#2D2926]">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video CTA */}
      <section className="relative py-20 sm:py-32 bg-[#2D2926] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <button className="w-16 h-16 sm:w-20 sm:h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg hover:scale-110 transition-transform">
            <Play className="ml-1" size={28} fill="white" />
          </button>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-4">
            Experience the Craftsmanship
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Watch how we transform raw materials into timeless pieces of art
          </p>
        </div>
      </section>
    </div>
  );
}
