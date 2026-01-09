# 📄 PDF Document Download Standard - Elight Sofa House

## Overview

This document outlines the global PDF-only download standard implemented across the Elight Sofa House system. All generated documents are downloaded exclusively in `.pdf` format.

---

## 🎯 Scope of Documents (MANDATORY)

The following documents are enforced to download as PDF files only:

| Document Type | File Naming Convention |
|--------------|------------------------|
| Employee Payslips | `Payslip_<EmployeeName>_<Month>_<Year>.pdf` |
| Customer Bills/Invoices | `Invoice_<InvoiceNumber>_<CustomerName>.pdf` |
| Supplier Purchase Bills | `SupplierBill_<BillNumber>_<SupplierName>.pdf` |
| Payment Receipts | `Receipt_<ReceiptNumber>_<PartyName>.pdf` |
| Stock Reports | `StockReport_<Category>_<Date>.pdf` |
| Leave Reports | `LeaveReport_<EmployeeName>_<Period>.pdf` |
| General Reports | `Report_<ReportType>_<Date>.pdf` |

---

## 📥 Download Behavior

### On Any Download Action:
- ✅ Generate document in PDF format ONLY
- ✅ Automatically trigger download
- ❌ No format selection (no Excel/Word/Image options)
- ❌ No preview required unless explicitly enabled

---

## ⚙️ System Rules

| Rule | Implementation |
|------|----------------|
| File Extension | `.pdf` is forced on all downloads |
| MIME Type | `application/pdf` |
| Failure Handling | Block downloads if PDF generation fails |
| Generation Method | Client-side using jsPDF + html2canvas |

---

## 🎨 PDF Quality Standards

- **Page Size**: A4 (210mm × 297mm)
- **Margins**: 15mm on all sides
- **Resolution**: 2x scale for crisp text
- **Background**: White (#ffffff)
- **Company Branding**: Logo, stamp, signature placeholders
- **Output**: Print-ready quality

---

## 🛡️ Security & Validation

- **Admin-only access** for financial documents
- **Audit logging** for each download (document type, filename, timestamp, user)
- **Error logging** for failed generation attempts

---

## 📁 File Structure

```
src/lib/
├── pdfService.ts      # Master PDF generation service
├── pdfUtils.ts        # Invoice & document PDF utilities
├── payslipUtils.ts    # Payslip-specific utilities
└── companyConfig.ts   # Company branding configuration
```

---

## 🔧 Usage Examples

### Download Payslip PDF
```typescript
import { downloadPayslipPDF, PayslipData } from '@/lib/pdfService';

const payslipData: PayslipData = {
  employee,
  leaves,
  commissions,
  deductionRecords,
  month: selectedMonth,
  year: selectedYear,
};

await downloadPayslipPDF(payslipData, 'Admin');
```

### Download Invoice PDF
```typescript
import { downloadPDF } from '@/lib/pdfUtils';

await downloadPDF(invoice, 'invoice-content');
```

### Download Generic Report PDF
```typescript
import { downloadReportPDF } from '@/lib/pdfService';

await downloadReportPDF('Stock Summary', 'report-element-id', 'Admin', 'landscape');
```

---

## 📋 API Reference

### `pdfService.ts` Functions

| Function | Description |
|----------|-------------|
| `generatePDFFromElement()` | Generate PDF from DOM element |
| `downloadPDFBlob()` | Download a PDF blob with proper filename |
| `downloadPDFDocument()` | Unified PDF download with audit logging |
| `downloadPayslipPDF()` | Generate and download employee payslip |
| `downloadInvoicePDF()` | Generate and download customer invoice |
| `downloadPaymentReceiptPDF()` | Generate and download payment receipt |
| `downloadReportPDF()` | Generate and download generic report |
| `downloadStockReportPDF()` | Generate and download stock report |
| `downloadLeaveReportPDF()` | Generate and download leave report |
| `generateFileName.*` | Standardized filename generators |
| `logPDFDownload()` | Audit log for downloads |
| `getDownloadLogs()` | Retrieve download audit logs |

---

## 🔮 Optional Enhancements (Future)

- [ ] Auto-email PDF after download
- [ ] Watermark for internal documents
- [ ] Digital signature integration
- [ ] PDF password protection
- [ ] Batch PDF generation

---

## 📝 Notes

- All PDF generation uses `jsPDF` library for direct PDF creation
- `html2canvas` is used for capturing complex HTML layouts
- Company branding is centralized in `companyConfig.ts`
- File naming follows strict conventions for consistency

---

*Last Updated: January 2026*
