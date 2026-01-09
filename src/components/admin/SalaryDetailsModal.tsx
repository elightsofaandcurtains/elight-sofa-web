"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Minus, Plus, Download, AlertTriangle, Settings, Loader2 } from "lucide-react";
import { Employee, EmployeeLeave, EmployeeCommission, LeaveDeductionRecord } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { downloadPayslipPDF, PayslipData } from "@/lib/pdfService";

interface SalaryDetailsModalProps {
  employee: Employee;
  leaves: EmployeeLeave[];
  commissions: EmployeeCommission[];
  deductionRecords: LeaveDeductionRecord[];
  onClose: () => void;
  onApplyDeduction: (record: Omit<LeaveDeductionRecord, 'id'>) => void;
  onUpdateDeductionMode: (employeeId: string, month: number, year: number, mode: 'automatic' | 'manual') => void;
  onOpenSalarySettings: () => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function SalaryDetailsModal({ employee, leaves, commissions, deductionRecords, onClose, onApplyDeduction, onUpdateDeductionMode, onOpenSalarySettings }: SalaryDetailsModalProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGeneratingPayslip, setIsGeneratingPayslip] = useState(false);
  const [deductionMode, setDeductionMode] = useState<'automatic' | 'manual'>('manual');

  const workingDays = employee.workingDaysPerMonth || 26;
  const baseSalary = employee.salary;
  
  // Per-Day Salary Calculation based on salary type
  const isPerDaySalaryType = employee.salaryType === 'per_day';
  const customPerDaySalary = employee.customPerDaySalary || 0;
  const calculatedPerDaySalary = baseSalary / workingDays;
  const effectivePerDaySalary = isPerDaySalaryType && customPerDaySalary > 0 ? customPerDaySalary : calculatedPerDaySalary;

  // Get current deduction record
  const currentDeductionRecord = deductionRecords.find(r => r.employeeId === employee.id && r.month === selectedMonth && r.year === selectedYear);
  const isDeductionApplied = currentDeductionRecord?.isDeductionApplied || false;
  const currentMode = currentDeductionRecord?.deductionMode || deductionMode;

  // Filter leaves for selected month
  const monthLeaves = leaves.filter(l => {
    if (l.employeeId !== employee.id || l.status !== 'approved') return false;
    const leaveDate = new Date(l.fromDate);
    return leaveDate.getMonth() === selectedMonth && leaveDate.getFullYear() === selectedYear;
  });

  // Calculate leave days
  const unpaidLeaveDays = monthLeaves.filter(l => l.leaveType === 'unpaid').reduce((sum, l) => sum + l.totalDays, 0);
  const halfDayLeaveDays = monthLeaves.filter(l => l.leaveType === 'half_day').reduce((sum, l) => sum + l.totalDays, 0);
  const paidLeaveDays = monthLeaves.filter(l => ['paid', 'sick', 'casual'].includes(l.leaveType)).reduce((sum, l) => sum + l.totalDays, 0);
  
  // Calculate deductions using effective per-day salary
  const unpaidDeduction = unpaidLeaveDays * effectivePerDaySalary;
  const halfDayDeduction = halfDayLeaveDays * (effectivePerDaySalary * 0.5);
  const totalPendingDeduction = unpaidDeduction + halfDayDeduction;
  const actualDeduction = (currentMode === 'automatic' || isDeductionApplied) ? totalPendingDeduction : 0;

  // Calculate base salary for per-day type
  const effectiveBaseSalary = isPerDaySalaryType 
    ? effectivePerDaySalary * (workingDays - (isDeductionApplied || currentMode === 'automatic' ? unpaidLeaveDays + (halfDayLeaveDays * 0.5) : 0))
    : baseSalary;

  // Filter commissions
  const monthCommissions = commissions.filter(c => {
    if (c.employeeId !== employee.id) return false;
    const commDate = new Date(c.commissionDate);
    return commDate.getMonth() === selectedMonth && commDate.getFullYear() === selectedYear;
  });
  const totalCommission = monthCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  // Final salary calculation
  const netSalary = isPerDaySalaryType 
    ? effectiveBaseSalary + totalCommission
    : baseSalary - actualDeduction + totalCommission;

  const handleModeChange = (mode: 'automatic' | 'manual') => {
    setDeductionMode(mode);
    onUpdateDeductionMode(employee.id, selectedMonth, selectedYear, mode);
  };

  const handleApplyDeduction = () => {
    onApplyDeduction({
      employeeId: employee.id, month: selectedMonth, year: selectedYear,
      deductionMode: 'manual', isDeductionApplied: true,
      unpaidLeaveDays, halfDayLeaveDays, totalDeductionAmount: totalPendingDeduction,
      appliedDate: new Date().toISOString(), appliedBy: 'Admin',
    });
  };

