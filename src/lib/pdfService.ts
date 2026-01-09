/**
 * PDF DOCUMENT SERVICE - MASTER PDF GENERATION STANDARD
 * =====================================================
 * Elight Sofa House - Global Document Download Standard
 * 
 * SCOPE: All documents MUST be downloaded as PDF only
 * - Employee Payslips
 * - Customer Bills / Invoices
 * - Supplier Purchase Bills
 * - Payment Receipts
 * - Salary Slips
 * - Stock Reports
 * - Leave Reports
 * - Any printable financial or admin document
 * 
 * STANDARDS:
 * - PDF format ONLY (no Excel/Word/Image options)
 * - A4 page size with proper margins
 * - Company branding (logo, stamp, signature)
 * - Standardized file naming convention
 * - MIME type: application/pdf
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getPayslipHeader, getAuthorizationDetails } from './companyConfig';
import { Invoice, Employee, EmployeeLeave, EmployeeCommission, LeaveDeductionRecord } from '@/types';

// ============================================
// PDF CONFIGURATION CONSTANTS
// ============================================
export const PDF_CONFIG = {
  pageSize: 'a4' as const,
  orientation: 'portrait' as const,
  unit: 'mm' as const,
  margins: { top: 15, right: 15, bottom: 15, left: 15 },
  mimeType: 'application/pdf',
  quality: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' },
};

// ============================================
// FILE NAMING CONVENTIONS
// ============================================
export const generateFileName = {
  payslip: (employeeName: string, month: string, year: number): string => {
    const sanitizedName = employeeName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    return `Payslip_${sanitizedName}_${month}_${year}.pdf`;
  },
  invoice: (invoiceNumber: string, customerName: string): string => {
    const sanitizedCustomer = customerName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const sanitizedInvoice = invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '');
    return `Invoice_${sanitizedInvoice}_${sanitizedCustomer}.pdf`;
  },
  supplierBill: (billNumber: string, supplierName: string): string => {
    const sanitizedSupplier = supplierName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const sanitizedBill = billNumber.replace(/[^a-zA-Z0-9-]/g, '');
    return `SupplierBill_${sanitizedBill}_${sanitizedSupplier}.pdf`;
  },
  paymentReceipt: (receiptNumber: string, partyName: string): string => {
    const sanitizedParty = partyName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    return `Receipt_${receiptNumber}_${sanitizedParty}.pdf`;
  },
  report: (reportType: string, date: string): string => {
    const sanitizedType = reportType.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const sanitizedDate = date.replace(/[^0-9-]/g, '');
    return `Report_${sanitizedType}_${sanitizedDate}.pdf`;
  },
  leaveReport: (employeeName: string, period: string): string => {
    const sanitizedName = employeeName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    return `LeaveReport_${sanitizedName}_${period}.pdf`;
  },
  stockReport: (category: string, date: string): string => {
    const sanitizedCategory = category.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    return `StockReport_${sanitizedCategory}_${date}.pdf`;
  },
};

// ============================================
// PDF DOWNLOAD AUDIT LOG
// ============================================
interface PDFDownloadLog {
  documentType: string;
  fileName: string;
  downloadedAt: string;
  downloadedBy: string;
  success: boolean;
  errorMessage?: string;
}

const downloadLogs: PDFDownloadLog[] = [];

export const logPDFDownload = (log: PDFDownloadLog): void => {
  downloadLogs.push(log);
  console.log('[PDF Audit]', log);
};

export const getDownloadLogs = (): PDFDownloadLog[] => [...downloadLogs];

// ============================================
// CORE PDF GENERATION FROM HTML ELEMENT
// ============================================
export const generatePDFFromElement = async (
  elementId: string,
  _fileName: string,
  options?: { orientation?: 'portrait' | 'landscape'; addWatermark?: boolean; watermarkText?: string; }
): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with ID "${elementId}" not found`);

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
  const orientation = options?.orientation || PDF_CONFIG.orientation;
  const pdf = new jsPDF(orientation === 'portrait' ? 'p' : 'l', PDF_CONFIG.unit, PDF_CONFIG.pageSize);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth - (PDF_CONFIG.margins.left + PDF_CONFIG.margins.right);
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = PDF_CONFIG.margins.top;

  pdf.addImage(imgData, 'PNG', PDF_CONFIG.margins.left, position, imgWidth, imgHeight);
  heightLeft -= (pdfHeight - PDF_CONFIG.margins.top - PDF_CONFIG.margins.bottom);

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + PDF_CONFIG.margins.top;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', PDF_CONFIG.margins.left, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - PDF_CONFIG.margins.top - PDF_CONFIG.margins.bottom);
  }

  if (options?.addWatermark && options?.watermarkText) {
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(40);
      pdf.text(options.watermarkText, pdfWidth / 2, pdfHeight / 2, { align: 'center', angle: 45 });
    }
  }

  return pdf.output('blob');
};

// ============================================
// DOWNLOAD PDF BLOB
// ============================================
export const downloadPDFBlob = (blob: Blob, fileName: string): void => {
  if (!fileName.endsWith('.pdf')) fileName = `${fileName}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.type = PDF_CONFIG.mimeType;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ============================================
// UNIFIED PDF DOWNLOAD FUNCTION
// ============================================
export const downloadPDFDocument = async (
  elementId: string,
  fileName: string,
  documentType: string,
  downloadedBy: string = 'Admin',
  options?: { orientation?: 'portrait' | 'landscape'; addWatermark?: boolean; watermarkText?: string; }
): Promise<boolean> => {
  try {
    const blob = await generatePDFFromElement(elementId, fileName, options);
    downloadPDFBlob(blob, fileName);
    logPDFDownload({ documentType, fileName, downloadedAt: new Date().toISOString(), downloadedBy, success: true });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPDFDownload({ documentType, fileName, downloadedAt: new Date().toISOString(), downloadedBy, success: false, errorMessage });
    console.error('PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${errorMessage}`);
  }
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ============================================
// PAYSLIP DATA INTERFACE
// ============================================
export interface PayslipData {
  employee: Employee;
  leaves: EmployeeLeave[];
  commissions: EmployeeCommission[];
  deductionRecords: LeaveDeductionRecord[];
  month: number;
  year: number;
}


// ============================================
// PAYSLIP PDF GENERATION (with proper spacing)
// ============================================
export const generatePayslipPDF = async (data: PayslipData): Promise<Blob> => {
  const { employee, leaves, commissions, deductionRecords, month, year } = data;
  const companyHeader = getPayslipHeader();
  const authDetails = getAuthorizationDetails();

  // Calculate salary details
  const workingDays = employee.workingDaysPerMonth || 26;
  const baseSalary = employee.salary;
  const isPerDaySalaryType = employee.salaryType === 'per_day';
  const customPerDaySalary = employee.customPerDaySalary || 0;
  const calculatedPerDaySalary = baseSalary / workingDays;
  const effectivePerDaySalary = isPerDaySalaryType && customPerDaySalary > 0 ? customPerDaySalary : calculatedPerDaySalary;

  const deductionRecord = deductionRecords.find(r => r.employeeId === employee.id && r.month === month && r.year === year);
  const isDeductionApplied = deductionRecord?.isDeductionApplied || false;
  const isAutoMode = deductionRecord?.deductionMode === 'automatic';

  const monthLeaves = leaves.filter(l => {
    if (l.employeeId !== employee.id || l.status !== 'approved') return false;
    const leaveDate = new Date(l.fromDate);
    return leaveDate.getMonth() === month && leaveDate.getFullYear() === year;
  });

  const paidLeaveDays = monthLeaves.filter(l => ['paid', 'sick', 'casual'].includes(l.leaveType)).reduce((sum, l) => sum + l.totalDays, 0);
  const unpaidLeaveDays = monthLeaves.filter(l => l.leaveType === 'unpaid').reduce((sum, l) => sum + l.totalDays, 0);
  const halfDayLeaveDays = monthLeaves.filter(l => l.leaveType === 'half_day').reduce((sum, l) => sum + l.totalDays, 0);

  const unpaidDeduction = unpaidLeaveDays * effectivePerDaySalary;
  const halfDayDeduction = halfDayLeaveDays * (effectivePerDaySalary * 0.5);
  const actualDeduction = (isAutoMode || isDeductionApplied) ? (unpaidDeduction + halfDayDeduction) : 0;

  const monthCommissions = commissions.filter(c => {
    if (c.employeeId !== employee.id) return false;
    const commDate = new Date(c.commissionDate);
    return commDate.getMonth() === month && commDate.getFullYear() === year;
  });
  const totalCommission = monthCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  const effectiveBaseSalary = isPerDaySalaryType
    ? effectivePerDaySalary * (workingDays - (isAutoMode || isDeductionApplied ? unpaidLeaveDays + (halfDayLeaveDays * 0.5) : 0))
    : baseSalary;

  const netSalary = isPerDaySalaryType
    ? effectiveBaseSalary + totalCommission
    : baseSalary - actualDeduction + totalCommission;

  // Create PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = 0;

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // ========== HEADER (45mm) ==========
  pdf.setFillColor(45, 41, 38);
  pdf.rect(0, 0, pageWidth, 45, 'F');

  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companyHeader.companyName, margin, 18);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(companyHeader.tagline, margin, 25);
  pdf.text(companyHeader.address, margin, 31);
  pdf.text(`Email: ${companyHeader.email}  |  Phone: ${companyHeader.phone}`, margin, 37);

  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PAYSLIP', pageWidth - margin, 20, { align: 'right' });
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${months[month]} ${year}`, pageWidth - margin, 30, { align: 'right' });

  y = 55;

  // ========== EMPLOYEE DETAILS SECTION ==========
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, y, contentWidth, 10, 'F');
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EMPLOYEE DETAILS', margin + 4, y + 7);

  y += 16;

  const leftCol = margin + 4;
  const leftValCol = margin + 35;
  const rightCol = pageWidth / 2 + 4;
  const rightValCol = pageWidth / 2 + 32;
  const rowHeight = 6;

  pdf.setFontSize(9);

  // Row 1
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Employee Name:', leftCol, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(employee.name, leftValCol, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Pay Period:', rightCol, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(`${months[month]} ${year}`, rightValCol, y);

  // Row 2
  y += rowHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Employee ID:', leftCol, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(`EMP-${employee.id.slice(-4).padStart(4, '0')}`, leftValCol, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Working Days:', rightCol, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(`${workingDays} days`, rightValCol, y);

  // Row 3
  y += rowHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Designation:', leftCol, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(employee.position, leftValCol, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Salary Type:', rightCol, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(isPerDaySalaryType ? 147 : 59, isPerDaySalaryType ? 51 : 130, isPerDaySalaryType ? 234 : 246);
  pdf.text(isPerDaySalaryType ? 'Per-Day' : 'Monthly', rightValCol, y);

  // Row 4
  y += rowHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Department:', leftCol, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(employee.department.charAt(0).toUpperCase() + employee.department.slice(1), leftValCol, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Per-Day Rate:', rightCol, y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(formatCurrency(effectivePerDaySalary), rightValCol, y);

  y += 14;

  // ========== EARNINGS & DEDUCTIONS SIDE BY SIDE ==========
  const boxWidth = (contentWidth - 6) / 2;
  const leftBoxX = margin;
  const rightBoxX = margin + boxWidth + 6;

  // EARNINGS BOX
  pdf.setFillColor(220, 252, 231);
  pdf.rect(leftBoxX, y, boxWidth, 10, 'F');
  pdf.setTextColor(22, 101, 52);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EARNINGS', leftBoxX + 4, y + 7);

  let earningsY = y + 16;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text(isPerDaySalaryType ? 'Base Salary (Calculated)' : 'Base Salary', leftBoxX + 4, earningsY);
  pdf.setTextColor(22, 163, 74);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`+ ${formatCurrency(effectiveBaseSalary)}`, leftBoxX + boxWidth - 4, earningsY, { align: 'right' });

  if (totalCommission > 0) {
    earningsY += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Commission (${monthCommissions.length} sales)`, leftBoxX + 4, earningsY);
    pdf.setTextColor(22, 163, 74);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`+ ${formatCurrency(totalCommission)}`, leftBoxX + boxWidth - 4, earningsY, { align: 'right' });
  }

  earningsY += 10;
  pdf.setDrawColor(22, 163, 74);
  pdf.setLineWidth(0.3);
  pdf.line(leftBoxX + 2, earningsY, leftBoxX + boxWidth - 2, earningsY);
  earningsY += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(22, 101, 52);
  pdf.text('Total Earnings', leftBoxX + 4, earningsY);
  pdf.setTextColor(22, 163, 74);
  pdf.text(formatCurrency(effectiveBaseSalary + totalCommission), leftBoxX + boxWidth - 4, earningsY, { align: 'right' });

  // DEDUCTIONS BOX
  pdf.setFillColor(254, 226, 226);
  pdf.rect(rightBoxX, y, boxWidth, 10, 'F');
  pdf.setTextColor(153, 27, 27);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DEDUCTIONS', rightBoxX + 4, y + 7);

  let deductionsY = y + 16;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text(`Paid Leaves (${paidLeaveDays} days)`, rightBoxX + 4, deductionsY);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Rs. 0.00', rightBoxX + boxWidth - 4, deductionsY, { align: 'right' });

  deductionsY += 8;
  pdf.setTextColor(60, 60, 60);
  pdf.text(`Unpaid Leave (${unpaidLeaveDays} days)`, rightBoxX + 4, deductionsY);
  pdf.setTextColor(220, 38, 38);
  pdf.setFont('helvetica', 'bold');
  const unpaidAmt = (!isPerDaySalaryType && (isAutoMode || isDeductionApplied)) ? unpaidDeduction : 0;
  pdf.text(`- ${formatCurrency(unpaidAmt)}`, rightBoxX + boxWidth - 4, deductionsY, { align: 'right' });

  deductionsY += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text(`Half Day (${halfDayLeaveDays} days)`, rightBoxX + 4, deductionsY);
  pdf.setTextColor(220, 38, 38);
  pdf.setFont('helvetica', 'bold');
  const halfDayAmt = (!isPerDaySalaryType && (isAutoMode || isDeductionApplied)) ? halfDayDeduction : 0;
  pdf.text(`- ${formatCurrency(halfDayAmt)}`, rightBoxX + boxWidth - 4, deductionsY, { align: 'right' });

  deductionsY += 10;
  pdf.setDrawColor(220, 38, 38);
  pdf.setLineWidth(0.3);
  pdf.line(rightBoxX + 2, deductionsY, rightBoxX + boxWidth - 2, deductionsY);
  deductionsY += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(153, 27, 27);
  pdf.text('Total Deductions', rightBoxX + 4, deductionsY);
  pdf.setTextColor(220, 38, 38);
  pdf.text(formatCurrency(isPerDaySalaryType ? 0 : actualDeduction), rightBoxX + boxWidth - 4, deductionsY, { align: 'right' });

  y = Math.max(earningsY, deductionsY) + 16;

  // ========== NET SALARY BOX ==========
  pdf.setFillColor(212, 175, 55);
  pdf.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NET PAYABLE SALARY', margin + 10, y + 14);

  pdf.setFontSize(18);
  pdf.text(formatCurrency(netSalary), pageWidth - margin - 10, y + 14, { align: 'right' });

  y += 32;

  // ========== SALARY BREAKDOWN (Summary) ==========
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, y, contentWidth, 10, 'F');
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SALARY CALCULATION SUMMARY', margin + 4, y + 7);

  y += 14;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);

  if (isPerDaySalaryType) {
    pdf.text(`Per-Day Rate: ${formatCurrency(effectivePerDaySalary)} x Working Days: ${workingDays} = ${formatCurrency(effectiveBaseSalary)}`, margin + 4, y);
  } else {
    pdf.text(`Base Salary: ${formatCurrency(baseSalary)} - Deductions: ${formatCurrency(actualDeduction)} + Commission: ${formatCurrency(totalCommission)} = ${formatCurrency(netSalary)}`, margin + 4, y);
  }

  y += 16;

  // ========== FOOTER SECTION ==========
  const footerStartY = pageHeight - 45;

  // Separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerStartY, pageWidth - margin, footerStartY);

  // Company Stamp Box (Left)
  const stampBoxY = footerStartY + 5;
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  pdf.rect(margin + 5, stampBoxY, 45, 22, 'S');

  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Company Stamp', margin + 27.5, stampBoxY + 28, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(80, 80, 80);
  pdf.text(authDetails.companyName, margin + 27.5, stampBoxY + 33, { align: 'center' });

  // Authorized Signatory (Right)
  const sigX = pageWidth - margin - 50;
  pdf.setDrawColor(180, 180, 180);
  pdf.line(sigX, stampBoxY + 18, sigX + 45, stampBoxY + 18);

  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Authorized Signatory', sigX + 22.5, stampBoxY + 24, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(80, 80, 80);
  pdf.text(authDetails.authorizedSignatory, sigX + 22.5, stampBoxY + 30, { align: 'center' });

  // Footer note
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text('This is a computer-generated payslip and does not require a physical signature.', pageWidth / 2, pageHeight - 8, { align: 'center' });

  return pdf.output('blob');
};


// ============================================
// DOWNLOAD PAYSLIP PDF
// ============================================
export const downloadPayslipPDF = async (
  data: PayslipData,
  downloadedBy: string = 'Admin'
): Promise<boolean> => {
  try {
    const blob = await generatePayslipPDF(data);
    const fileName = generateFileName.payslip(data.employee.name, months[data.month], data.year);
    downloadPDFBlob(blob, fileName);
    logPDFDownload({ documentType: 'Payslip', fileName, downloadedAt: new Date().toISOString(), downloadedBy, success: true });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPDFDownload({
      documentType: 'Payslip',
      fileName: `Payslip_${data.employee.name}_${months[data.month]}_${data.year}.pdf`,
      downloadedAt: new Date().toISOString(),
      downloadedBy,
      success: false,
      errorMessage,
    });
    throw error;
  }
};

// ============================================
// INVOICE PDF DOWNLOAD
// ============================================
export const downloadInvoicePDF = async (
  invoice: Invoice,
  elementId: string,
  downloadedBy: string = 'Admin'
): Promise<boolean> => {
  const fileName = generateFileName.invoice(invoice.invoiceNumber, invoice.customerDetails.name);
  return downloadPDFDocument(elementId, fileName, 'Invoice', downloadedBy);
};

// ============================================
// PAYMENT RECEIPT PDF
// ============================================
export const downloadPaymentReceiptPDF = async (
  receiptNumber: string,
  partyName: string,
  elementId: string,
  downloadedBy: string = 'Admin'
): Promise<boolean> => {
  const fileName = generateFileName.paymentReceipt(receiptNumber, partyName);
  return downloadPDFDocument(elementId, fileName, 'Payment Receipt', downloadedBy);
};

// ============================================
// REPORT PDF DOWNLOAD
// ============================================
export const downloadReportPDF = async (
  reportType: string,
  elementId: string,
  downloadedBy: string = 'Admin',
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<boolean> => {
  const date = new Date().toISOString().split('T')[0];
  const fileName = generateFileName.report(reportType, date);
  return downloadPDFDocument(elementId, fileName, reportType, downloadedBy, { orientation });
};

// ============================================
// STOCK REPORT PDF
// ============================================
export const downloadStockReportPDF = async (
  category: string,
  elementId: string,
  downloadedBy: string = 'Admin'
): Promise<boolean> => {
  const date = new Date().toISOString().split('T')[0];
  const fileName = generateFileName.stockReport(category, date);
  return downloadPDFDocument(elementId, fileName, 'Stock Report', downloadedBy, { orientation: 'landscape' });
};

// ============================================
// LEAVE REPORT PDF
// ============================================
export const downloadLeaveReportPDF = async (
  employeeName: string,
  period: string,
  elementId: string,
  downloadedBy: string = 'Admin'
): Promise<boolean> => {
  const fileName = generateFileName.leaveReport(employeeName, period);
  return downloadPDFDocument(elementId, fileName, 'Leave Report', downloadedBy);
};

// ============================================
// INVOICE PDF GENERATION (Direct jsPDF - Professional Format)
// ============================================
export const generateInvoicePDF = async (invoice: Invoice): Promise<Blob> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2); // 186mm
  let y = 0;

  // Helper function for currency formatting
  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // ==========================================
  // SECTION 1: HEADER (Dark Background)
  // ==========================================
  pdf.setFillColor(45, 41, 38);
  pdf.rect(0, 0, pageWidth, 38, 'F');

  // Company Name (Gold)
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(invoice.companyDetails.name, margin, 14);

  // Company Address & Contact (White)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.companyDetails.address, margin, 21);
  pdf.text(`Phone: ${invoice.companyDetails.contactNumber}  |  Email: ${invoice.companyDetails.email}`, margin, 27);
  if (invoice.companyDetails.gstNumber) {
    pdf.text(`GST: ${invoice.companyDetails.gstNumber}`, margin, 33);
  }

  // Invoice Title (Right Side)
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TAX INVOICE', pageWidth - margin, 14, { align: 'right' });

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${invoice.invoiceNumber}`, pageWidth - margin, 22, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, pageWidth - margin, 29, { align: 'right' });

  y = 46;

  // ==========================================
  // SECTION 2: INVOICE INFO & CUSTOMER (Side by Side)
  // ==========================================
  const boxHeight = 32;
  const leftBoxWidth = 88;
  const rightBoxWidth = 88;
  const gap = 10;

  // Left Box - Invoice Details
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, y, leftBoxWidth, boxHeight, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, y, leftBoxWidth, boxHeight, 'S');

  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE DETAILS', margin + 4, y + 7);

  pdf.setFontSize(8);
  let leftY = y + 14;

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Salesperson:', margin + 4, leftY);
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'bold');
  pdf.text(invoice.salespersonName, margin + 30, leftY);

  leftY += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Order Type:', margin + 4, leftY);
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'bold');
  pdf.text(invoice.orderType, margin + 30, leftY);

  if (invoice.deliveryDate) {
    leftY += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Delivery:', margin + 4, leftY);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'bold');
    pdf.text(new Date(invoice.deliveryDate).toLocaleDateString('en-IN'), margin + 30, leftY);
  }

  // Right Box - Customer Details
  const rightBoxX = margin + leftBoxWidth + gap;
  pdf.setFillColor(245, 245, 245);
  pdf.rect(rightBoxX, y, rightBoxWidth, boxHeight, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(rightBoxX, y, rightBoxWidth, boxHeight, 'S');

  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BILL TO', rightBoxX + 4, y + 7);

  // Status Badge
  const statusColors: Record<string, { bg: number[]; text: number[] }> = {
    'Paid': { bg: [220, 252, 231], text: [22, 101, 52] },
    'Partial': { bg: [254, 249, 195], text: [161, 98, 7] },
    'Pending': { bg: [254, 226, 226], text: [153, 27, 27] },
  };
  const statusColor = statusColors[invoice.paymentDetails.status] || statusColors['Pending'];
  pdf.setFillColor(statusColor.bg[0], statusColor.bg[1], statusColor.bg[2]);
  pdf.roundedRect(rightBoxX + rightBoxWidth - 26, y + 3, 22, 6, 1, 1, 'F');
  pdf.setTextColor(statusColor.text[0], statusColor.text[1], statusColor.text[2]);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text(invoice.paymentDetails.status, rightBoxX + rightBoxWidth - 15, y + 7.5, { align: 'center' });

  // Customer Name
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(invoice.customerDetails.name, rightBoxX + 4, y + 14);

  // Customer Address
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  const addressLines = pdf.splitTextToSize(invoice.customerDetails.address, rightBoxWidth - 8);
  pdf.text(addressLines.slice(0, 2), rightBoxX + 4, y + 20);

  // Customer Phone
  pdf.text(`Phone: ${invoice.customerDetails.mobileNumber}`, rightBoxX + 4, y + 28);

  y += boxHeight + 8;

  // ==========================================
  // SECTION 3: PRODUCTS TABLE
  // ==========================================

  // Table Header
  pdf.setFillColor(212, 175, 55);
  pdf.rect(margin, y, contentWidth, 8, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');

  // Column positions
  const cols = {
    sno: margin + 2,
    product: margin + 14,
    qty: margin + 75,
    rate: margin + 95,
    disc: margin + 120,
    gst: margin + 145,
    total: margin + 165,
  };

  pdf.text('No.', cols.sno, y + 5.5);
  pdf.text('Product Description', cols.product, y + 5.5);
  pdf.text('Qty', cols.qty, y + 5.5);
  pdf.text('Rate', cols.rate, y + 5.5);
  pdf.text('Discount', cols.disc, y + 5.5);
  pdf.text('GST', cols.gst, y + 5.5);
  pdf.text('Total', cols.total, y + 5.5);

  y += 8;

  // Table Rows
  const rowH = 10;
  invoice.products.forEach((product, index) => {
    const rowY = y + (index * rowH);

    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(252, 252, 252);
      pdf.rect(margin, rowY, contentWidth, rowH, 'F');
    }

    // Row border
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.2);
    pdf.line(margin, rowY + rowH, margin + contentWidth, rowY + rowH);

    pdf.setFontSize(8);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'normal');

    // Serial Number
    pdf.text(String(index + 1), cols.sno + 2, rowY + 5);

    // Product Name (with subtitle)
    const pName = product.name.length > 30 ? product.name.substring(0, 27) + '...' : product.name;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(40, 40, 40);
    pdf.text(pName, cols.product, rowY + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(130, 130, 130);
    const details = `${product.category} | ${product.material} | ${product.size}`;
    pdf.text(details.substring(0, 40), cols.product, rowY + 8);
    pdf.setFontSize(8);

    // Quantity
    pdf.setTextColor(60, 60, 60);
    pdf.text(String(product.quantity), cols.qty + 3, rowY + 5);

    // Rate
    pdf.text(product.rate.toLocaleString('en-IN'), cols.rate, rowY + 5);

    // Discount
    const discStr = product.discountType === 'percentage' ? `${product.discount}%` : `${product.discount}`;
    pdf.text(discStr, cols.disc, rowY + 5);

    // GST
    pdf.text(`${product.taxRate}%`, cols.gst + 2, rowY + 5);

    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(40, 40, 40);
    pdf.text(product.rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), cols.total, rowY + 5);
  });

  y += (invoice.products.length * rowH) + 4;

  // Table bottom border
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, margin + contentWidth, y);

  y += 8;

  // ==========================================
  // SECTION 4: AMOUNT IN WORDS & BILL SUMMARY
  // ==========================================
  const summaryWidth = 75;
  const summaryX = pageWidth - margin - summaryWidth;
  const amountBoxWidth = summaryX - margin - 6;

  // Amount in Words Box (Left)
  pdf.setFillColor(255, 251, 235);
  pdf.rect(margin, y, amountBoxWidth, 24, 'F');
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, y, amountBoxWidth, 24, 'S');

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(161, 98, 7);
  pdf.text('Amount in Words:', margin + 4, y + 7);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(45, 41, 38);
  const wordsLines = pdf.splitTextToSize(invoice.amountInWords || 'N/A', amountBoxWidth - 8);
  pdf.text(wordsLines.slice(0, 2), margin + 4, y + 14);

  // Bill Summary Box (Right)
  pdf.setFillColor(248, 250, 252);
  pdf.rect(summaryX, y, summaryWidth, 50, 'F');
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(summaryX, y, summaryWidth, 50, 'S');

  pdf.setFontSize(8);
  let sY = y + 8;

  // Subtotal
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Subtotal:', summaryX + 4, sY);
  pdf.setTextColor(40, 40, 40);
  pdf.text(formatCurrency(invoice.subtotal), summaryX + summaryWidth - 4, sY, { align: 'right' });

  // Discount
  sY += 7;
  pdf.setTextColor(100, 100, 100);
  pdf.text('Discount:', summaryX + 4, sY);
  pdf.setTextColor(220, 38, 38);
  pdf.text(`- ${formatCurrency(invoice.totalDiscount)}`, summaryX + summaryWidth - 4, sY, { align: 'right' });

  // GST
  sY += 7;
  pdf.setTextColor(100, 100, 100);
  pdf.text('GST:', summaryX + 4, sY);
  pdf.setTextColor(40, 40, 40);
  pdf.text(formatCurrency(invoice.gstAmount), summaryX + summaryWidth - 4, sY, { align: 'right' });

  // Transport
  if (invoice.transportCharges > 0) {
    sY += 7;
    pdf.setTextColor(100, 100, 100);
    pdf.text('Transport:', summaryX + 4, sY);
    pdf.setTextColor(40, 40, 40);
    pdf.text(formatCurrency(invoice.transportCharges), summaryX + summaryWidth - 4, sY, { align: 'right' });
  }

  // Grand Total Line
  sY += 10;
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.5);
  pdf.line(summaryX + 2, sY - 3, summaryX + summaryWidth - 2, sY - 3);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(45, 41, 38);
  pdf.text('Grand Total:', summaryX + 4, sY + 2);
  pdf.setTextColor(212, 175, 55);
  pdf.text(formatCurrency(invoice.grandTotal), summaryX + summaryWidth - 4, sY + 2, { align: 'right' });

  y += 58;

  // ==========================================
  // SECTION 5: PAYMENT DETAILS & TERMS
  // ==========================================
  const payBoxWidth = (contentWidth - 8) / 2;

  // Payment Details Box
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, y, payBoxWidth, 30, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(margin, y, payBoxWidth, 30, 'S');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(60, 60, 60);
  pdf.text('PAYMENT DETAILS', margin + 4, y + 7);

  pdf.setFontSize(7);
  let pY = y + 13;

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Payment Mode:', margin + 4, pY);
  pdf.setTextColor(40, 40, 40);
  pdf.setFont('helvetica', 'bold');
  pdf.text(invoice.paymentDetails.mode, margin + 32, pY);

  pY += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Advance Paid:', margin + 4, pY);
  pdf.setTextColor(22, 163, 74);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatCurrency(invoice.paymentDetails.advancePaid), margin + 32, pY);

  pY += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Balance Due:', margin + 4, pY);
  pdf.setTextColor(220, 38, 38);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatCurrency(invoice.paymentDetails.balanceAmount), margin + 32, pY);

  // Terms & Conditions Box
  const termsX = margin + payBoxWidth + 8;
  pdf.setFillColor(245, 245, 245);
  pdf.rect(termsX, y, payBoxWidth, 30, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(termsX, y, payBoxWidth, 30, 'S');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(60, 60, 60);
  pdf.text('TERMS & CONDITIONS', termsX + 4, y + 7);

  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  const terms = [
    '1. Payment due within 30 days of invoice date',
    '2. Goods once sold will not be taken back',
    '3. Warranty as per company policy',
    '4. Subject to local jurisdiction only',
  ];
  terms.forEach((term, i) => {
    pdf.text(term, termsX + 4, y + 13 + (i * 4.5));
  });

  // ==========================================
  // SECTION 6: FOOTER (Stamp & Signature)
  // ==========================================
  const footerY = pageHeight - 32;

  // Separator Line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  // Company Stamp Box
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  pdf.rect(margin + 5, footerY, 38, 18, 'S');
  pdf.setFontSize(6);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Company Stamp', margin + 24, footerY + 22, { align: 'center' });

  // Authorized Signatory
  const sigX = pageWidth - margin - 45;
  pdf.line(sigX, footerY + 14, sigX + 40, footerY + 14);
  pdf.setFontSize(6);
  pdf.text('Authorized Signatory', sigX + 20, footerY + 19, { align: 'center' });

  // Footer Note
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(150, 150, 150);
  pdf.text('This is a computer-generated invoice and does not require a physical signature. Thank you for your business!', pageWidth / 2, pageHeight - 6, { align: 'center' });

  return pdf.output('blob');
};

// ============================================
// DOWNLOAD INVOICE PDF (Direct Generation)
// ============================================
export const downloadInvoicePDFDirect = async (
  invoice: Invoice,
  downloadedBy: string = 'Admin'
): Promise<boolean> => {
  try {
    const blob = await generateInvoicePDF(invoice);
    const fileName = generateFileName.invoice(invoice.invoiceNumber, invoice.customerDetails.name);
    downloadPDFBlob(blob, fileName);
    logPDFDownload({ documentType: 'Invoice', fileName, downloadedAt: new Date().toISOString(), downloadedBy, success: true });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPDFDownload({
      documentType: 'Invoice',
      fileName: `Invoice_${invoice.invoiceNumber}.pdf`,
      downloadedAt: new Date().toISOString(),
      downloadedBy,
      success: false,
      errorMessage,
    });
    throw error;
  }
};

export default {
  generatePDFFromElement,
  downloadPDFBlob,
  downloadPDFDocument,
  downloadPayslipPDF,
  downloadInvoicePDF,
  downloadInvoicePDFDirect,
  generateInvoicePDF,
  downloadPaymentReceiptPDF,
  downloadReportPDF,
  downloadStockReportPDF,
  downloadLeaveReportPDF,
  generateFileName,
  logPDFDownload,
  getDownloadLogs,
  PDF_CONFIG,
};


// ============================================
// PAYMENT STATEMENT PDF GENERATION (Customer & Supplier)
// ============================================
export interface PaymentStatementData {
  id: string;
  type: 'customer' | 'supplier';
  // Common fields
  partyName: string;
  partyPhone: string;
  referenceNumber: string; // Invoice number or Bill number
  productOrMaterialType: string;
  orderOrPurchaseDate: string;
  paymentDate: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'partial' | 'pending';
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  // Payment history
  paymentHistory: Array<{
    date: string;
    amount: number;
    method: string;
    reference: string;
    notes: string;
  }>;
}

export const generatePaymentStatementPDF = async (data: PaymentStatementData): Promise<Blob> => {
  const companyHeader = getPayslipHeader();
  const authDetails = getAuthorizationDetails();
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = 0;

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isCustomer = data.type === 'customer';
  const modeLabels: Record<string, string> = {
    cash: 'Cash', card: 'Card', bank_transfer: 'Bank Transfer',
    upi: 'UPI', cheque: 'Cheque', online: 'Online', bank: 'Bank'
  };

  // ==========================================
  // SECTION 1: HEADER (Dark Background)
  // ==========================================
  pdf.setFillColor(45, 41, 38);
  pdf.rect(0, 0, pageWidth, 42, 'F');

  // Company Name (Gold)
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companyHeader.companyName, margin, 16);

  // Tagline
  pdf.setTextColor(180, 180, 180);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text(companyHeader.tagline, margin, 23);

  // Company Address & Contact (White)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(companyHeader.address, margin, 30);
  pdf.text(`Phone: ${companyHeader.phone}  |  Email: ${companyHeader.email}`, margin, 36);

  // Document Title (Right Side)
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PAYMENT STATEMENT', pageWidth - margin, 16, { align: 'right' });

  // Receipt Number & Date
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Receipt #: ${data.id.substring(0, 8).toUpperCase()}`, pageWidth - margin, 26, { align: 'right' });
  pdf.text(`Date: ${formatDate(new Date().toISOString().split('T')[0])}`, pageWidth - margin, 33, { align: 'right' });

  y = 52;

  // ==========================================
  // SECTION 2: PARTY DETAILS (Two Column Layout)
  // ==========================================
  const boxHeight = 38;
  const leftBoxWidth = 90;
  const rightBoxWidth = 90;
  const gap = 6;

  // Left Box - Party Details
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin, y, leftBoxWidth, boxHeight, 'F');
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, margin + 3, y);
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.2);
  pdf.rect(margin, y, leftBoxWidth, boxHeight, 'S');

  pdf.setTextColor(45, 41, 38);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(isCustomer ? 'CUSTOMER DETAILS' : 'SUPPLIER DETAILS', margin + 5, y + 8);

  let leftY = y + 16;
  pdf.setFontSize(8);

  // Party Name
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Name:', margin + 5, leftY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.partyName, margin + 22, leftY);

  // Phone
  leftY += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Phone:', margin + 5, leftY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.partyPhone || 'N/A', margin + 22, leftY);

  // Reference Number
  leftY += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(isCustomer ? 'Invoice #:' : 'Bill #:', margin + 5, leftY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.referenceNumber || 'N/A', margin + 22, leftY);

  // Right Box - Transaction Details
  const rightBoxX = margin + leftBoxWidth + gap;
  pdf.setFillColor(250, 250, 250);
  pdf.rect(rightBoxX, y, rightBoxWidth, boxHeight, 'F');
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.5);
  pdf.line(rightBoxX, y, rightBoxX + 3, y);
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.2);
  pdf.rect(rightBoxX, y, rightBoxWidth, boxHeight, 'S');

  pdf.setTextColor(45, 41, 38);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TRANSACTION DETAILS', rightBoxX + 5, y + 8);

  // Status Badge
  const statusColors: Record<string, { bg: number[]; text: number[] }> = {
    'paid': { bg: [220, 252, 231], text: [22, 101, 52] },
    'partial': { bg: [254, 249, 195], text: [161, 98, 7] },
    'pending': { bg: [254, 226, 226], text: [153, 27, 27] },
  };
  const statusColor = statusColors[data.paymentStatus] || statusColors['pending'];
  const statusLabel = data.paymentStatus === 'paid' ? 'PAID' : data.paymentStatus === 'partial' ? 'PARTIAL' : 'PENDING';

  pdf.setFillColor(statusColor.bg[0], statusColor.bg[1], statusColor.bg[2]);
  pdf.roundedRect(rightBoxX + rightBoxWidth - 28, y + 4, 24, 7, 2, 2, 'F');
  pdf.setTextColor(statusColor.text[0], statusColor.text[1], statusColor.text[2]);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text(statusLabel, rightBoxX + rightBoxWidth - 16, y + 9, { align: 'center' });

  let rightY = y + 16;
  pdf.setFontSize(8);

  // Product/Material Type
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(isCustomer ? 'Product:' : 'Material:', rightBoxX + 5, rightY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(data.productOrMaterialType || 'N/A', rightBoxX + 28, rightY);

  // Order/Purchase Date
  rightY += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(isCustomer ? 'Order Date:' : 'Purchase:', rightBoxX + 5, rightY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(formatDate(data.orderOrPurchaseDate), rightBoxX + 28, rightY);

  // Payment Method
  rightY += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Pay Mode:', rightBoxX + 5, rightY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(40, 40, 40);
  pdf.text(modeLabels[data.paymentMethod] || data.paymentMethod, rightBoxX + 28, rightY);

  y += boxHeight + 10;

  // ==========================================
  // SECTION 3: AMOUNT SUMMARY (Three Boxes)
  // ==========================================
  pdf.setFillColor(250, 250, 250);
  pdf.rect(margin, y, contentWidth, 10, 'F');
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, margin + 3, y);
  pdf.setTextColor(45, 41, 38);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AMOUNT SUMMARY', margin + 5, y + 7);

  y += 14;

  const amountBoxWidth = (contentWidth - 12) / 3;
  const amountBoxHeight = 32;

  // Total Amount Box
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, amountBoxWidth, amountBoxHeight, 3, 3, 'FD');

  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Total Amount', margin + amountBoxWidth / 2, y + 10, { align: 'center' });

  pdf.setTextColor(45, 41, 38);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatCurrency(data.totalAmount), margin + amountBoxWidth / 2, y + 24, { align: 'center' });

  // Paid Amount Box
  pdf.setFillColor(220, 252, 231);
  pdf.setDrawColor(34, 197, 94);
  pdf.roundedRect(margin + amountBoxWidth + 6, y, amountBoxWidth, amountBoxHeight, 3, 3, 'FD');

  pdf.setTextColor(22, 101, 52);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Amount Paid', margin + amountBoxWidth + 6 + amountBoxWidth / 2, y + 10, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatCurrency(data.paidAmount), margin + amountBoxWidth + 6 + amountBoxWidth / 2, y + 24, { align: 'center' });

  // Pending Amount Box
  pdf.setFillColor(254, 226, 226);
  pdf.setDrawColor(239, 68, 68);
  pdf.roundedRect(margin + (amountBoxWidth + 6) * 2, y, amountBoxWidth, amountBoxHeight, 3, 3, 'FD');

  pdf.setTextColor(153, 27, 27);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Balance Due', margin + (amountBoxWidth + 6) * 2 + amountBoxWidth / 2, y + 10, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatCurrency(data.pendingAmount), margin + (amountBoxWidth + 6) * 2 + amountBoxWidth / 2, y + 24, { align: 'center' });

  y += amountBoxHeight + 8;

  // Progress Bar
  const progressWidth = contentWidth;
  const progressHeight = 10;
  const paidPercentage = data.totalAmount > 0 ? Math.min((data.paidAmount / data.totalAmount) * 100, 100) : 0;

  pdf.setFillColor(229, 231, 235);
  pdf.roundedRect(margin, y, progressWidth, progressHeight, 3, 3, 'F');

  if (paidPercentage > 0) {
    const progressColor = data.paymentStatus === 'paid' ? [34, 197, 94] : data.paymentStatus === 'partial' ? [234, 179, 8] : [239, 68, 68];
    pdf.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
    const filledWidth = Math.max((progressWidth * paidPercentage) / 100, 6);
    pdf.roundedRect(margin, y, filledWidth, progressHeight, 3, 3, 'F');
  }

  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${paidPercentage.toFixed(1)}% Paid`, margin + progressWidth / 2, y + 7, { align: 'center' });

  y += progressHeight + 10;

  // ==========================================
  // SECTION 4: STATUS BANNER
  // ==========================================
  const bannerText = data.paymentStatus === 'paid' ? 'PAYMENT COMPLETE' : data.paymentStatus === 'partial' ? 'PARTIALLY PAID' : 'PAYMENT PENDING';
  const bannerColor = data.paymentStatus === 'paid' ? [34, 197, 94] : data.paymentStatus === 'partial' ? [234, 179, 8] : [239, 68, 68];

  pdf.setFillColor(bannerColor[0], bannerColor[1], bannerColor[2]);
  pdf.roundedRect(margin, y, contentWidth, 14, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(bannerText, pageWidth / 2, y + 9.5, { align: 'center' });

  y += 22;

  // ==========================================
  // SECTION 5: PAYMENT HISTORY TABLE
  // ==========================================
  if (data.paymentHistory && data.paymentHistory.length > 0) {
    pdf.setFillColor(250, 250, 250);
    pdf.rect(margin, y, contentWidth, 10, 'F');
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, margin + 3, y);
    pdf.setTextColor(45, 41, 38);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT HISTORY', margin + 5, y + 7);

    y += 14;

    // Table Header
    const colWidths = [30, 40, 35, 40, 41];
    const tableWidth = contentWidth;

    pdf.setFillColor(45, 41, 38);
    pdf.rect(margin, y, tableWidth, 9, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');

    let colX = margin + 3;
    pdf.text('Date', colX, y + 6);
    colX += colWidths[0];
    pdf.text('Amount', colX, y + 6);
    colX += colWidths[1];
    pdf.text('Method', colX, y + 6);
    colX += colWidths[2];
    pdf.text('Reference', colX, y + 6);
    colX += colWidths[3];
    pdf.text('Notes', colX, y + 6);

    y += 9;

    // Table Rows
    data.paymentHistory.forEach((h, index) => {
      // Check for page break
      if (y > pageHeight - 50) {
        pdf.addPage();
        y = 20;
      }

      const rowBg = index % 2 === 0 ? [255, 255, 255] : [250, 250, 250];
      pdf.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
      pdf.rect(margin, y, tableWidth, 9, 'F');

      pdf.setFontSize(7);
      colX = margin + 3;

      // Date
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(h.date), colX, y + 6);
      colX += colWidths[0];

      // Amount
      pdf.setTextColor(22, 101, 52);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(h.amount), colX, y + 6);
      colX += colWidths[1];

      // Method
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'normal');
      pdf.text(modeLabels[h.method] || h.method, colX, y + 6);
      colX += colWidths[2];

      // Reference
      pdf.text((h.reference || '-').substring(0, 15), colX, y + 6);
      colX += colWidths[3];

      // Notes
      pdf.text((h.notes || '-').substring(0, 18), colX, y + 6);

      y += 9;
    });

    // Table Border
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, y - (data.paymentHistory.length * 9) - 9, tableWidth, (data.paymentHistory.length + 1) * 9, 'S');

    y += 8;
  }

  // ==========================================
  // SECTION 6: FOOTER
  // ==========================================
  const footerY = Math.max(y + 10, pageHeight - 45);

  // Separator Line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  // Terms
  let termsY = footerY + 6;
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Terms & Conditions:', margin, termsY);

  termsY += 4;
  pdf.setFont('helvetica', 'normal');
  pdf.text('• This is a computer-generated payment statement and does not require a signature.', margin, termsY);
  termsY += 3;
  pdf.text('• Please retain this document for your records.', margin, termsY);
  termsY += 3;
  pdf.text('• For any queries, please contact us at the above address.', margin, termsY);

  // Company Stamp Box
  const stampY = footerY + 5;
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  pdf.rect(margin + 5, stampY, 38, 18, 'S');
  pdf.setFontSize(6);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Company Stamp', margin + 24, stampY + 22, { align: 'center' });

  // Authorized Signatory
  const sigX = pageWidth - margin - 45;
  pdf.line(sigX, stampY + 14, sigX + 40, stampY + 14);
  pdf.text('Authorized Signatory', sigX + 20, stampY + 19, { align: 'center' });

  // Generation timestamp
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(6);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Thank you message
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Thank you for your business with ${companyHeader.companyName}!`, pageWidth / 2, pageHeight - 5, { align: 'center' });

  return pdf.output('blob');
};

// ============================================
// DOWNLOAD PAYMENT STATEMENT PDF
// ============================================
export const downloadPaymentStatementPDF = async (
  data: PaymentStatementData,
  downloadedBy: string = 'Admin'
): Promise<boolean> => {
  try {
    const blob = await generatePaymentStatementPDF(data);
    const fileName = generateFileName.paymentReceipt(data.id.substring(0, 8).toUpperCase(), data.partyName);
    downloadPDFBlob(blob, fileName);
    logPDFDownload({ documentType: 'Payment Statement', fileName, downloadedAt: new Date().toISOString(), downloadedBy, success: true });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPDFDownload({
      documentType: 'Payment Statement',
      fileName: `Payment_${data.partyName}.pdf`,
      downloadedAt: new Date().toISOString(),
      downloadedBy,
      success: false,
      errorMessage,
    });
    throw error;
  }
};
