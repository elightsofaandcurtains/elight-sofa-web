"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";
import {
  Users,
  PenTool,
  Package,
  Hammer,
  CheckCircle2,
  Truck,
  Sparkles,
} from "lucide-react";

// Process steps data
const processSteps = [
  {
    number: 1,
    title: "Consultation",
    description: "We begin with understanding your vision, lifestyle, and space requirements through personalized consultation.",
    icon: Users,
  },
  {
    number: 2,
    title: "Design",
    description: "Our expert designers create bespoke concepts that blend aesthetics with functionality.",
    icon: PenTool,
  },
  {
    number: 3,
    title: "Material Selection",
    description: "Choose from our curated collection of premium fabrics, leathers, and sustainable materials.",
    icon: Package,
  },
  {
    number: 4,
    title: "Craftsmanship",
    description: "Master artisans bring your vision to life using time-honored techniques and modern precision.",
    icon: Hammer,
  },
  {
    number: 5,
    title: "Quality Inspection",
    description: "Every piece undergoes rigorous quality checks to ensure perfection in every detail.",
    icon: CheckCircle2,
  },
  {
    number: 6,
    title: "Delivery & Setup",
    description: "White-glove delivery service with professional installation in your space.",
    icon: Truck,
  },
];

// Animated gold underline component
const GoldUnderline = ({ inView }: { inView: boolean }) => (
  <motion.div
    className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4"
    initial={{ width: 0, opacity: 0 }}
    animate={inView ? { width: "120px", opacity: 1 } : { width: 0, opacity: 0 }}
    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
  />
);

// Animated number with pulse glow
const AnimatedNumber = ({ number, isActive }: { number: number; isActive: boolean }) => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative"
      animate={isPulsing ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#D4AF37]"
        animate={{
          boxShadow: isActive || isPulsing
            ? ["0 0 20px rgba(212, 175, 55, 0.4)", "0 0 40px rgba(212, 175, 55, 0.6)", "0 0 20px rgba(212, 175, 55, 0.4)"]
            : "0 0 10px rgba(212, 175, 55, 0.2)",
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-[#1a1a1a] shadow-lg">
        {number}
      </div>
    </motion.div>
  );
};

// Process card component
const ProcessCard = ({ 
  step, 
  index, 
  isActive,
  onHover 
}: { 
  step: typeof processSteps[0]; 
  index: number;
  isActive: boolean;
  onHover: (index: number | null) => void;
}) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      className="relative group"
    >
      {/* Card */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1e2a3a] to-[#0f1419] rounded-2xl p-6 sm:p-8 border border-[#2a3a4a]/50 overflow-hidden h-full"
        whileHover={{
          y: -8,
          scale: 1.02,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
        animate={{
          boxShadow: isActive
            ? "0 25px 50px -12px rgba(212, 175, 55, 0.25), 0 0 0 1px rgba(212, 175, 55, 0.1)"
            : "0 10px 40px -15px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Ambient glow on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {/* Breathing effect background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/3 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Number and Icon */}
          <div className="flex items-center justify-between mb-6">
            <AnimatedNumber number={step.number} isActive={isActive} />
            
            <motion.div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center"
              whileHover={{
                rotate: 360,
                scale: 1.1,
                backgroundColor: "rgba(212, 175, 55, 0.2)",
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Icon className="text-[#D4AF37]" size={24} />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h3
            className="text-xl sm:text-2xl font-serif font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300"
          >
            {step.title}
          </motion.h3>

          {/* Description */}
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
            {step.description}
          </p>

          {/* Decorative line */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4AF37] to-transparent"
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <motion.div
            className="absolute -top-10 -right-10 w-20 h-20 bg-[#D4AF37]/10 rotate-45"
            whileHover={{ scale: 1.5, backgroundColor: "rgba(212, 175, 55, 0.15)" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Connection line (desktop) */}
      {index < processSteps.length - 1 && (
        <motion.div
          className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
          style={{
            background: "linear-gradient(90deg, #D4AF37, transparent)",
            transformOrigin: "left",
          }}
        />
      )}
    </motion.div>
  );
};


// Mobile step component with vertical timeline
const MobileProcessStep = ({ 
  step, 
  index, 
  isLast 
}: { 
  step: typeof processSteps[0]; 
  index: number;
  isLast: boolean;
}) => {
  const stepRef = useRef(null);
  const isInView = useInView(stepRef, { once: true, margin: "-30px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={stepRef}
      className="relative flex gap-4 sm:gap-6"
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <motion.div
          className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center text-lg font-bold text-[#1a1a1a] shadow-lg z-10"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 400 }}
          whileHover={{ scale: 1.1 }}
        >
          {step.number}
        </motion.div>
        {!isLast && (
          <motion.div
            className="w-[2px] flex-1 min-h-[60px] bg-gradient-to-b from-[#D4AF37] to-[#D4AF37]/20"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
            style={{ transformOrigin: "top" }}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        className="flex-1 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        <div className="bg-gradient-to-br from-[#1e2a3a] to-[#0f1419] rounded-xl p-4 sm:p-5 border border-[#2a3a4a]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
              <Icon className="text-[#D4AF37]" size={20} />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">{step.title}</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main component
export default function LuxuryProcessSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a1a1a 0%, #2D2926 50%, #1a1a1a 100%)",
      }}
    >
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none" 
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Animated background particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Sparkle accent */}
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={isHeaderInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
          >
            <Sparkles className="text-[#D4AF37]" size={28} />
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4E4A6]">
              Process
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            From consultation to delivery, we guide you through every step of creating your perfect piece
          </motion.p>

          {/* Gold underline */}
          <GoldUnderline inView={isHeaderInView} />
        </motion.div>

        {/* Desktop Grid View */}
        <div className="hidden lg:grid grid-cols-3 gap-6 xl:gap-8">
          {processSteps.map((step, index) => (
            <ProcessCard
              key={step.number}
              step={step}
              index={index}
              isActive={activeCard === index}
              onHover={setActiveCard}
            />
          ))}
        </div>

        {/* Tablet Grid View */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
          {processSteps.map((step, index) => (
            <ProcessCard
              key={step.number}
              step={step}
              index={index}
              isActive={activeCard === index}
              onHover={setActiveCard}
            />
          ))}
        </div>

        {/* Mobile Timeline View */}
        <div className="md:hidden">
          {processSteps.map((step, index) => (
            <MobileProcessStep
              key={step.number}
              step={step}
              index={index}
              isLast={index === processSteps.length - 1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12 sm:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(212, 175, 55, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-[#1a1a1a] font-semibold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            Start Your Journey
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 pointer-events-none">
        <motion.div
          className="absolute top-8 left-8 w-16 h-[1px] bg-gradient-to-r from-[#D4AF37]/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ transformOrigin: "left" }}
        />
        <motion.div
          className="absolute top-8 left-8 w-[1px] h-16 bg-gradient-to-b from-[#D4AF37]/50 to-transparent"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{ transformOrigin: "top" }}
        />
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 pointer-events-none">
        <motion.div
          className="absolute bottom-8 right-8 w-16 h-[1px] bg-gradient-to-l from-[#D4AF37]/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ transformOrigin: "right" }}
        />
        <motion.div
          className="absolute bottom-8 right-8 w-[1px] h-16 bg-gradient-to-t from-[#D4AF37]/50 to-transparent"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{ transformOrigin: "bottom" }}
        />
      </div>
    </section>
  );
}
