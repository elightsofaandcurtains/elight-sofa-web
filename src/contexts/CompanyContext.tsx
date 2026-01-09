"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { COMPANY_CONFIG, CompanyConfig, getCompanyHeader, getCompanyFooter, getCopyright, getInvoiceCompanyDetails, getPayslipHeader, getEmailSignature, getPDFFooter, getFormattedAddress, getContactEmails } from '@/lib/companyConfig';

interface CompanyContextType {
  config: CompanyConfig;
  header: ReturnType<typeof getCompanyHeader>;
  footer: string;
  copyright: string;
  invoiceDetails: ReturnType<typeof getInvoiceCompanyDetails>;
  payslipHeader: ReturnType<typeof getPayslipHeader>;
  emailSignature: string;
  pdfFooter: ReturnType<typeof getPDFFooter>;
  getAddress: (multiLine?: boolean) => string;
  getEmails: (separator?: string) => string;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const value: CompanyContextType = {
    config: COMPANY_CONFIG,
    header: getCompanyHeader(),
    footer: getCompanyFooter(),
    copyright: getCopyright(),
    invoiceDetails: getInvoiceCompanyDetails(),
    payslipHeader: getPayslipHeader(),
    emailSignature: getEmailSignature(),
    pdfFooter: getPDFFooter(),
    getAddress: getFormattedAddress,
    getEmails: getContactEmails,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany(): CompanyContextType {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

// Export a hook for getting specific company details
export function useCompanyConfig(): CompanyConfig {
  const { config } = useCompany();
  return config;
}

export function useCompanyHeader() {
  const { header } = useCompany();
  return header;
}

export function useCompanyFooter() {
  const { footer, copyright, pdfFooter } = useCompany();
  return { footer, copyright, pdfFooter };
}

export function useInvoiceCompanyDetails() {
  const { invoiceDetails } = useCompany();
  return invoiceDetails;
}

export default CompanyContext;
