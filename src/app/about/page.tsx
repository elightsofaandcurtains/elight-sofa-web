"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  Sparkles,
  Gem,
  Ruler,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Star
} from "lucide-react";

// Timeline data
const timelineData = [
  {
    year: "2015",
    title: "Founded in Surat",
    description: "Small workshop with big vision - started crafting custom sofas with passion and dedication."
  },
  {
    year: "2018",
    title: "Growing Trust",
    description: "Expanded to custom sofas, curtains, and complete interior solutions for homes across Gujarat."
  },
  {
    year: "2021",
    title: "Premium Craft",
    description: "Introduced high-quality imported materials and advanced detailing techniques."
  },
  {
    year: "Today",
    title: "Complete Solutions",
    description: "A trusted name for premium furniture, custom interiors, and luxury home transformations."
  }
];

// Craftsmanship features
const craftsmanshipFeatures = [
  {
    icon: Sparkles,
    title: "Handcrafted Excellence",
    description: "Every piece is meticulously crafted by skilled artisans with decades of experience."
  },
  {
    icon: Gem,
    title: "Premium Materials",
    description: "We source only the finest fabrics, leathers, and woods from trusted suppliers."
  },
  {
    icon: Ruler,
    title: "Custom Measurements",
    description: "Perfect fit guaranteed with precise measurements tailored to your space."
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description: "Rigorous quality checks ensure every piece meets our exacting standards."
  }
];

// Values
const values = [
  "Quality Without Compromise",
  "Honest Pricing",
  "Custom-Made Comfort",
  "Long-Term Customer Trust"
];

// Highlight text component
const HighlightText = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#D4AF37] font-semibold">{children}</span>
);

