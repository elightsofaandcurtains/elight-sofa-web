"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Download,
    Printer,
    Send,
} from "lucide-react";
import { Invoice } from "@/types";
import { downloadPDF, shareViaWhatsApp } from "@/lib/pdfUtils";

interface InvoicePreviewProps {
    invoice: Invoice;
    onClose: () => void;
}

export default function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        setIsLoading(true);
        try {
            await downloadPDF(invoice, 'invoice-content');
        } catch (error) {
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendWhatsApp = async () => {
        setIsSharing(true);
        try {
            await shareViaWhatsApp(invoice, 'invoice-content');
        } catch (error) {
            alert('Error sharing via WhatsApp. Please try again.');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onClose}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-[#2D2926]">Invoice Preview</h2>
                        <p className="text-gray-600">{invoice.invoiceNumber}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleSendWhatsApp}
                        disabled={isSharing}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <Send size={20} />
                        <span>{isSharing ? 'Sharing...' : 'WhatsApp'}</span>
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Download size={20} />
                        <span>{isLoading ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Printer size={20} />
                        <span>Print</span>
                    </button>
                </div>
            </div>

            {/* Invoice Content - Optimized for PDF */}
            <div
                id="invoice-content"
                className="bg-white rounded-lg shadow-sm print:shadow-none print:rounded-none"
                style={{
                    maxWidth: '210mm',
                    margin: '0 auto',
                    padding: '20mm',
                    minHeight: '297mm',
                    boxSizing: 'border-box'
                }}
            >
                {/* Company Header */}
                <div className="border-b-2 border-[#D4AF37] pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[#2D2926] mb-3">
                                {invoice.companyDetails.name}
                            </h1>
                            <div className="text-sm text-gray-600 space-y-1 leading-relaxed">
                                <p className="break-words">{invoice.companyDetails.address}</p>
                                <p>Phone: {invoice.companyDetails.contactNumber}</p>
                                <p className="break-all">Email: {invoice.companyDetails.email}</p>
                                <p>GST: {invoice.companyDetails.gstNumber}</p>
                            </div>
                        </div>
                        <div className="text-right ml-4">
                            <div className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg mb-4 inline-block">
                                <h2 className="text-lg font-bold">INVOICE</h2>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
                                <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                                <p><strong>Salesperson:</strong> {invoice.salespersonName}</p>
                                <p><strong>Order Type:</strong> {invoice.orderType}</p>
                                {invoice.deliveryDate && (
                                    <p><strong>Delivery Date:</strong> {new Date(invoice.deliveryDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-[#2D2926] mb-3">Bill To:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-900 text-sm">{invoice.customerDetails.name}</p>
                        <p className="text-gray-600 text-sm break-words">{invoice.customerDetails.address}</p>
                        <p className="text-gray-600 text-sm">Phone: {invoice.customerDetails.mobileNumber}</p>
                        {invoice.customerDetails.email && (
                            <p className="text-gray-600 text-sm break-all">Email: {invoice.customerDetails.email}</p>
                        )}
                        {invoice.customerDetails.gstNumber && (
                            <p className="text-gray-600 text-sm">GST: {invoice.customerDetails.gstNumber}</p>
                        )}
                    </div>
                </div>

                {/* Products Table - Responsive */}
                <div className="mb-6">
                    <div className="overflow-hidden">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-[#D4AF37] text-white">
                                    <th className="border border-gray-400 px-2 py-2 text-left" style={{ width: '5%' }}>S.No</th>
                                    <th className="border border-gray-400 px-2 py-2 text-left" style={{ width: '25%' }}>Product Name</th>
                                    <th className="border border-gray-400 px-2 py-2 text-left" style={{ width: '10%' }}>Category</th>
                                    <th className="border border-gray-400 px-2 py-2 text-left" style={{ width: '12%' }}>Material</th>
                                    <th className="border border-gray-400 px-2 py-2 text-left" style={{ width: '10%' }}>Size</th>
                                    <th className="border border-gray-400 px-2 py-2 text-center" style={{ width: '6%' }}>Qty</th>
                                    <th className="border border-gray-400 px-2 py-2 text-right" style={{ width: '10%' }}>Rate (₹)</th>
                                    <th className="border border-gray-400 px-2 py-2 text-right" style={{ width: '8%' }}>Discount</th>
                                    <th className="border border-gray-400 px-2 py-2 text-center" style={{ width: '6%' }}>GST %</th>
                                    <th className="border border-gray-400 px-2 py-2 text-right" style={{ width: '12%' }}>Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.products.map((product, index) => (
                                    <tr key={product.id}>
                                        <td className="border border-gray-400 px-2 py-2 text-center">{index + 1}</td>
                                        <td className="border border-gray-400 px-2 py-2 font-medium break-words">{product.name}</td>
                                        <td className="border border-gray-400 px-2 py-2">{product.category}</td>
                                        <td className="border border-gray-400 px-2 py-2 break-words">{product.material}</td>
                                        <td className="border border-gray-400 px-2 py-2 break-words">{product.size}</td>
                                        <td className="border border-gray-400 px-2 py-2 text-center">{product.quantity}</td>
                                        <td className="border border-gray-400 px-2 py-2 text-right">₹{product.rate.toLocaleString()}</td>
                                        <td className="border border-gray-400 px-2 py-2 text-right">
                                            {product.discountType === 'percentage' ? `${product.discount}%` : `₹${product.discount}`}
                                        </td>
                                        <td className="border border-gray-400 px-2 py-2 text-center">{product.taxRate}%</td>
                                        <td className="border border-gray-400 px-2 py-2 text-right font-medium">₹{product.rowTotal.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="flex justify-end mb-6">
                    <div className="w-full max-w-xs">
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Discount:</span>
                                <span className="font-medium text-red-600">-₹{invoice.totalDiscount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">GST Amount:</span>
                                <span className="font-medium">₹{invoice.gstAmount.toLocaleString()}</span>
                            </div>
                            {invoice.transportCharges > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transport/Installation:</span>
                                    <span className="font-medium">₹{invoice.transportCharges.toLocaleString()}</span>
                                </div>
                            )}
                            <hr className="border-gray-300" />
                            <div className="flex justify-between text-base font-bold">
                                <span>Grand Total:</span>
                                <span className="text-[#D4AF37]">₹{invoice.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amount in Words */}
                <div className="mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-1">Amount in Words:</p>
                        <p className="text-gray-900 font-medium text-sm break-words">{invoice.amountInWords}</p>
                    </div>
                </div>

                {/* Payment Details and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-[#2D2926] mb-2">Payment Details</h3>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Mode:</span>
                                <span className="font-medium">{invoice.paymentDetails.mode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                <span className={`font-medium ${invoice.paymentDetails.status === 'Paid' ? 'text-green-600' :
                                        invoice.paymentDetails.status === 'Partial' ? 'text-yellow-600' :
                                            'text-red-600'
                                    }`}>
                                    {invoice.paymentDetails.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Advance Paid:</span>
                                <span className="font-medium">₹{invoice.paymentDetails.advancePaid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Balance Amount:</span>
                                <span className="font-medium">₹{invoice.paymentDetails.balanceAmount.toLocaleString()}</span>
                            </div>
                            {invoice.paymentDetails.dueDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Due Date:</span>
                                    <span className="font-medium">{new Date(invoice.paymentDetails.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-[#2D2926] mb-2">Terms & Conditions</h3>
                        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1 leading-relaxed">
                            <p>• Payment is due within 30 days of invoice date</p>
                            <p>• Goods once sold will not be taken back</p>
                            <p>• Warranty terms apply as per company policy</p>
                            <p>• Any disputes subject to local jurisdiction</p>
                            <p>• Installation charges are extra if applicable</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t pt-4 text-center text-gray-600">
                    <p className="text-sm">Thank you for your business!</p>
                    <p className="text-xs mt-1">This is a computer generated invoice and does not require signature.</p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
        </div>
    );
}