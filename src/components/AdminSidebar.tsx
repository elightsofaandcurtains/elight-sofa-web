"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Package,
  Boxes,
  CreditCard,
  BarChart3,
  FileText,
  Menu,
  X,
  Home,
  MessageSquare,
} from "lucide-react";
import { ADMIN_TABS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  Briefcase,
  Package,
  Boxes,
  CreditCard,
  FileText,
  BarChart3,
  MessageSquare,
};

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  if (!mounted) return null;

  const currentTab = searchParams?.get("tab") || "dashboard";

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-3 bg-[#2D2926] text-white rounded-lg shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.div>
      </motion.button>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed left-0 top-0 h-screen w-72 max-w-[85vw] bg-[#2D2926] text-white z-50 md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-serif font-bold text-[#D4AF37]"
                >
                  ELIGHT Admin
                </motion.h1>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <Link
                  href="/"
                  className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 touch-target"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={20} />
                  <span>Back to Site</span>
                </Link>
                {ADMIN_TABS.map((tab, index) => {
                  const Icon = iconMap[tab.icon];
                  const isActive = currentTab === tab.id;
                  return (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={`/admin${tab.id !== "dashboard" ? `?tab=${tab.id}` : ""}`}
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-lg transition-colors touch-target",
                          isActive
                            ? "bg-[#D4AF37] text-white"
                            : "text-gray-300 hover:bg-gray-700"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{tab.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-[#2D2926] text-white z-40 transition-all duration-300 hidden md:block",
          collapsed ? "w-16 lg:w-20" : "w-56 lg:w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Desktop Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
            {!collapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg lg:text-2xl font-serif font-bold text-[#D4AF37]"
              >
                ELIGHT Admin
              </motion.h1>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              {collapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
            <Link
              href="/"
              className={cn(
                "flex items-center rounded-lg hover:bg-gray-700 transition-colors text-gray-300",
                collapsed ? "p-2 justify-center" : "space-x-3 p-2 lg:p-3"
              )}
            >
              <Home size={18} />
              {!collapsed && <span className="text-sm lg:text-base">Back to Site</span>}
            </Link>
            {ADMIN_TABS.map((tab) => {
              const Icon = iconMap[tab.icon];
              const isActive = currentTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/admin${tab.id !== "dashboard" ? `?tab=${tab.id}` : ""}`}
                  className={cn(
                    "flex items-center rounded-lg transition-colors",
                    collapsed ? "p-2 justify-center" : "space-x-3 p-2 lg:p-3",
                    isActive
                      ? "bg-[#D4AF37] text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <Icon size={18} />
                  {!collapsed && <span className="text-sm lg:text-base">{tab.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}