export default function HeritagePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#F6F1EB] pt-20">
      {/* ==================== HERO SECTION ==================== */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=90"
            alt="Luxury Sofa Craftsmanship"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1F1F1F]/80 via-[#1F1F1F]/60 to-[#1F1F1F]/90" />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4AF37]/20 backdrop-blur-sm rounded-full mb-6"
            >
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase">Est. 2015 • Surat, Gujarat</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight">
              Our Heritage
            </h1>

            {/* Gold Animated Underline */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-8"
            />

            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed">
              A legacy of <span className="text-[#D4AF37]">craftsmanship</span> and <span className="text-[#D4AF37]">excellence</span> spanning generations
            </p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
            >
              <motion.div className="w-1.5 h-3 bg-[#D4AF37] rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== STORY SECTION ==================== */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block"
              >
                Our Story
              </motion.span>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2D2926] mb-8 leading-tight">
                Crafting Dreams<br />
                <span className="text-[#D4AF37]">Since 2015</span>
              </h2>

              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Founded in Surat, Gujarat, <HighlightText>Elight Sofa House</HighlightText> has grown into a trusted name for premium sofas, custom furniture, and elegant interiors. From our workshop at Katargam to homes across the region, every piece reflects dedication, <HighlightText>precision</HighlightText>, and passion for <HighlightText>craftsmanship</HighlightText>.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  We blend traditional techniques with modern design, creating furniture that is not only beautiful but built to last. Our commitment to <HighlightText>trust</HighlightText> and quality has made us the preferred choice for discerning homeowners seeking <HighlightText>custom design</HighlightText> solutions.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  Every sofa, every curtain, every piece of furniture that leaves our workshop carries with it a promise — a promise of excellence, durability, and timeless elegance.
                </motion.p>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <div className="relative h-[400px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=90"
                    alt="Elight Sofa House Workshop"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-[#D4AF37] rounded-2xl -z-10" />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#D4AF37]/10 rounded-2xl -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== TIMELINE SECTION ==================== */}
      <section className="py-24 md:py-32 bg-[#1F1F1F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
              Our Journey
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-6">
              A Legacy of <span className="text-[#D4AF37]">Excellence</span>
            </h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent" />

            {timelineData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2 }}
                className={`relative flex items-center mb-12 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
              >
                {/* Timeline Dot */}
                <motion.div
                  whileInView={{ scale: [0, 1.2, 1] }}
                  viewport={{ once: true }}
                  className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#D4AF37] rounded-full z-10 shadow-lg shadow-[#D4AF37]/50"
                />

                {/* Content Card */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#2D2926] p-6 md:p-8 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300"
                  >
                    <span className="text-[#D4AF37] text-2xl md:text-3xl font-serif font-bold">{item.year}</span>
                    <h3 className="text-xl md:text-2xl font-semibold text-white mt-2 mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CRAFTSMANSHIP SECTION ==================== */}
      <section className="py-24 md:py-32 bg-[#F6F1EB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
              Our Craft
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2D2926] mb-6">
              The Art of <span className="text-[#D4AF37]">Perfection</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every piece we create is a testament to our unwavering commitment to excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {craftsmanshipFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="bg-[#1F1F1F] p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-500 h-full relative overflow-hidden">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/0 to-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-6 relative z-10"
                  >
                    <feature.icon className="w-8 h-8 text-[#D4AF37]" />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-white mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed relative z-10">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== VALUES SECTION ==================== */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
              Our Values
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2D2926]">
              What We <span className="text-[#D4AF37]">Stand For</span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-6 p-6 rounded-xl hover:bg-[#F6F1EB] transition-colors duration-300"
                >
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3, delay: index * 0.5 }}
                    className="text-5xl md:text-6xl font-serif font-bold text-[#D4AF37]/30"
                  >
                    0{index + 1}
                  </motion.span>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2D2926]">
                    {value}
                  </h3>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== LOCAL TRUST & CONTACT SECTION ==================== */}
      <section className="py-24 md:py-32 bg-[#2D2926] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#D4AF37] text-sm font-medium tracking-[0.3em] uppercase mb-4 block">
                Visit Us
              </span>
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-8">
                Your Trusted <span className="text-[#D4AF37]">Local Partner</span>
              </h2>

              {/* Premium Brand Stamp */}
              <div className="bg-[#1F1F1F] p-8 rounded-2xl border border-[#D4AF37]/30 mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-serif font-bold text-[#1F1F1F]">E</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white">Elight Sofa House</h3>
                    <p className="text-[#D4AF37] text-sm tracking-wider">Premium Custom Furniture</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-start space-x-4 text-gray-300"
                  >
                    <MapPin className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                    <p>1/2, Shanti and Soc, Dabholi Rd,<br />Katargam, Surat, Gujarat 395004</p>
                  </motion.div>

                  <motion.a
                    href="tel:+919714392926"
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-4 text-gray-300 hover:text-[#D4AF37] transition-colors"
                  >
                    <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <p>+91 97143 92926</p>
                  </motion.a>

                  <motion.a
                    href="mailto:elightsofaandcurtains@gmail.com"
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-4 text-gray-300 hover:text-[#D4AF37] transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <p>elightsofaandcurtains@gmail.com</p>
                  </motion.a>

                  <motion.a
                    href="mailto:sabhadiyaravi2@gmail.com"
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-4 text-gray-300 hover:text-[#D4AF37] transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <p>sabhadiyaravi2@gmail.com</p>
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Map/Image */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=90"
                  alt="Elight Sofa House Showroom"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white/80 text-sm mb-2">Our Showroom</p>
                  <p className="text-white text-xl font-serif">Where Dreams Take Shape</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-[#F6F1EB] via-white to-[#F6F1EB] relative overflow-hidden">
        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 border border-[#D4AF37]/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-60 h-60 border border-[#D4AF37]/10 rounded-full"
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4AF37]/10 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm font-medium">Experience the Craft</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2D2926] mb-6 leading-tight">
              Ready to Transform<br />
              <span className="text-[#D4AF37]">Your Space?</span>
            </h2>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Experience furniture crafted with passion, precision, and pride.<br />
              Let us bring your vision to life.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/custom-inquiry"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-[#D4AF37] text-[#1F1F1F] font-semibold rounded-full hover:bg-[#B8941F] transition-all duration-300 shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:shadow-[#D4AF37]/40"
              >
                <span className="text-lg">Request Custom Inquiry</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <p className="mt-8 text-gray-500 text-sm">
              Free consultation • No obligation • Expert guidance
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
