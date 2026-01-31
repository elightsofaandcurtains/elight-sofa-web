"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { COMPANY_CONFIG, getCopyright } from "@/lib/companyConfig";

export default function Footer() {
  const { name, address, contact, branding } = COMPANY_CONFIG;
  const footerLinks = {
    shop: [
      { name: "Collections", href: "/shop" },
      { name: "Custom Inquiry", href: "/inquiry" },
      { name: "Showroom", href: "/contact" },
    ],
    company: [
      { name: "Heritage", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "#" },
    ],
    support: [
      { name: "Shipping", href: "#" },
      { name: "Returns", href: "#" },
      { name: "Warranty", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  return (
    <footer className="bg-[#2D2926] text-white mt-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-serif font-bold text-[#D4AF37] mb-4">
              {name}
            </h3>
            <p className="text-gray-400 mb-4">
              Crafting luxury furniture for generations. Timeless elegance,
              exceptional quality.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-[#D4AF37]/20 rounded-full hover:bg-[#D4AF37] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4 uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin size={18} className="text-[#D4AF37] mt-1 flex-shrink-0" />
                <span className="break-words text-sm">{address.full}</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone size={18} className="text-[#D4AF37] flex-shrink-0" />
                <span className="text-sm">{contact.phone}</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail size={18} className="text-[#D4AF37] flex-shrink-0" />
                <span className="break-all text-sm">{contact.primaryEmail}</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>{getCopyright()}</p>
        </div>
      </div>
    </footer>
  );
}

