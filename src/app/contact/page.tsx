"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  ArrowRight,
  User,
} from "lucide-react";
import { COMPANY_CONFIG } from "@/lib/companyConfig";

export default function ContactPage() {
  const { name, address, contact, owner, business } = COMPANY_CONFIG;

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Hero */}
      <section className="bg-[#2D2926] text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-3 md:mb-4">
              Visit Our Showroom
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Experience our luxury furniture in person at {name}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Showroom Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 md:space-y-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2D2926] mb-4 md:mb-6">
                Get In Touch
              </h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                We'd love to hear from you. Visit our showroom to see our
                collections in person, or contact us to schedule a private
                consultation.
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-3 md:space-x-4 p-4 md:p-6 bg-white rounded-lg shadow-md"
              >
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <MapPin className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-2">
                    Address
                  </h3>
                  <p className="text-gray-600">
                    {address.line1}
                    <br />
                    {address.line2}
                    <br />
                    {address.city}, {address.state} {address.pincode}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md"
              >
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <Phone className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-2">Phone</h3>
                  <p className="text-gray-600">
                    Main: {contact.phone}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md"
              >
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <Mail className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-2">Email</h3>
                  <p className="text-gray-600">
                    {contact.emails.map((email, index) => (
                      <span key={email}>
                        {email}
                        {index < contact.emails.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md"
              >
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <Clock className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-2">
                    Showroom Hours
                  </h3>
                  <p className="text-gray-600">
                    Monday - Saturday: 10:00 AM - 8:00 PM
                    <br />
                    Sunday: 11:00 AM - 6:00 PM
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md"
              >
                <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                  <User className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926] mb-2">
                    Owner
                  </h3>
                  <p className="text-gray-600">
                    {owner.name}
                    <br />
                    <span className="text-sm text-gray-500">{owner.designation}</span>
                    <br />
                    <span className="text-sm text-gray-500">Since {business.startDate}</span>
                  </p>
                </div>
              </motion.div>
            </div>

            <Link href="/inquiry">
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full lg:w-auto px-8 py-4 bg-[#D4AF37] text-white font-semibold uppercase tracking-wider hover:bg-[#B8941F] transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar size={20} />
                <span>Book Appointment</span>
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Map & Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800"
                alt="Showroom"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-[250px] md:h-[300px] rounded-lg overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.7661!2d72.8311!3d21.2167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDEzJzAwLjEiTiA3MsKwNDknNTIuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Elight Sofa House Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

