/**
 * PDF UTILITIES - INVOICE & DOCUMENT PDF GENERATION
 * ==================================================
 * Elight Sofa House - PDF Only Download Standard
 * 
 * All documents are generated and downloaded as PDF ONLY
 * No other formats (Excel, Word, Image) are supported
 * 
 * MIME Type: application/pdf
 * Page Size: A4
 * Quality: Print-ready
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '@/types';
import { PDF_CONFIG, generateFileName, logPDFDownload, downloadPDFBlob } from './pdfService';

/**
 * Generate Invoice PDF from HTML element
 * @param invoice - Invoice data
 * @param elementId - DOM element ID containing the invoice preview
 * @returns PDF Blob
 */
export const generateInvoicePDF = async (invoice: Invoice, elementId: string): Promise<Blob> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Invoice element not found');
    }

    // Configure html2canvas for high quality PDF output
    const canvas = await html2canvas(element, {
        scale: PDF_CONFIG.quality.scale,
        useCORS: PDF_CONFIG.quality.useCORS,
        allowTaint: PDF_CONFIG.quality.allowTaint,
        backgroundColor: PDF_CONFIG.quality.backgroundColor,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
    });

    const imgData = canvas.toDataURL('image/png');

    // Create PDF with A4 dimensions
    const pdf = new jsPDF('p', PDF_CONFIG.unit, PDF_CONFIG.pageSize);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions to fit A4 with proper margins
    const imgWidth = pdfWidth - (PDF_CONFIG.margins.left + PDF_CONFIG.margins.right);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = PDF_CONFIG.margins.top;

    // Add first page
    pdf.addImage(imgData, 'PNG', PDF_CONFIG.margins.left, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - PDF_CONFIG.margins.top - PDF_CONFIG.margins.bottom);

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
        position = heightLeft - imgHeight + PDF_CONFIG.margins.top;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', PDF_CONFIG.margins.left, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - PDF_CONFIG.margins.top - PDF_CONFIG.margins.bottom);
    }

    return pdf.output('blob');
};

/**
 * Download Invoice as PDF
 * ENFORCES PDF-ONLY DOWNLOAD - No other formats available
 * 
 * @param invoice - Invoice data
 * @param elementId - DOM element ID containing the invoice preview
 */
export const downloadPDF = async (invoice: Invoice, elementId: string): Promise<void> => {
    try {
        const pdfBlob = await generateInvoicePDF(invoice, elementId);
        
        // Generate standardized filename
        const fileName = generateFileName.invoice(
            invoice.invoiceNumber,
            invoice.customerDetails.name
        );
        
        // Download the PDF
        downloadPDFBlob(pdfBlob, fileName);
        
        // Log successful download for audit
        logPDFDownload({
            documentType: 'Invoice',
            fileName,
            downloadedAt: new Date().toISOString(),
            downloadedBy: 'Admin',
            success: true,
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Log failed download
        logPDFDownload({
            documentType: 'Invoice',
            fileName: `Invoice_${invoice.invoiceNumber}.pdf`,
            downloadedAt: new Date().toISOString(),
            downloadedBy: 'Admin',
            success: false,
            errorMessage,
        });
        
        console.error('Error generating PDF:', error);
        throw error;
    }
};

/**
 * Share Invoice via WhatsApp with PDF attachment
 * PDF is generated and shared - no other formats
 * 
 * @param invoice - Invoice data
 * @param elementId - DOM element ID containing the invoice preview
 */
export const shareViaWhatsApp = async (invoice: Invoice, elementId: string): Promise<void> => {
    try {
        const pdfBlob = await generateInvoicePDF(invoice, elementId);
        
        // Generate standardized filename
        const fileName = generateFileName.invoice(
            invoice.invoiceNumber,
            invoice.customerDetails.name
        );

        // Create a File object from the blob with PDF MIME type
        const pdfFile = new File([pdfBlob], fileName, {
            type: PDF_CONFIG.mimeType,
        });

        // Check if Web Share API is supported and can share files
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
                title: `Invoice ${invoice.invoiceNumber}`,
                text: `Invoice ${invoice.invoiceNumber} for ₹${invoice.grandTotal.toLocaleString()}`,
                files: [pdfFile],
            });
            
            // Log successful share
            logPDFDownload({
                documentType: 'Invoice (WhatsApp Share)',
                fileName,
                downloadedAt: new Date().toISOString(),
                downloadedBy: 'Admin',
                success: true,
            });
        } else {
            // Fallback: Open WhatsApp with text message and provide download link
            const message = `Invoice ${invoice.invoiceNumber} for ₹${invoice.grandTotal.toLocaleString()} has been generated. Customer: ${invoice.customerDetails.name}`;
            const phoneNumber = invoice.customerDetails.mobileNumber.replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // Also trigger PDF download so user can manually attach
            downloadPDFBlob(pdfBlob, fileName);

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            alert('PDF has been downloaded. Please attach it manually to your WhatsApp message.');
        }
    } catch (error) {
        console.error('Error sharing via WhatsApp:', error);
        throw error;
    }
};

