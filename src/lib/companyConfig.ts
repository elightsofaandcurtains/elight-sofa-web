/**
 * GLOBAL COMPANY DETAILS CONFIGURATION
 * Single Source of Truth for all company information
 * 
 * This configuration is automatically applied across:
 * - Employee Payslips
 * - Customer Invoices
 * - Supplier Purchase Bills
 * - Salary Slips
 * - Stock & Payment Reports
 * - PDF & Print layouts
 * - Email templates
 * - System headers & footers
 */

export interface CompanyConfig {
  // Basic Information
  name: string;
  tagline: string;

  // Address
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    full: string;
  };

  // Contact Information
  contact: {
    emails: string[];
    primaryEmail: string;
    phone: string;
    alternatePhone?: string;
  };

  // Owner Information
  owner: {
    name: string;
    designation: string;
  };

  // Business Information
  business: {
    startDate: string;
    establishedYear: number;
    gstNumber?: string;
    panNumber?: string;
  };

  // Branding
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };

  // Document Authorization (for payslips, invoices, etc.)
  authorization: {
    companyStamp?: string; // URL/path to company stamp image
    authorizedSignature?: string; // URL/path to authorized signature image
    authorizedSignatory: string; // Name of authorized signatory
  };
}

// ============================================
// COMPANY DETAILS - SINGLE SOURCE OF TRUTH
// ============================================
export const COMPANY_CONFIG: CompanyConfig = {
  // Basic Information
  name: "Elight Sofa House",
  tagline: "Premium Furniture & Interior Solutions",

  // Address
  address: {
    line1: "1/2, Shanti and Soc",
    line2: "Dabholi Rd, Katargam",
    city: "Surat",
    state: "Gujarat",
    pincode: "395004",
    get full() {
      return `${this.line1}, ${this.line2}, ${this.city}, ${this.state} ${this.pincode}`;
    }
  },

  // Contact Information
  contact: {
    emails: [
      "elightsofaandcurtains@gmail.com",
      "sabhadiyaravi2@gmail.com"
    ],
    primaryEmail: "elightsofaandcurtains@gmail.com",
    phone: "+91 9714392926",
  },

  // Owner Information
  owner: {
    name: "Ravi D Sabhadiya",
    designation: "Proprietor"
  },

  // Business Information
  business: {
    startDate: "01-05-2015",
    establishedYear: 2015,
    gstNumber: "", // Add GST number when available
    panNumber: "", // Add PAN number when available
  },

  // Branding
  branding: {
    logo: undefined, // Add logo path when available
    primaryColor: "#2D2926",
    secondaryColor: "#4A4543",
    accentColor: "#D4AF37", // Gold accent
  },

  // Document Authorization
  authorization: {
    companyStamp: undefined, // Add company stamp image path when available
    authorizedSignature: undefined, // Add signature image path when available
    authorizedSignatory: "Ravi D Sabhadiya",
  }
};

// ============================================
// HELPER FUNCTIONS FOR FORMATTED OUTPUT
// ============================================

/**
 * Get formatted company header for documents
 */
export function getCompanyHeader(): {
  name: string;
  tagline: string;
  address: string;
  email: string;
  phone: string;
} {
  return {
    name: COMPANY_CONFIG.name,
    tagline: COMPANY_CONFIG.tagline,
    address: COMPANY_CONFIG.address.full,
    email: COMPANY_CONFIG.contact.primaryEmail,
    phone: COMPANY_CONFIG.contact.phone,
  };
}

/**
 * Get formatted company footer for documents
 */
export function getCompanyFooter(): string {
  return `© ${COMPANY_CONFIG.name} | Established: ${COMPANY_CONFIG.business.startDate} | Owner: ${COMPANY_CONFIG.owner.name}`;
}

/**
 * Get copyright text
 */
export function getCopyright(year?: number): string {
  const currentYear = year || new Date().getFullYear();
  return `© ${currentYear} ${COMPANY_CONFIG.name}. All rights reserved.`;
}

/**
 * Get formatted address for display
 */
export function getFormattedAddress(multiLine: boolean = false): string {
  const { address } = COMPANY_CONFIG;
  if (multiLine) {
    return `${address.line1}\n${address.line2}\n${address.city}, ${address.state} ${address.pincode}`;
  }
  return address.full;
}

/**
 * Get all contact emails formatted
 */
export function getContactEmails(separator: string = ", "): string {
  return COMPANY_CONFIG.contact.emails.join(separator);
}

/**
 * Get company details for invoice/bill header
 */
export function getInvoiceCompanyDetails() {
  return {
    logo: COMPANY_CONFIG.branding.logo,
    name: COMPANY_CONFIG.name,
    address: COMPANY_CONFIG.address.full,
    contactNumber: COMPANY_CONFIG.contact.phone,
    email: COMPANY_CONFIG.contact.primaryEmail,
    gstNumber: COMPANY_CONFIG.business.gstNumber || "",
  };
}

/**
 * Get company details for payslip header
 */
export function getPayslipHeader() {
  return {
    companyName: COMPANY_CONFIG.name,
    tagline: COMPANY_CONFIG.tagline,
    address: COMPANY_CONFIG.address.full,
    email: COMPANY_CONFIG.contact.primaryEmail,
    phone: COMPANY_CONFIG.contact.phone,
  };
}

/**
 * Get company details for email templates
 */
export function getEmailSignature(): string {
  return `
${COMPANY_CONFIG.name}
${COMPANY_CONFIG.address.full}
📧 ${COMPANY_CONFIG.contact.primaryEmail}
📞 ${COMPANY_CONFIG.contact.phone}
  `.trim();
}

/**
 * Get company details for PDF footer
 */
export function getPDFFooter(): {
  copyright: string;
  established: string;
  owner: string;
} {
  return {
    copyright: getCopyright(),
    established: `Established: ${COMPANY_CONFIG.business.startDate}`,
    owner: `Owner: ${COMPANY_CONFIG.owner.name}`,
  };
}

/**
 * Get authorization details for payslip/invoice footer
 */
export function getAuthorizationDetails(): {
  companyStamp: string | undefined;
  authorizedSignature: string | undefined;
  authorizedSignatory: string;
  companyName: string;
} {
  return {
    companyStamp: COMPANY_CONFIG.authorization.companyStamp,
    authorizedSignature: COMPANY_CONFIG.authorization.authorizedSignature,
    authorizedSignatory: COMPANY_CONFIG.authorization.authorizedSignatory,
    companyName: COMPANY_CONFIG.name,
  };
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indian)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate that start date is not in the future
 */
export function isValidStartDate(dateStr: string): boolean {
  const [day, month, year] = dateStr.split('-').map(Number);
  const startDate = new Date(year, month - 1, day);
  return startDate <= new Date();
}

// Export default config for convenience
export default COMPANY_CONFIG;
