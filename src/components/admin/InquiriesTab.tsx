"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Package,
  ChevronDown,
  X,
  Clock,
  User,
  IndianRupee,
  StickyNote,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Inquiry, InquiryStatus, InquiryNote } from "@/types";
import { InquiriesService } from "@/lib/firebase/inquiries";
import { cn } from "@/lib/utils";

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);

  useEffect(() => {
    loadInquiries();
  }, [statusFilter, categoryFilter]);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (categoryFilter !== "all") filters.category = categoryFilter;

      const data = await InquiriesService.getInquiries(filters);
      console.log("📋 Loaded inquiries from Firebase:", data.length);
      setInquiries(data);
    } catch (error) {
      console.error("Error loading inquiries:", error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailDrawer(true);

    if (!inquiry.isViewed) {
      try {
        await InquiriesService.markAsViewed(inquiry.id);
        setInquiries(prev => prev.map(inq =>
          inq.id === inquiry.id ? { ...inq, isViewed: true } : inq
        ));
      } catch (error) {
        console.error("Error marking as viewed:", error);
      }
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      await InquiriesService.updateInquiryStatus(inquiryId, newStatus);
      setInquiries(prev => prev.map(inq =>
        inq.id === inquiryId ? { ...inq, status: newStatus } : inq
      ));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    try {
      await InquiriesService.deleteInquiry(inquiryToDelete.id);
      setInquiries(prev => prev.filter(inq => inq.id !== inquiryToDelete.id));
      setShowDeleteModal(false);
      setInquiryToDelete(null);
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = searchTerm === "" ||
      `${inquiry.firstName} ${inquiry.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phone.includes(searchTerm) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: InquiryStatus) => {
    const styles = {
      new: "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30",
      in_progress: "bg-blue-100 text-blue-700 border-blue-200",
      closed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    const labels = { new: "New", in_progress: "In Progress", closed: "Closed" };
    return (
      <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", styles[status])}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2926] mb-2">
          Customer Inquiries
        </h1>
        <p className="text-gray-600">Manage and respond to customer inquiries</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: inquiries.length, color: "bg-gray-100 text-gray-700" },
          { label: "New", value: inquiries.filter(i => i.status === "new").length, color: "bg-[#D4AF37]/20 text-[#D4AF37]" },
          { label: "In Progress", value: inquiries.filter(i => i.status === "in_progress").length, color: "bg-blue-100 text-blue-700" },
          { label: "Closed", value: inquiries.filter(i => i.status === "closed").length, color: "bg-emerald-100 text-emerald-700" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("p-4 rounded-xl", stat.color)}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, email, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">All Categories</option>
          <option value="Sofas">Sofas</option>
          <option value="Chairs">Chairs</option>
          <option value="Tables">Tables</option>
          <option value="Bedroom">Bedroom</option>
          <option value="Curtains">Curtains</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* Inquiries Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Loading inquiries...</td></tr>
              ) : filteredInquiries.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <MessageCircle size={48} className="text-gray-300" />
                    <p className="text-gray-500 font-medium">No inquiries yet</p>
                    <p className="text-gray-400 text-sm">Customer inquiries will appear here when submitted</p>
                  </div>
                </td></tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <motion.tr
                    key={inquiry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer transition-colors",
                      !inquiry.isViewed && "bg-[#D4AF37]/5"
                    )}
                    onClick={() => handleViewInquiry(inquiry)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
                          inquiry.status === "new" ? "bg-[#D4AF37]" : inquiry.status === "in_progress" ? "bg-blue-500" : "bg-emerald-500"
                        )}>
                          {inquiry.firstName[0]}{inquiry.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-[#2D2926]">{inquiry.firstName} {inquiry.lastName}</p>
                          <p className="text-xs text-gray-500">{inquiry.interestArea}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#D4AF37]">
                          <Phone size={14} /> {inquiry.phone}
                        </a>
                        <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#D4AF37]">
                          <Mail size={14} /> {inquiry.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-sm text-[#2D2926]">{inquiry.productName || "-"}</p>
                      <p className="text-xs text-gray-500">{inquiry.productCategory || "-"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-[#2D2926]">{inquiry.budgetRange}</span>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(inquiry.status)}</td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600">{formatDate(inquiry.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2 min-w-[120px]">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewInquiry(inquiry); }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Eye size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setInquiryToDelete(inquiry); setShowDeleteModal(true); }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {showDetailDrawer && selectedInquiry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowDetailDrawer(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-serif font-bold text-[#2D2926]">Inquiry Details</h2>
                  <button onClick={() => setShowDetailDrawer(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3 flex items-center gap-2">
                    <User size={16} /> Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-[#2D2926]">
                      {selectedInquiry.firstName} {selectedInquiry.lastName}
                    </p>
                    <a href={`tel:${selectedInquiry.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37]">
                      <Phone size={16} /> {selectedInquiry.phone}
                    </a>
                    <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37]">
                      <Mail size={16} /> {selectedInquiry.email}
                    </a>
                    <p className="flex items-center gap-2 text-gray-600">
                      <MessageCircle size={16} /> Prefers: {selectedInquiry.preferredContact}
                    </p>
                  </div>
                </div>

                {/* Product Info */}
                {selectedInquiry.productName && (
                  <div className="bg-[#D4AF37]/10 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-[#D4AF37] uppercase mb-3 flex items-center gap-2">
                      <Package size={16} /> Product of Interest
                    </h3>
                    <p className="font-semibold text-[#2D2926]">{selectedInquiry.productName}</p>
                    <p className="text-sm text-gray-600">{selectedInquiry.productCategory}</p>
                  </div>
                )}

                {/* Inquiry Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Interest Area</span>
                    <span className="font-medium">{selectedInquiry.interestArea}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Budget Range</span>
                    <span className="font-medium text-[#D4AF37]">{selectedInquiry.budgetRange}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Submitted</span>
                    <span className="font-medium">{formatDate(selectedInquiry.createdAt)}</span>
                  </div>
                </div>

                {/* Message */}
                {selectedInquiry.message && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Message</h3>
                    <p className="text-gray-700">{selectedInquiry.message}</p>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Update Status</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(["new", "in_progress", "closed"] as InquiryStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedInquiry.id, status)}
                        className={cn(
                          "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                          selectedInquiry.status === status
                            ? status === "new" ? "bg-[#D4AF37] text-white"
                              : status === "in_progress" ? "bg-blue-500 text-white"
                                : "bg-emerald-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {status === "new" ? "New" : status === "in_progress" ? "In Progress" : "Closed"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                  <a
                    href={`https://wa.me/91${selectedInquiry.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle size={20} className="text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Phone size={20} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Call</span>
                  </a>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="flex flex-col items-center gap-2 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <Mail size={20} className="text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Email</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && inquiryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#2D2926] mb-2">Delete Inquiry?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the inquiry from {inquiryToDelete.firstName} {inquiryToDelete.lastName}? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteInquiry}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
