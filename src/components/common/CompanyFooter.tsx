"use client";

import React from 'react';
import { COMPANY_CONFIG, getCompanyFooter, getCopyright } from '@/lib/companyConfig';

interface CompanyFooterProps {
  variant?: 'full' | 'compact' | 'document';
  showEstablished?: boolean;
  showOwner?: boolean;
  className?: string;
}

export default function CompanyFooter({
  variant = 'full',
  showEstablished = true,
  showOwner = true,
  className = '',
}: CompanyFooterProps) {
  const { name, business, owner, branding } = COMPANY_CONFIG;

  if (variant === 'document') {
    return (
      <div className={`text-center text-sm text-gray-500 py-4 border-t ${className}`}>
        <p>{getCompanyFooter()}</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`text-center text-xs text-gray-400 ${className}`}>
        <p>{getCopyright()}</p>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-gray-100 py-4 px-6 text-center ${className}`}>
      <p className="text-sm text-gray-600">
        {getCopyright()}
      </p>
      <div className="flex justify-center items-center gap-4 mt-2 text-xs text-gray-500">
        {showEstablished && (
          <span>Established: {business.startDate}</span>
        )}
        {showOwner && (
          <>
            <span>•</span>
            <span>Owner: {owner.name}</span>
          </>
        )}
      </div>
    </div>
  );
}
