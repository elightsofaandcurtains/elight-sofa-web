"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  User,
} from "lucide-react";
import { COMPANY_CONFIG } from "@/lib/companyConfig";

const inquirySchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  interestArea: z.string().min(1, "Please select an interest area"),
  budget: z.number().min(0),
  timeline: z.string().min(1, "Please select a timeline"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

export default function InquiryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      budget: 5000,
      interestArea: "",
      timeline: "",
    },
  });

  const budgetValue = watch("budget");

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Form submitted:", data);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] pt-24 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-12 max-w-md text-center shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block p-4 bg-green-100 rounded-full mb-6"
          >
            <CheckCircle className="text-green-600" size={48} />
          </motion.div>
          <h2 className="text-3xl font-serif font-bold text-[#2D2926] mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-6">
            We've received your inquiry and will get back to you within 24
            hours.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#D4AF37] text-white font-medium rounded hover:bg-[#B8941F] transition-colors"
          >
            Return Home
          </a>
        </motion.div>
      </div>
    );
  }

  const { name, address, contact, owner } = COMPANY_CONFIG;

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-24 pb-20">
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
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
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
                  <h3 className="font-semibold text-[#2D2926] mb-1">
                    Showroom
                  </h3>
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

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg p-4 md:p-6 lg:p-8 shadow-md"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    {...register("firstName")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    {...register("lastName")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Area *
                </label>
                <select
                  {...register("interestArea")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">Select an area</option>
                  <option value="living-room">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="dining">Dining Room</option>
                  <option value="office">Office</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="custom">Custom Project</option>
                </select>
                {errors.interestArea && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.interestArea.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range: ${budgetValue.toLocaleString()} *
                </label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  {...register("budget", { valueAsNumber: true })}
                  onChange={(e) =>
                    setValue("budget", Number(e.target.value))
                  }
                  className="w-full h-2 md:h-1"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>$1,000</span>
                  <span>$50,000+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Timeline *
                </label>
                <select
                  {...register("timeline")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">As soon as possible</option>
                  <option value="1-3months">1-3 months</option>
                  <option value="3-6months">3-6 months</option>
                  <option value="6-12months">6-12 months</option>
                  <option value="exploring">Just exploring</option>
                </select>
                {errors.timeline && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.timeline.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  {...register("message")}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-[#D4AF37] text-white font-semibold rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Submit Inquiry</span>
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