/**
 * Generate Supplier Bill PDF
 * @param billNumber - Supplier bill number
 * @param supplierName - Supplier name
 * @param elementId - DOM element ID containing the bill preview
 */
export const downloadSupplierBillPDF = async (
    billNumber: string,
    supplierName: string,
    elementId: string
): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Supplier bill element not found');
    }

    try {
        const canvas = await html2canvas(element, {
            scale: PDF_CONFIG.quality.scale,
            useCORS: PDF_CONFIG.quality.useCORS,
            allowTaint: PDF_CONFIG.quality.allowTaint,
            backgroundColor: PDF_CONFIG.quality.backgroundColor,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', PDF_CONFIG.unit, PDF_CONFIG.pageSize);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pdfWidth - (PDF_CONFIG.margins.left + PDF_CONFIG.margins.right);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', PDF_CONFIG.margins.left, PDF_CONFIG.margins.top, imgWidth, imgHeight);

        const fileName = generateFileName.supplierBill(billNumber, supplierName);
        const blob = pdf.output('blob');
        downloadPDFBlob(blob, fileName);

        logPDFDownload({
            documentType: 'Supplier Bill',
            fileName,
            downloadedAt: new Date().toISOString(),
            downloadedBy: 'Admin',
            success: true,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logPDFDownload({
            documentType: 'Supplier Bill',
            fileName: `SupplierBill_${billNumber}.pdf`,
            downloadedAt: new Date().toISOString(),
            downloadedBy: 'Admin',
            success: false,
            errorMessage,
        });
        throw error;
    }
};

/**
 * Generate Payment Receipt PDF
 * @param receiptNumber - Receipt number
 * @param partyName - Customer or supplier name
 * @param elementId - DOM element ID containing the receipt preview
 */
export const downloadPaymentReceiptPDF = async (
    receiptNumber: string,
    partyName: string,
    elementId: string
): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Payment receipt element not found');
    }

    try {
        const canvas = await html2canvas(element, {
            scale: PDF_CONFIG.quality.scale,
            useCORS: PDF_CONFIG.quality.useCORS,
            allowTaint: PDF_CONFIG.quality.allowTaint,
            backgroundColor: PDF_CONFIG.quality.backgroundColor,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', PDF_CONFIG.unit, PDF_CONFIG.pageSize);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pdfWidth - (PDF_CONFIG.margins.left + PDF_CONFIG.margins.right);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', PDF_CONFIG.margins.left, PDF_CONFIG.margins.top, imgWidth, imgHeight);

        const fileName = generateFileName.paymentReceipt(receiptNumber, partyName);
        const blob = pdf.output('blob');
        downloadPDFBlob(blob, fileName);

        logPDFDownload({
            documentType: 'Payment Receipt',
            fileName,
            downloadedAt: new Date().toISOString(),
            downloadedBy: 'Admin',
            success: true,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logPDFDownload({
            documentType: 'Payment Receipt',
            fileName: `Receipt_${receiptNumber}.pdf`,
            downloadedAt: new Date().toISOString(),
            downloadedBy: 'Admin',
            success: false,
            errorMessage,
        });
        throw error;
    }
};

// Re-export PDF configuration for consistency
export { PDF_CONFIG, generateFileName } from './pdfService';
