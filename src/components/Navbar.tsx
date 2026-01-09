"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Settings, Shield, Send } from "lucide-react";
import { useScroll } from "@/hooks/useScroll";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// Animation variants for mobile menu
const mobileMenuVariants = {
  initial: {
    x: "100%",
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const scrolled = useScroll();
  const { user, profile, signOut, loading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('Navbar scrolled state:', scrolled);
  }, [scrolled]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Collections", href: "/shop" },
    { name: "Heritage", href: "/about" },
    { name: "Custom Inquiry", href: "/inquiry" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.6
        }}
        className="fixed top-0 left-0 right-0 w-full z-50 bg-white shadow-md"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 z-10 flex-shrink-0">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotate: 2,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <span className={cn(
                  "text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-bold transition-colors duration-300 text-[#D4AF37]"
                )}>
                  <span className="hidden sm:inline">Elight Sofa House</span>
                  <span className="sm:hidden">Elight Sofa</span>
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1 space-x-6 lg:space-x-12 overflow-x-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative group flex-shrink-0"
                >
                  <span
                    className="text-xs lg:text-sm font-medium uppercase tracking-wider transition-all duration-300 ease-out text-black hover:text-[#D4AF37] whitespace-nowrap"
                    style={{
                      color: pathname === link.href ? '#D4AF37' : '#000000'
                    }}
                  >
                    {link.name}
                  </span>

                  {/* Hover underline */}
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37] origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ width: "100%" }}
                  />

                  {/* Active indicator */}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4AF37]"
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        duration: 0.3
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              <Link href="/inquiry">
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full transition-all duration-300 text-black hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  style={{ color: '#000000' }}
                  title="Send Inquiry"
                >
                  <Send size={18} />
                </motion.button>
              </Link>

              {/* User Authentication */}
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : user && profile ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 p-2 rounded-full transition-all duration-300 text-black hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </motion.button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50">
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{profile.name}</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 capitalize">{profile.role}</span>
                        </div>
                      </div>
                      <div className="py-2">
                        {(profile.role === 'admin' || profile.role === 'manager' || profile.role === 'staff') && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleSignOut();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#D4AF37] transition-colors"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                  <Link href="/auth/register">
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 8px 25px rgba(212, 175, 55, 0.3)",
                        transition: { type: "spring", stiffness: 400, damping: 10 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 lg:px-6 py-2 bg-[#D4AF37] text-white text-xs lg:text-sm font-medium uppercase tracking-wider rounded-sm hover:bg-[#B8941F] transition-all duration-200 shadow-md whitespace-nowrap"
                    >
                      Register
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 rounded-lg bg-gray-100 transition-colors duration-300 z-10 text-black"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-white shadow-2xl z-50 md:hidden overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <span className="text-lg font-serif font-bold text-[#D4AF37]">
                  Elight Sofa House
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Navigation Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: index * 0.1 }
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center w-full text-left font-medium uppercase tracking-wider transition-all duration-200 py-4 px-4 rounded-lg min-h-[48px]",
                          pathname === link.href
                            ? "text-[#D4AF37] font-semibold bg-[#D4AF37]/10 border-l-4 border-[#D4AF37]"
                            : "text-[#2D2926] hover:text-[#D4AF37] hover:bg-gray-50"
                        )}
                      >
                        <span className="text-base">{link.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.3 }
                }}
                className="p-4 border-t border-gray-200 bg-white flex-shrink-0 space-y-4"
              >
                <div className="flex items-center justify-center">
                  <Link href="/inquiry" onClick={() => setMobileMenuOpen(false)}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center justify-center w-12 h-12 text-[#2D2926] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full transition-colors"
                      title="Send Inquiry"
                    >
                      <Send size={20} />
                    </motion.button>
                  </Link>
                </div>

                {/* Mobile Auth Section */}
                {loading ? (
                  <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                ) : user && profile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <span className="text-white font-medium">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{profile.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
                      </div>
                    </div>

                    {(profile.role === 'admin' || profile.role === 'manager' || profile.role === 'staff') && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-6 py-3 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          <Settings size={18} />
                          Admin Panel
                        </motion.button>
                      </Link>
                    )}

                    <motion.button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Sign In
                      </motion.button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-6 py-3 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors shadow-md"
                      >
                        Register
                      </motion.button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

