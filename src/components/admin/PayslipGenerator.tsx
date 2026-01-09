"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Download, Calendar, Building2, User, DollarSign, Loader2 } from "lucide-react";
import { Employee, EmployeeLeave, EmployeeCommission, LeaveDeductionRecord } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { COMPANY_CONFIG } from "@/lib/companyConfig";
import { downloadPayslipPDF, PayslipData } from "@/lib/pdfService";

interface PayslipGeneratorProps {
  isOpen: boolean;
  employee: Employee;
  leaves: EmployeeLeave[];
  commissions: EmployeeCommission[];
  deductionRecords: LeaveDeductionRecord[];
  onClose: () => void;
  onGenerated: () => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayslipGenerator({ isOpen, employee, leaves, commissions, deductionRecords, onClose, onGenerated }: PayslipGeneratorProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const workingDays = employee.workingDaysPerMonth || 26;
  const baseSalary = employee.salary;
  const isPerDaySalaryType = employee.salaryType === 'per_day';
  const customPerDaySalary = employee.customPerDaySalary || 0;
  const calculatedPerDaySalary = baseSalary / workingDays;
  const effectivePerDaySalary = isPerDaySalaryType && customPerDaySalary > 0 ? customPerDaySalary : calculatedPerDaySalary;

  // Get deduction record
  const deductionRecord = deductionRecords.find(r => r.employeeId === employee.id && r.month === selectedMonth && r.year === selectedYear);
  const isDeductionApplied = deductionRecord?.isDeductionApplied || false;
  const isAutoMode = deductionRecord?.deductionMode === 'automatic';

  // Filter leaves for selected month
  const monthLeaves = leaves.filter(l => {
    if (l.employeeId !== employee.id || l.status !== 'approved') return false;
    const leaveDate = new Date(l.fromDate);
    return leaveDate.getMonth() === selectedMonth && leaveDate.getFullYear() === selectedYear;
  });

  // Calculate leave days
  const paidLeaveDays = monthLeaves.filter(l => ['paid', 'sick', 'casual'].includes(l.leaveType)).reduce((sum, l) => sum + l.totalDays, 0);
  const unpaidLeaveDays = monthLeaves.filter(l => l.leaveType === 'unpaid').reduce((sum, l) => sum + l.totalDays, 0);
  const halfDayLeaveDays = monthLeaves.filter(l => l.leaveType === 'half_day').reduce((sum, l) => sum + l.totalDays, 0);

  // Calculate deductions
  const unpaidDeduction = unpaidLeaveDays * effectivePerDaySalary;
  const halfDayDeduction = halfDayLeaveDays * (effectivePerDaySalary * 0.5);
  const totalDeduction = unpaidDeduction + halfDayDeduction;
  const actualDeduction = (isAutoMode || isDeductionApplied) ? totalDeduction : 0;

  // Filter commissions
  const monthCommissions = commissions.filter(c => {
    if (c.employeeId !== employee.id) return false;
    const commDate = new Date(c.commissionDate);
    return commDate.getMonth() === selectedMonth && commDate.getFullYear() === selectedYear;
  });
  const totalCommission = monthCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  // Calculate net salary
  const effectiveBaseSalary = isPerDaySalaryType 
    ? effectivePerDaySalary * (workingDays - (isAutoMode || isDeductionApplied ? unpaidLeaveDays + (halfDayLeaveDays * 0.5) : 0))
    : baseSalary;
  
  const netSalary = isPerDaySalaryType 
    ? effectiveBaseSalary + totalCommission
    : baseSalary - actualDeduction + totalCommission;

  const generatePayslipPDFHandler = async () => {
    setIsGenerating(true);
    
    try {
      // Prepare payslip data for PDF generation
      const payslipData: PayslipData = {
        employee,
        leaves,
        commissions,
        deductionRecords,
        month: selectedMonth,
        year: selectedYear,
      };
      
      // Generate and download PDF using the centralized PDF service
      await downloadPayslipPDF(payslipData, 'Admin');
      
      onGenerated();
    } catch (error) {
      console.error('Failed to generate payslip PDF:', error);
      alert('Failed to generate payslip. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generate Payslip</h2>
                <p className="text-white/70 text-sm">{employee.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Employee Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                  <User size={24} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2926]">{employee.name}</h3>
                  <p className="text-sm text-gray-600">{employee.position} • <span className="capitalize">{employee.department}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Employee ID:</span>
                  <span className="ml-2 font-medium">EMP-{employee.id.padStart(4, '0')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Salary Type:</span>
                  <span className={cn("ml-2 px-2 py-0.5 rounded-full text-xs font-medium", isPerDaySalaryType ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                    {isPerDaySalaryType ? 'Per-Day' : 'Monthly'}
                  </span>
                </div>
              </div>
            </div>

            {/* Month/Year Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Select Pay Period
              </label>
              <div className="flex space-x-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-28 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary Preview */}
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-lg p-4 mb-6 border border-[#D4AF37]/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Salary for {months[selectedMonth]} {selectedYear}</p>
                  <p className="text-2xl font-bold text-[#2D2926]">{formatCurrency(netSalary)}</p>
                </div>
                <DollarSign size={32} className="text-[#D4AF37]" />
              </div>
              <div className="mt-3 pt-3 border-t border-[#D4AF37]/30 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Base:</span>
                  <span className="ml-1 font-medium">{formatCurrency(isPerDaySalaryType ? effectiveBaseSalary : baseSalary)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Deduction:</span>
                  <span className="ml-1 font-medium text-red-600">-{formatCurrency(isPerDaySalaryType ? 0 : actualDeduction)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Commission:</span>
                  <span className="ml-1 font-medium text-green-600">+{formatCurrency(totalCommission)}</span>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Building2 size={16} />
              <span>Payslip will be generated for {COMPANY_CONFIG.name}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generatePayslipPDFHandler}
              disabled={isGenerating}
              className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2 font-medium disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Generate & Download</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
