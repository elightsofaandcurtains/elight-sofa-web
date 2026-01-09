"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, DollarSign, Calendar, Clock, Save, AlertTriangle } from "lucide-react";
import { Employee } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

interface SalarySettingsModalProps {
  employee: Employee;
  onClose: () => void;
  onSave: (settings: Partial<Employee>) => void;
}

export default function SalarySettingsModal({ employee, onClose, onSave }: SalarySettingsModalProps) {
  const [salaryType, setSalaryType] = useState<'monthly' | 'per_day'>(employee.salaryType || 'monthly');
  const [customPerDaySalary, setCustomPerDaySalary] = useState(employee.customPerDaySalary?.toString() || '');
  const [effectiveFrom, setEffectiveFrom] = useState(employee.perDaySalaryEffectiveFrom || new Date().toISOString().split('T')[0]);
  const [overtimeRate, setOvertimeRate] = useState(employee.overtimeRate?.toString() || '');
  const [overtimeRateType, setOvertimeRateType] = useState<'per_hour' | 'per_day'>(employee.overtimeRateType || 'per_hour');
  const [workingDays, setWorkingDays] = useState(employee.workingDaysPerMonth?.toString() || '26');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculatedPerDaySalary = employee.salary / (parseInt(workingDays) || 26);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (salaryType === 'per_day') {
      if (!customPerDaySalary || parseFloat(customPerDaySalary) <= 0) {
        newErrors.customPerDaySalary = "Per-day salary must be greater than 0";
      }
      if (!effectiveFrom) {
        newErrors.effectiveFrom = "Effective date is required";
      }
    }
    
    if (overtimeRate && parseFloat(overtimeRate) < 0) {
      newErrors.overtimeRate = "Overtime rate cannot be negative";
    }
    
    if (!workingDays || parseInt(workingDays) <= 0 || parseInt(workingDays) > 31) {
      newErrors.workingDays = "Working days must be between 1 and 31";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const settings: Partial<Employee> = {
        salaryType,
        workingDaysPerMonth: parseInt(workingDays),
        customPerDaySalary: salaryType === 'per_day' ? parseFloat(customPerDaySalary) : undefined,
        perDaySalaryEffectiveFrom: salaryType === 'per_day' ? effectiveFrom : undefined,
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
        overtimeRateType: overtimeRate ? overtimeRateType : undefined,
      };
      onSave(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEffectivePerDaySalary = () => {
    if (salaryType === 'per_day' && customPerDaySalary) {
      return parseFloat(customPerDaySalary);
    }
    return calculatedPerDaySalary;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2D2926] to-[#4A4543]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <Settings size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Salary Rate Settings</h2>
                <p className="text-white/70">{employee.name} • {employee.position}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">
              {/* Current Salary Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-[#2D2926] mb-3">Current Salary Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Salary</p>
                    <p className="text-xl font-bold text-[#2D2926]">{formatCurrency(employee.salary)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Calculated Per-Day</p>
                    <p className="text-xl font-bold text-gray-600">{formatCurrency(calculatedPerDaySalary)}</p>
                  </div>
                </div>
              </div>

              {/* Salary Type Selection */}
              <div>
                <h3 className="font-semibold text-[#2D2926] mb-4 flex items-center space-x-2">
                  <DollarSign size={20} className="text-[#D4AF37]" />
                  <span>Salary Type</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSalaryType('monthly')}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      salaryType === 'monthly'
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        salaryType === 'monthly' ? "border-[#D4AF37]" : "border-gray-300"
                      )}>
                        {salaryType === 'monthly' && <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />}
                      </div>
                      <span className="font-semibold text-[#2D2926]">Monthly Salary</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">Per-day calculated automatically from monthly salary</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalaryType('per_day')}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      salaryType === 'per_day'
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        salaryType === 'per_day' ? "border-[#D4AF37]" : "border-gray-300"
                      )}>
                        {salaryType === 'per_day' && <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />}
                      </div>
                      <span className="font-semibold text-[#2D2926]">Per-Day Salary</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">Custom per-day rate defined by admin</p>
                  </button>
                </div>
              </div>

              {/* Working Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days per Month</label>
                <input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  min="1"
                  max="31"
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37]",
                    errors.workingDays ? "border-red-500" : "border-gray-300"
                  )}
                />
                {errors.workingDays && <p className="text-red-500 text-sm mt-1">{errors.workingDays}</p>}
              </div>

              {/* Per-Day Salary Settings */}
              {salaryType === 'per_day' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 rounded-xl p-5 border border-blue-200 space-y-4"
                >
                  <h3 className="font-semibold text-blue-800 flex items-center space-x-2">
                    <Calendar size={20} />
                    <span>Per-Day Salary Configuration</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Per-Day Salary (₹) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={customPerDaySalary}
                          onChange={(e) => setCustomPerDaySalary(e.target.value)}
                          min="1"
                          step="0.01"
                          className={cn(
                            "w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37]",
                            errors.customPerDaySalary ? "border-red-500" : "border-gray-300"
                          )}
                          placeholder="Enter per-day salary"
                        />
                      </div>
                      {errors.customPerDaySalary && <p className="text-red-500 text-sm mt-1">{errors.customPerDaySalary}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Effective From *</label>
                      <input
                        type="date"
                        value={effectiveFrom}
                        onChange={(e) => setEffectiveFrom(e.target.value)}
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37]",
                          errors.effectiveFrom ? "border-red-500" : "border-gray-300"
                        )}
                      />
                      {errors.effectiveFrom && <p className="text-red-500 text-sm mt-1">{errors.effectiveFrom}</p>}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This custom per-day salary will override the system-calculated rate ({formatCurrency(calculatedPerDaySalary)}/day)
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Overtime Settings */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-[#2D2926] mb-4 flex items-center space-x-2">
                  <Clock size={20} className="text-[#D4AF37]" />
                  <span>Overtime Rate (Optional)</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate (₹)</label>
                    <input
                      type="number"
                      value={overtimeRate}
                      onChange={(e) => setOvertimeRate(e.target.value)}
                      min="0"
                      step="0.01"
                      className={cn(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#D4AF37]",
                        errors.overtimeRate ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Enter overtime rate"
                    />
                    {errors.overtimeRate && <p className="text-red-500 text-sm mt-1">{errors.overtimeRate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate Type</label>
                    <select
                      value={overtimeRateType}
                      onChange={(e) => setOvertimeRateType(e.target.value as 'per_hour' | 'per_day')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="per_hour">Per Hour</option>
                      <option value="per_day">Per Day</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-xl p-5 border border-[#D4AF37]/30">
                <h3 className="font-semibold text-[#2D2926] mb-3">Effective Salary Rate</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Salary Type</p>
                    <p className="text-lg font-bold text-[#2D2926] capitalize">{salaryType.replace('_', '-')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Per-Day Salary</p>
                    <p className="text-2xl font-bold text-[#D4AF37]">{formatCurrency(getEffectivePerDaySalary())}</p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Admin Action Required</p>
                    <p>Changes to salary rate settings will be logged for audit purposes. Only Admin/HR can modify these settings.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 font-medium flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{isSubmitting ? "Saving..." : "Save Settings"}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
