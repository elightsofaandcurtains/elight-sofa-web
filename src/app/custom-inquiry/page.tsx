"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  User,
  MessageCircle,
  Package,
} from "lucide-react";
import { COMPANY_CONFIG } from "@/lib/companyConfig";
import { InquiriesService } from "@/lib/firebase/inquiries";
import { mockProducts } from "@/data/mock";
import { Product, InquiryCategory, BudgetRange, PreferredContact } from "@/types";

const inquirySchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  interestArea: z.string().min(1, "Please select an interest area"),
  budgetRange: z.string().min(1, "Please select a budget range"),
  message: z.string().optional(),
  preferredContact: z.string().min(1, "Please select preferred contact method"),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

const INTEREST_AREAS: { value: InquiryCategory; label: string }[] = [
  { value: "Sofas", label: "Sofas" },
  { value: "Chairs", label: "Chairs" },
  { value: "Tables", label: "Tables" },
  { value: "Bedroom", label: "Bedroom Furniture" },
  { value: "Curtains", label: "Curtains" },
  { value: "General", label: "General Inquiry" },
];

const BUDGET_RANGES: { value: BudgetRange; label: string }[] = [
  { value: "₹10,000 - ₹25,000", label: "₹10,000 - ₹25,000" },
  { value: "₹25,000 - ₹50,000", label: "₹25,000 - ₹50,000" },
  { value: "₹50,000 - ₹1,00,000", label: "₹50,000 - ₹1,00,000" },
  { value: "₹1,00,000 - ₹2,00,000", label: "₹1,00,000 - ₹2,00,000" },
  { value: "₹2,00,000+", label: "₹2,00,000+" },
];

const CONTACT_METHODS: { value: PreferredContact; label: string; icon: any }[] = [
  { value: "phone", label: "Phone", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "email", label: "Email", icon: Mail },
];

function CustomInquiryContent() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  // Get product context from URL params
  const productName = searchParams?.get("product");
  const productCategory = searchParams?.get("category");
  const productId = searchParams?.get("id");

  useEffect(() => {
    if (productId) {
      const foundProduct = mockProducts.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [productId]);

  // Map category to interest area
  const getInterestArea = (): InquiryCategory => {
    if (!productCategory) return "General";
    const categoryMap: Record<string, InquiryCategory> = {
      "Sofas": "Sofas",
      "Chairs": "Chairs",
      "Tables": "Tables",
      "Bedroom": "Bedroom",
      "Curtains": "Curtains",
    };
    return categoryMap[productCategory] || "General";
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      interestArea: getInterestArea(),
      budgetRange: "",
      preferredContact: "phone",
      message: productName ? `I'm interested in the ${productName}. Please share more details.` : "",
    },
  });

  const selectedContact = watch("preferredContact");

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    try {
      await InquiriesService.createInquiry({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        interestArea: data.interestArea as InquiryCategory,
        budgetRange: data.budgetRange as BudgetRange,
        message: data.message,
        preferredContact: data.preferredContact as PreferredContact,
        productId: productId || undefined,
        productName: productName || undefined,
        productCategory: productCategory || undefined,
        productImage: product?.image,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-12 max-w-md text-center shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block p-4 bg-emerald-100 rounded-full mb-6"
          >
            <CheckCircle className="text-emerald-600" size={48} />
          </motion.div>
          <h2 className="text-3xl font-serif font-bold text-[#2D2926] mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-6">
            We've received your inquiry and our team will contact you shortly.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#D4AF37] text-white font-medium rounded-xl hover:bg-[#B8941F] transition-colors"
          >
            Return Home
          </a>
        </motion.div>
      </div>
    );
  }

  const { name, address, contact, owner } = COMPANY_CONFIG;

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2D2926] mb-4">
            Custom Inquiry
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Tell us about your vision, and we'll bring it to life
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Side - Contact Info & Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Product Preview (if from product page) */}
            {(productName || product) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-[#E8E6E3]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-[#D4AF37]" size={20} />
                  <h3 className="font-semibold text-[#2D2926]">Product of Interest</h3>
                </div>
                <div className="flex gap-4">
                  {product?.image && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#F5F3F0] flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[#2D2926]">{productName || product?.name}</p>
                    <p className="text-sm text-[#8B8680]">{productCategory || product?.category}</p>
                    {product?.material && (
                      <p className="text-xs text-[#8B8680] mt-1">{product.material}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2D2926] mb-4 md:mb-6">
                Get In Touch
              </h2>
              <p className="text-gray-600 mb-8">
                Our team is ready to help you create the perfect custom piece
                for your space. Reach out to us through any of the following
                channels.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <Phone className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-1">Phone</h3>
                  <p className="text-gray-600">{contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <Mail className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-1">Email</h3>
                  {contact.emails.map((email) => (
                    <p key={email} className="text-gray-600">{email}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <MapPin className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-1">Showroom</h3>
                  <p className="text-gray-600">
                    {address.line1}, {address.line2}
                    <br />
                    {address.city}, {address.state} {address.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <Clock className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-1">Hours</h3>
                  <p className="text-gray-600">
                    Mon-Sat: 10AM-8PM
                    <br />
                    Sun: 11AM-6PM
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <User className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-1">Contact Person</h3>
                  <p className="text-gray-600">
                    {owner.name}
                    <br />
                    <span className="text-sm text-gray-500">{owner.designation}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-[#E8E6E3]"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("firstName")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("lastName")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="10-digit mobile number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Interest Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Area <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("interestArea")}
                  disabled={!!productCategory}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select an area</option>
                  {INTEREST_AREAS.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
                {errors.interestArea && (
                  <p className="text-red-500 text-sm mt-1">{errors.interestArea.message}</p>
                )}
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("budgetRange")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                {errors.budgetRange && (
                  <p className="text-red-500 text-sm mt-1">{errors.budgetRange.message}</p>
                )}
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CONTACT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setValue("preferredContact", method.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selectedContact === method.value
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                          : "border-gray-200 text-gray-500 hover:border-[#D4AF37]/50"
                      }`}
                    >
                      <method.icon size={20} />
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register("preferredContact")} />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                  placeholder="Tell us about your requirements..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(212, 175, 55, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-[#D4AF37] text-white font-semibold rounded-xl hover:bg-[#B8941F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Request Inquiry</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CustomInquiryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CustomInquiryContent />
    </Suspense>
  );
}