  const generateAndDownloadPayslip = async () => {
    setIsGeneratingPayslip(true);
    
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
      
    } catch (error) {
      console.error('Failed to generate payslip PDF:', error);
      alert('Failed to generate payslip. Please try again.');
    } finally {
      setIsGeneratingPayslip(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <DollarSign size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Salary Details</h2>
                <p className="text-white/70">{employee.name} • {employee.position}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onOpenSalarySettings} className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2">
                <Settings size={18} />
                <span>Settings</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateAndDownloadPayslip} disabled={isGeneratingPayslip} className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2 disabled:opacity-70">
                {isGeneratingPayslip ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                <span>{isGeneratingPayslip ? 'Generating...' : 'Payslip'}</span>
              </motion.button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            {/* Salary Type Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={cn("px-4 py-2 rounded-full text-sm font-semibold", isPerDaySalaryType ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800")}>
                  {isPerDaySalaryType ? "💵 Per-Day Salary" : "📅 Monthly Salary"}
                </span>
                {isPerDaySalaryType && employee.perDaySalaryEffectiveFrom && (
                  <span className="text-sm text-gray-500">Effective from {formatDate(employee.perDaySalaryEffectiveFrom)}</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Per-Day Rate</p>
                <p className="text-xl font-bold text-[#D4AF37]">{formatCurrency(effectivePerDaySalary)}</p>
              </div>
            </div>

            {/* Month/Year Selector */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                  {months.map((month, index) => (<option key={month} value={index}>{month}</option>))}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]">
                  {[2023, 2024, 2025, 2026].map(year => (<option key={year} value={year}>{year}</option>))}
                </select>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Working Days</p>
                <p className="text-xl font-bold text-[#2D2926]">{workingDays} days</p>
              </div>
            </div>

            {/* Deduction Mode Control */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Settings size={24} className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-[#2D2926]">Leave Deduction Mode</h3>
                    <p className="text-sm text-gray-500">Control how leave deductions are applied</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isDeductionApplied ? (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span><span>Applied</span>
                    </span>
                  ) : totalPendingDeduction > 0 ? (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span><span>Pending</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span><span>No Deduction</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <button onClick={() => handleModeChange('automatic')} className={cn("flex-1 py-3 px-4 rounded-lg border-2 transition-all", currentMode === 'automatic' ? "border-blue-500 bg-blue-100 text-blue-800" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300")}>
                  <div className="flex items-center justify-center space-x-2">
                    <div className={cn("w-4 h-4 rounded-full border-2", currentMode === 'automatic' ? "border-blue-500 bg-blue-500" : "border-gray-300")}></div>
                    <span className="font-medium">Automatic</span>
                  </div>
                </button>
                <button onClick={() => handleModeChange('manual')} className={cn("flex-1 py-3 px-4 rounded-lg border-2 transition-all", currentMode === 'manual' ? "border-blue-500 bg-blue-100 text-blue-800" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300")}>
                  <div className="flex items-center justify-center space-x-2">
                    <div className={cn("w-4 h-4 rounded-full border-2", currentMode === 'manual' ? "border-blue-500 bg-blue-500" : "border-gray-300")}></div>
                    <span className="font-medium">Manual</span>
                  </div>
                </button>
              </div>
              {currentMode === 'manual' && totalPendingDeduction > 0 && !isDeductionApplied && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApplyDeduction} className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 font-medium">
                  <AlertTriangle size={20} /><span>Apply Leave Deduction ({formatCurrency(totalPendingDeduction)})</span>
                </motion.button>
              )}
            </div>

            {/* Salary Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Earnings */}
              <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center space-x-2">
                  <Plus size={20} /><span>Earnings</span>
                </h3>
                <div className="space-y-3">
                  {isPerDaySalaryType ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per-Day Salary</span>
                        <span className="font-semibold text-green-700">{formatCurrency(effectivePerDaySalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Working Days (excl. unpaid)</span>
                        <span className="font-medium text-gray-700">{workingDays - (isDeductionApplied || currentMode === 'automatic' ? unpaidLeaveDays + (halfDayLeaveDays * 0.5) : 0)} days</span>
                      </div>
                      <div className="flex justify-between border-t border-green-200 pt-2">
                        <span className="text-gray-600">Calculated Base</span>
                        <span className="font-semibold text-green-700">{formatCurrency(effectiveBaseSalary)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Salary</span>
                        <span className="font-semibold text-green-700">{formatCurrency(baseSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per Day Salary</span>
                        <span className="font-medium text-gray-700">{formatCurrency(effectivePerDaySalary)}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Commission</span>
                      <span className="font-semibold text-green-700">+ {formatCurrency(totalCommission)}</span>
                    </div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-green-800">Total Earnings</span>
                      <span className="font-bold text-green-800">{formatCurrency((isPerDaySalaryType ? effectiveBaseSalary : baseSalary) + totalCommission)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
                  <Minus size={20} /><span>Deductions</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unpaid Leave ({unpaidLeaveDays} days)</span>
                    <span className={cn("font-semibold", (isDeductionApplied || currentMode === 'automatic') && !isPerDaySalaryType ? "text-red-700" : "text-gray-400 line-through")}>- {formatCurrency(unpaidDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Half Day ({halfDayLeaveDays} days)</span>
                    <span className={cn("font-semibold", (isDeductionApplied || currentMode === 'automatic') && !isPerDaySalaryType ? "text-red-700" : "text-gray-400 line-through")}>- {formatCurrency(halfDayDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Paid Leaves (No deduction)</span>
                    <span>{paidLeaveDays} days</span>
                  </div>
                  <div className={cn("rounded-lg p-3 mt-2", !isPerDaySalaryType && actualDeduction > 0 ? "bg-red-100" : "bg-gray-100")}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={cn("font-semibold", !isPerDaySalaryType && actualDeduction > 0 ? "text-red-800" : "text-gray-600")}>Total Deductions</span>
                        <p className="text-xs mt-1">
                          {isPerDaySalaryType ? (
                            <span className="text-purple-600">Included in per-day calculation</span>
                          ) : isDeductionApplied ? (
                            <span className="text-green-600">✓ Applied (Manual)</span>
                          ) : currentMode === 'automatic' ? (
                            <span className="text-blue-600">Auto Applied</span>
                          ) : (
                            <span className="text-yellow-600">⚠ Not Applied</span>
                          )}
                        </p>
                      </div>
                      <span className={cn("font-bold", !isPerDaySalaryType && actualDeduction > 0 ? "text-red-800" : "text-gray-600")}>- {formatCurrency(isPerDaySalaryType ? 0 : actualDeduction)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-xl p-6 border border-[#D4AF37]/30 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Net Payable Salary</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isPerDaySalaryType 
                      ? `${formatCurrency(effectivePerDaySalary)} × ${workingDays - (isDeductionApplied || currentMode === 'automatic' ? unpaidLeaveDays + (halfDayLeaveDays * 0.5) : 0)} days + ${formatCurrency(totalCommission)}`
                      : `${formatCurrency(baseSalary)} - ${formatCurrency(actualDeduction)} + ${formatCurrency(totalCommission)}`
                    }
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={cn("px-2 py-1 text-xs rounded-full", isPerDaySalaryType ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                      {isPerDaySalaryType ? "Per-Day" : "Monthly"}
                    </span>
                    <span className={cn("px-2 py-1 text-xs rounded-full", isDeductionApplied ? "bg-green-100 text-green-700" : currentMode === 'automatic' ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700")}>
                      Deduction: {isPerDaySalaryType ? "In Calculation" : isDeductionApplied ? "Applied" : currentMode === 'automatic' ? "Auto" : "Not Applied"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-[#2D2926]">{formatCurrency(netSalary)}</p>
                  <p className="text-sm text-gray-500">{months[selectedMonth]} {selectedYear}</p>
                </div>
              </div>
            </div>

            {/* Commission & Leave Tables */}
            {monthCommissions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="font-semibold text-[#2D2926]">Commission Breakdown</h3></div>
                <table className="w-full">
                  <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th></tr></thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthCommissions.map((comm) => (<tr key={comm.id}><td className="px-4 py-3 text-sm font-medium text-blue-600">{comm.invoiceNumber}</td><td className="px-4 py-3 text-sm capitalize">{comm.commissionSource.replace('_', ' ')}</td><td className="px-4 py-3 text-sm">{formatCurrency(comm.saleAmount)}</td><td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(comm.commissionAmount)}</td></tr>))}
                  </tbody>
                </table>
              </div>
            )}
            {monthLeaves.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="font-semibold text-[#2D2926]">Leave Breakdown</h3></div>
                <table className="w-full">
                  <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deduction</th></tr></thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthLeaves.map((leave) => {
                      const deduction = leave.leaveType === 'unpaid' ? leave.totalDays * effectivePerDaySalary : leave.leaveType === 'half_day' ? leave.totalDays * effectivePerDaySalary * 0.5 : 0;
                      return (<tr key={leave.id}><td className="px-4 py-3 text-sm">{formatDate(leave.fromDate)}</td><td className="px-4 py-3 text-sm capitalize">{leave.leaveType.replace('_', ' ')}</td><td className="px-4 py-3 text-sm">{leave.totalDays}</td><td className="px-4 py-3 text-sm font-semibold text-red-600">{deduction > 0 ? `- ${formatCurrency(deduction)}` : '-'}</td></tr>);
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
