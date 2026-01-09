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
  ChevronRight,
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

  // Real-time Firebase subscription for featured products
  useEffect(() => {
    const unsubscribe = ProductService.subscribeToProducts((fetchedProducts) => {
      // Get first 6 products for featured section
      setProducts(fetchedProducts.slice(0, 6));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[100vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden -mt-20">
        <motion.div
          className="absolute inset-0 z-0 w-full h-full"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920"
            alt="Luxury Furniture"
            fill
            className="object-cover w-full h-full"
            priority
            sizes="100vw"
          />
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 text-center text-white px-4"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg uppercase tracking-widest mb-3 md:mb-4 text-[#D4AF37]"
          >
            Timeless Elegance
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold mb-4 md:mb-6"
          >
            Crafted for Generations
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-2xl mx-auto px-4"
          >
            Discover our exclusive collection of luxury furniture, where
            tradition meets innovation
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto px-4"
          >
            <Link href="/shop">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(212, 175, 55, 0.3)",
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#D4AF37] text-white font-semibold uppercase tracking-wider hover:bg-[#B8941F] transition-colors shadow-lg"
              >
                Explore Collections
              </motion.button>
            </Link>
            <Link href="/inquiry">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  color: "#2D2926",
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white font-semibold uppercase tracking-wider transition-all duration-300"
              >
                Custom Inquiry
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Stats Boxes */}
        <motion.div
          className="absolute bottom-20 right-4 md:right-8 space-y-3 md:space-y-4 hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          {[
            { number: "25+", label: "Years Experience" },
            { number: "1000+", label: "Happy Clients" },
            { number: "50+", label: "Master Craftsmen" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, rotate: -10, x: 50 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, x: 0 }}
              transition={{ delay: 2.2 + (index * 0.2), duration: 0.6, type: "spring", stiffness: 400, damping: 25 }}
              whileHover={{ scale: 1.05, rotate: 2, transition: { type: "spring", stiffness: 400, damping: 10 } }}
              className="bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-lg shadow-lg text-center min-w-[100px] md:min-w-[120px]"
            >
              <div className="text-lg md:text-2xl font-bold text-[#D4AF37]">{stat.number}</div>
              <div className="text-xs md:text-sm text-[#2D2926] font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, repeat: Infinity, repeatType: "reverse", duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        >
          <ChevronRight size={32} className="text-white rotate-90" />
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                variants={{
                  initial: { opacity: 0, y: 30, scale: 0.8 },
                  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
                }}
                whileHover={{ y: -10, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360, transition: { duration: 0.6, type: "spring", stiffness: 400, damping: 10 } }}
                  className="inline-block p-3 md:p-4 bg-[#D4AF37]/10 rounded-full mb-3 md:mb-4 group-hover:bg-[#D4AF37]/20 transition-colors duration-300"
                >
                  <badge.icon className="text-[#D4AF37]" size={24} />
                </motion.div>
                <p className="font-semibold text-sm md:text-base text-[#2D2926] group-hover:text-[#D4AF37] transition-colors duration-200">
                  {badge.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Signature Collections - REAL-TIME FIREBASE DATA */}
      <section className="py-20 bg-[#F9F8F6]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2D2926] mb-4">
              Signature Collections
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each piece is meticulously crafted to perfection, embodying
              timeless elegance and superior quality
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <LuxuryProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products available yet</p>
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-lg hover:bg-[#B8941F] transition-colors"
                >
                  Browse All Collections
                </motion.button>
              </Link>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#2D2926] text-white font-semibold uppercase tracking-wider hover:bg-[#1a1614] transition-colors"
              >
                View All Collections
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] rounded-lg overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
                alt="Craftsmanship"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2D2926] mb-6">
                Why Choose Elight?
              </h2>
              <div className="space-y-6">
                {[
                  "25+ years of excellence in luxury furniture",
                  "Handcrafted by master artisans",
                  "Premium materials sourced globally",
                  "Custom design consultation available",
                  "Lifetime support and warranty",
                  "Sustainable and ethical practices",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <CheckCircle className="text-[#D4AF37]" size={24} />
                    <p className="text-lg text-gray-700">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Process */}
      <LuxuryProcessSection />

      {/* Testimonials */}
      <section className="py-20 bg-[#F9F8F6]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2D2926] mb-4">
              What Our Clients Say
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {mockTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                variants={{
                  initial: { opacity: 0, scale: 0.8, rotate: -5, y: 30 },
                  animate: { opacity: 1, scale: 1, rotate: 0, y: 0, transition: { duration: 0.6, ease: "easeOut", type: "spring", stiffness: 400, damping: 25 } }
                }}
                whileHover={{ y: -5, scale: 1.02, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)", transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="bg-white rounded-lg p-6 shadow-md group"
              >
                <motion.div className="flex items-center space-x-1 mb-4" variants={{ animate: { transition: { staggerChildren: 0.05 } } }}>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        initial: { opacity: 0, scale: 0, rotate: -180 },
                        animate: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
                      }}
                    >
                      <Star size={20} className="fill-[#D4AF37] text-[#D4AF37]" />
                    </motion.div>
                  ))}
                </motion.div>
                <div className="text-6xl text-[#D4AF37] opacity-20 mb-2">"</div>
                <p className="text-gray-700 mb-6 italic relative -mt-4">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-[#2D2926] group-hover:text-[#D4AF37] transition-colors duration-200">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Video CTA */}
      <section className="relative py-32 bg-[#2D2926] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 text-center text-white"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
          >
            <Play className="ml-1" size={32} fill="white" />
          </motion.button>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Experience the Craftsmanship
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Watch how we transform raw materials into timeless pieces of art
          </p>
        </motion.div>
      </section>
    </div>
  );
}
