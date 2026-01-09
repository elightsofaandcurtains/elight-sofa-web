"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Mail,
  MessageCircle,
  Link2,
  Copy,
  Check,
  Loader2,
  FileText,
  Phone,
} from "lucide-react";
import { Invoice } from "@/types";
import { downloadInvoicePDFDirect } from "@/lib/pdfService";

interface ShareInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function ShareInvoiceModal({ invoice, onClose }: ShareInvoiceModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const invoiceLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invoice/${invoice.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invoiceLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert("Failed to copy link");
    }
  };

  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    setShareMethod("whatsapp");
    try {
      // Generate message
      const message = `*Invoice: ${invoice.invoiceNumber}*\n\nDear ${invoice.customerDetails.name},\n\nYour invoice has been generated.\n\n*Amount:* Rs. ${invoice.grandTotal.toLocaleString()}\n*Status:* ${invoice.paymentDetails.status}\n*Date:* ${new Date(invoice.invoiceDate).toLocaleDateString()}\n\nThank you for your business!\n\n- ${invoice.companyDetails.name}`;
      
      const phoneNumber = invoice.customerDetails.mobileNumber.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      setWhatsappSent(true);
    } catch (error) {
      alert("Error sharing via WhatsApp");
    } finally {
      setIsSharing(false);
      setShareMethod(null);
    }
  };

  const handleEmailShare = async () => {
    setIsSharing(true);
    setShareMethod("email");
    try {
      const subject = `Invoice ${invoice.invoiceNumber} - ${invoice.companyDetails.name}`;
      const body = `Dear ${invoice.customerDetails.name},

Please find below the details of your invoice:

Invoice Number: ${invoice.invoiceNumber}
Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}
Amount: Rs. ${invoice.grandTotal.toLocaleString()}
Payment Status: ${invoice.paymentDetails.status}

Items:
${invoice.products.map((p, i) => `${i + 1}. ${p.name} - Qty: ${p.quantity} - Rs. ${p.rowTotal.toLocaleString()}`).join('\n')}

Subtotal: Rs. ${invoice.subtotal.toLocaleString()}
GST: Rs. ${invoice.gstAmount.toLocaleString()}
Grand Total: Rs. ${invoice.grandTotal.toLocaleString()}

${invoice.paymentDetails.balanceAmount > 0 ? `Balance Due: Rs. ${invoice.paymentDetails.balanceAmount.toLocaleString()}` : 'Payment Status: Paid in Full'}

Thank you for your business!

Best regards,
${invoice.companyDetails.name}
${invoice.companyDetails.contactNumber}
${invoice.companyDetails.email}`;

      const mailtoUrl = `mailto:${invoice.customerDetails.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, '_blank');
      setEmailSent(true);
    } catch (error) {
      alert("Error opening email client");
    } finally {
      setIsSharing(false);
      setShareMethod(null);
    }
  };

  const handleWhatsAppWithPDF = async () => {
    setIsSharing(true);
    setShareMethod("whatsapp-pdf");
    try {
      // First download the PDF
      await downloadInvoicePDFDirect(invoice, 'Admin');
      
      // Then open WhatsApp
      const message = `Invoice ${invoice.invoiceNumber} - Rs. ${invoice.grandTotal.toLocaleString()} - PDF downloaded, please attach manually.`;
      const phoneNumber = invoice.customerDetails.mobileNumber.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      setWhatsappSent(true);
    } catch (error) {
      alert("Error sharing. PDF has been downloaded - please attach manually.");
    } finally {
      setIsSharing(false);
      setShareMethod(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Send size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Share Invoice</h2>
                <p className="text-white/70 text-sm">{invoice.invoiceNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Invoice Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <FileText size={20} className="text-[#D4AF37]" />
                <div>
                  <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">{invoice.customerDetails.name}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-[#D4AF37]">Rs. {invoice.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppShare}
                disabled={isSharing}
                className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <p className="text-sm text-gray-600">Send invoice details via WhatsApp</p>
                  </div>
                </div>
                {isSharing && shareMethod === "whatsapp" ? (
                  <Loader2 size={20} className="animate-spin text-green-600" />
                ) : whatsappSent ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Send size={20} className="text-green-600" />
                )}
              </motion.button>

              {/* Email */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEmailShare}
                disabled={isSharing}
                className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">Send invoice via email</p>
                  </div>
                </div>
                {isSharing && shareMethod === "email" ? (
                  <Loader2 size={20} className="animate-spin text-blue-600" />
                ) : emailSent ? (
                  <Check size={20} className="text-blue-600" />
                ) : (
                  <Send size={20} className="text-blue-600" />
                )}
              </motion.button>

              {/* Copy Link */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                    <Link2 size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Copy Link</p>
                    <p className="text-sm text-gray-600">Copy invoice link to clipboard</p>
                  </div>
                </div>
                {copied ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check size={20} />
                    <span className="text-sm">Copied!</span>
                  </div>
                ) : (
                  <Copy size={20} className="text-gray-600" />
                )}
              </motion.button>
            </div>

            {/* Customer Contact Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Customer Contact:</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-gray-700">
                  <Phone size={14} />
                  <span>{invoice.customerDetails.mobileNumber}</span>
                </div>
                {invoice.customerDetails.email && (
                  <div className="flex items-center space-x-1 text-gray-700">
                    <Mail size={14} />
                    <span className="truncate max-w-[150px]">{invoice.customerDetails.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Indicators */}
            {(whatsappSent || emailSent) && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">Share Status:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {whatsappSent && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <Check size={12} className="mr-1" /> WhatsApp Sent
                    </span>
                  )}
                  {emailSent && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      <Check size={12} className="mr-1" /> Email Opened
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
