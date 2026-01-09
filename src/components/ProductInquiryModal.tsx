"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  Loader2,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Product } from "@/types";
import { InquiriesService } from "@/lib/firebase/inquiries";

interface ProductInquiryModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

type ContactMethod = 'phone' | 'whatsapp' | 'email';

export default function ProductInquiryModal({ product, isOpen, onClose }: ProductInquiryModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    message: '',
    preferredContact: 'phone' as ContactMethod,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter valid 10-digit phone number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter valid email address';
    }
    if (!formData.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      await InquiriesService.createInquiry({
        firstName,
        lastName,
        email: formData.email || `${formData.phone}@noemail.com`,
        phone: formData.phone,
        interestArea: product.category as any || 'General',
        budgetRange: '₹25,000 - ₹50,000',
        message: formData.message || `Inquiry from ${formData.city}`,
        preferredContact: formData.preferredContact,
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
        productImage: product.image,
      });

      setIsSuccess(true);

      // Reset and close after success
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          city: '',
          message: '',
          preferredContact: 'phone',
        });
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullInquiryPage = () => {
    onClose();
    router.push(`/custom-inquiry?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category)}&id=${product.id}`);
  };

  const handleWhatsAppInquiry = () => {
    const message = encodeURIComponent(
      `Hi, I'm interested in the ${product.name} (${product.category}). Please share more details.`
    );
    window.open(`https://wa.me/919714392926?text=${message}`, '_blank');
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+919714392926';
  };

  const handleEmailInquiry = () => {
    const subject = encodeURIComponent(`Inquiry: ${product.name}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in the ${product.name} (${product.category}).\n\nPlease share more details about pricing and availability.\n\nThank you.`
    );
    window.location.href = `mailto:elightsofaandcurtains@gmail.com?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#FAF9F7] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success State */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={40} className="text-emerald-600" />
              </motion.div>
              <h3 className="text-2xl font-serif font-bold text-[#2D2926] mb-3">
                Thank You!
              </h3>
              <p className="text-[#5C5856]">
                Our team will contact you shortly to discuss your inquiry about the {product.name}.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2D2926] to-[#3D3936] p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <p className="text-[#D4AF37] text-sm uppercase tracking-wider mb-1">Product Inquiry</p>
                <h2 className="text-xl font-serif font-bold pr-8">{product.name}</h2>
                <p className="text-white/70 text-sm mt-1">{product.category} • {product.material}</p>
              </div>

              {/* Quick Contact Options */}
              <div className="p-4 bg-white border-b border-[#E8E6E3]">
                <p className="text-xs text-[#8B8680] uppercase tracking-wider mb-3">Quick Contact</p>
                <div className="grid grid-cols-3 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppInquiry}
                    className="flex flex-col items-center gap-2 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle size={20} className="text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">WhatsApp</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCallNow}
                    className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Phone size={20} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Call Now</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEmailInquiry}
                    className="flex flex-col items-center gap-2 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <Mail size={20} className="text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Email</span>
                  </motion.button>
                </div>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
                <p className="text-sm text-[#5C5856] mb-4">
                  Fill the form below and our team will get back to you within 24 hours.
                </p>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2926] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 bg-red-50' : 'border-[#E8E6E3] bg-white'} focus:outline-none focus:border-[#D4AF37] transition-colors`}
                    placeholder="Enter your name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2926] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-[#E8E6E3] bg-white'} focus:outline-none focus:border-[#D4AF37] transition-colors`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2926] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 bg-red-50' : 'border-[#E8E6E3] bg-white'} focus:outline-none focus:border-[#D4AF37] transition-colors`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2926] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8680]" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.city ? 'border-red-300 bg-red-50' : 'border-[#E8E6E3] bg-white'} focus:outline-none focus:border-[#D4AF37] transition-colors`}
                      placeholder="Your city"
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2926] mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E6E3] bg-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-sm font-medium text-[#2D2926] mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'phone', label: 'Phone', icon: Phone },
                      { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      { value: 'email', label: 'Email', icon: Mail },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, preferredContact: option.value as ContactMethod })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all ${formData.preferredContact === option.value
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'border-[#E8E6E3] text-[#5C5856] hover:border-[#D4AF37]/50'
                          }`}
                      >
                        <option.icon size={16} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 bg-[#D4AF37] text-white font-semibold rounded-xl 
                           hover:bg-[#B8941F] transition-all duration-300 flex items-center justify-center gap-2
                           disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Inquiry
                    </>
                  )}
                </motion.button>

                {/* Full Inquiry Page Link */}
                <button
                  type="button"
                  onClick={handleFullInquiryPage}
                  className="w-full py-3 text-[#D4AF37] font-medium text-sm flex items-center justify-center gap-2 hover:underline"
                >
                  <ExternalLink size={16} />
                  Open Full Inquiry Form
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
