"use client";

import { motion } from "framer-motion";
import { LucideIcon, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
  isCurrency?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay: 0.2
    }
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const valueVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.3, duration: 0.4 }
  }
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  index = 0,
  isCurrency = false,
  onClick,
  isLoading = false,
}: StatCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.1 }}
      whileHover={{
        y: -8,
        scale: 1.03,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      onClick={onClick}
      className="bg-white rounded-lg p-6 shadow-md group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div
          variants={iconVariants}
          whileHover="hover"
          className="p-3 bg-[#D4AF37]/10 rounded-lg group-hover:bg-[#D4AF37]/20 transition-colors duration-300"
        >
          <Icon className="text-[#D4AF37]" size={24} />
        </motion.div>

        {trend && !isLoading && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-sm font-semibold px-2 py-1 rounded-full ${trend.isPositive
                ? "text-green-600 bg-green-50"
                : "text-red-600 bg-red-50"
              }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </motion.div>
        )}
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-gray-600 uppercase tracking-wider mb-1 group-hover:text-[#D4AF37] transition-colors duration-200"
      >
        {title}
      </motion.h3>

      <motion.div
        variants={valueVariants}
        className="text-3xl font-bold text-[#2D2926] group-hover:text-[#D4AF37] transition-colors duration-200"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
            <span className="text-lg text-gray-400">Loading...</span>
          </div>
        ) : (
          isCurrency ? formatCurrency(Number(value)) : value
        )}
      </motion.div>
    </motion.div>
  );
}

