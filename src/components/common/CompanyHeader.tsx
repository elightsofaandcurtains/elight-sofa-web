"use client";

import React from 'react';
import { COMPANY_CONFIG } from '@/lib/companyConfig';

interface CompanyHeaderProps {
  variant?: 'full' | 'compact' | 'minimal';
  showLogo?: boolean;
  showTagline?: boolean;
  showContact?: boolean;
  className?: string;
}

export default function CompanyHeader({
  variant = 'full',
  showLogo = true,
  showTagline = true,
  showContact = true,
  className = '',
}: CompanyHeaderProps) {
  const { name, tagline, address, contact, branding } = COMPANY_CONFIG;

  if (variant === 'minimal') {
    return (
      <div className={`text-center ${className}`}>
        <h1 className="text-xl font-bold" style={{ color: branding.primaryColor }}>
          {name}
        </h1>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        <h1 className="text-lg font-bold" style={{ color: branding.primaryColor }}>
          🛋️ {name}
        </h1>
        <p className="text-sm text-gray-600">{address.full}</p>
        {showContact && (
          <p className="text-sm text-gray-600">
            📧 {contact.primaryEmail} | 📞 {contact.phone}
          </p>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div 
      className={`p-6 rounded-lg ${className}`}
      style={{ 
        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
        color: 'white'
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          {showLogo && (
            <h1 className="text-2xl font-bold mb-1" style={{ color: branding.accentColor }}>
              🛋️ {name}
            </h1>
          )}
          {showTagline && (
            <p className="text-sm opacity-90">{tagline}</p>
          )}
          <p className="text-sm mt-2 opacity-90">{address.full}</p>
          {showContact && (
            <div className="text-sm mt-1 opacity-90">
              <span>📧 {contact.primaryEmail}</span>
              <span className="mx-2">|</span>
              <span>📞 {contact.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
