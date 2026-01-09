"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2, Search, Plus, CheckCircle, Calendar, DollarSign, TrendingUp, Settings, FileText, Loader2 } from "lucide-react";
import { Employee, EmployeeLeave, EmployeeCommission, LeaveDeductionRecord, SalaryRateAuditLog } from "@/types";
import { formatCurrency, getStatusColor, cn } from "@/lib/utils";
import { EmployeesService, FirebaseEmployee } from "@/lib/firebase/employees";
import AddEmployeeForm from "./AddEmployeeForm";
import ViewEmployeeModal from "./ViewEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
import DeleteEmployeeModal from "./DeleteEmployeeModal";
import LeaveManagementModal from "./LeaveManagementModal";
import CommissionManagementModal from "./CommissionManagementModal";
import SalaryDetailsModal from "./SalaryDetailsModal";
import SalarySettingsModal from "./SalarySettingsModal";
import PayslipGenerator from "./PayslipGenerator";

const departmentTabs = ["All", "Production", "Design", "Sales", "Management"];

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: "-50%" }}
    animate={{ opacity: 1, y: 0, x: "-50%" }}
    exit={{ opacity: 0, y: 50, x: "-50%" }}
    className={cn("fixed bottom-6 left-1/2 transform px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-[100]", type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white")}
  >
    <CheckCircle size={20} />
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-4 hover:opacity-80 text-xl">×</button>
  </motion.div>
);

export default function EmployeesTab() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Firebase real-time data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  const [commissions, setCommissions] = useState<EmployeeCommission[]>([]);
  const [deductionRecords, setDeductionRecords] = useState<LeaveDeductionRecord[]>([]);
  const [salaryAuditLogs, setSalaryAuditLogs] = useState<SalaryRateAuditLog[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [leaveEmployee, setLeaveEmployee] = useState<Employee | null>(null);
  const [commissionEmployee, setCommissionEmployee] = useState<Employee | null>(null);
  const [salaryEmployee, setSalaryEmployee] = useState<Employee | null>(null);
  const [salarySettingsEmployee, setSalarySettingsEmployee] = useState<Employee | null>(null);
  const [payslipEmployee, setPayslipEmployee] = useState<Employee | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Firebase Real-time Subscriptions
  useEffect(() => {
    setIsLoading(true);
    let loadingTimeout: NodeJS.Timeout;
    
    // Set a timeout to stop loading even if no data
    loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    // Subscribe to employees
    const unsubEmployees = EmployeesService.subscribeToEmployees((data) => {
      console.log('Employees data received:', data.length);
      setEmployees(data.map(e => ({
        ...e,
        workingDaysPerMonth: e.workingDaysPerMonth || 26,
        annualLeaves: e.annualLeaves || 24,
        salaryType: e.salaryType || 'monthly'
      })));
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    });

    // Subscribe to leaves
    const unsubLeaves = EmployeesService.subscribeToLeaves((data) => {
      console.log('Leaves data received:', data.length);
      setLeaves(data);
    });

    // Subscribe to commissions
    const unsubCommissions = EmployeesService.subscribeToCommissions((data) => {
      console.log('Commissions data received:', data.length);
      setCommissions(data);
    });

    // Subscribe to deduction records
    const unsubDeductions = EmployeesService.subscribeToDeductionRecords((data) => {
      setDeductionRecords(data);
    });

    // Cleanup subscriptions
    return () => {
      clearTimeout(loadingTimeout);
      unsubEmployees();
      unsubLeaves();
      unsubCommissions();
      unsubDeductions();
    };
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesFilter = activeFilter === "All" || emp.department === activeFilter.toLowerCase();
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Real-time stats from Firebase data
  const stats = {
    total: employees.length,
    production: employees.filter((e) => e.department === "production").length,
    design: employees.filter((e) => e.department === "design").length,
    sales: employees.filter((e) => e.department === "sales").length,
    onLeave: employees.filter((e) => e.status === "on_leave").length,
  };

  // Employee CRUD handlers - Firebase integrated
  const handleViewEmployee = (employee: Employee) => setViewEmployee(employee);
  
  const handleEditEmployee = (employee: Employee) => { 
    setEditEmployee(employee); 
    setViewEmployee(null); 
  };
  
  const handleSaveEmployee = async (updatedEmployee: Employee) => {
    setIsSubmitting(true);
    try {
      await EmployeesService.updateEmployee(updatedEmployee.id, {
        fullName: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        position: updatedEmployee.position,
        department: updatedEmployee.department,
        baseSalary: updatedEmployee.salary,
        status: updatedEmployee.status,
        joiningDate: updatedEmployee.joinDate,
        salaryType: updatedEmployee.salaryType,
        workingDaysPerMonth: updatedEmployee.workingDaysPerMonth,
        annualLeaves: updatedEmployee.annualLeaves,
        customPerDaySalary: updatedEmployee.customPerDaySalary,
        perDaySalaryEffectiveFrom: updatedEmployee.perDaySalaryEffectiveFrom,
        overtimeRate: updatedEmployee.overtimeRate,
        overtimeRateType: updatedEmployee.overtimeRateType,
      });
      setEditEmployee(null);
      showToast("Employee updated successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to update employee", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteClick = (employee: Employee) => setDeleteEmployee(employee);
  
  const handleConfirmDelete = async () => {
    if (!deleteEmployee) return;
    setIsSubmitting(true);
    try {
      await EmployeesService.deleteEmployee(deleteEmployee.id);
      setDeleteEmployee(null);
      showToast("Employee removed successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to delete employee", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddEmployee = async (employeeData: any) => {
    setIsSubmitting(true);
    try {
      const firebaseData: Omit<FirebaseEmployee, 'createdAt' | 'updatedAt'> = {
        fullName: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        position: employeeData.position,
        department: employeeData.department as 'production' | 'design' | 'sales' | 'management',
        baseSalary: Number(employeeData.salary),
        netSalary: Number(employeeData.salary),
        salaryType: 'monthly',
        status: employeeData.status || 'active',
        commission: 0,
        joiningDate: employeeData.joinDate,
        employeeId: employeeData.employeeId,
        address: employeeData.address,
        emergencyContact: employeeData.emergencyContact,
        skills: employeeData.skills,
        experience: employeeData.experience,
        workingDaysPerMonth: 26,
        annualLeaves: 24,
      };
      
      await EmployeesService.createEmployee(firebaseData);
      showToast("Employee added successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to add employee", 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Leave handlers - Firebase integrated
  const handleAddLeave = async (leave: Omit<EmployeeLeave, 'id'>) => {
    try {
      await EmployeesService.addLeave(leave);
      showToast("Leave applied successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to apply leave", 'error');
    }
  };
  
  const handleUpdateLeaveStatus = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await EmployeesService.updateLeaveStatus(leaveId, status);
      showToast(`Leave ${status} successfully!`);
    } catch (error: any) {
      showToast(error.message || "Failed to update leave status", 'error');
    }
  };

  // Delete Leave handler - Firebase integrated
  const handleDeleteLeave = async (leaveId: string, isApproved: boolean) => {
    try {
      await EmployeesService.deleteLeave(leaveId);
      showToast(isApproved ? "Approved leave removed - counters updated!" : "Leave record removed successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to remove leave", 'error');
      throw error;
    }
  };

  // Commission handlers - Firebase integrated
  const handleAddCommission = async (commission: Omit<EmployeeCommission, 'id'>) => {
    try {
      await EmployeesService.addCommission(commission);
      showToast("Commission added successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to add commission", 'error');
    }
  };

  // Deduction handlers - Firebase integrated
  const handleApplyDeduction = async (record: Omit<LeaveDeductionRecord, 'id'>) => {
    try {
      // Check if deduction already applied for this month
      const existing = deductionRecords.find(r => 
        r.employeeId === record.employeeId && 
        r.month === record.month && 
        r.year === record.year && 
        r.isDeductionApplied
      );
      if (existing) {
        showToast("Deduction already applied for this month!", 'error');
        return;
      }
      await EmployeesService.addDeductionRecord(record);
      showToast("Leave deduction applied successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to apply deduction", 'error');
    }
  };

  const handleUpdateDeductionMode = async (employeeId: string, month: number, year: number, mode: 'automatic' | 'manual') => {
    try {
      const existingRecord = deductionRecords.find(r => 
        r.employeeId === employeeId && r.month === month && r.year === year
      );
      if (existingRecord) {
        await EmployeesService.updateDeductionRecord(existingRecord.id, { deductionMode: mode });
      }
      showToast(`Deduction mode changed to ${mode}`);
    } catch (error: any) {
      showToast(error.message || "Failed to update deduction mode", 'error');
    }
  };

  // Salary Settings Handler - Firebase integrated
  const handleSaveSalarySettings = async (settings: Partial<Employee>) => {
    if (!salarySettingsEmployee) return;
    
    try {
      const previousEmployee = employees.find(e => e.id === salarySettingsEmployee.id);
      
      // Create audit log entry
      const auditLog: Omit<SalaryRateAuditLog, 'id'> = {
        employeeId: salarySettingsEmployee.id,
        action: settings.salaryType !== previousEmployee?.salaryType ? 'salary_type_changed' : 
                settings.customPerDaySalary !== previousEmployee?.customPerDaySalary ? 'per_day_rate_changed' : 'overtime_rate_changed',
        previousSalaryType: previousEmployee?.salaryType,
        newSalaryType: settings.salaryType,
        previousPerDayRate: previousEmployee?.customPerDaySalary,
        newPerDayRate: settings.customPerDaySalary,
        effectiveFrom: settings.perDaySalaryEffectiveFrom || new Date().toISOString().split('T')[0],
        changedBy: 'Admin',
        changedAt: new Date().toISOString(),
      };
      await EmployeesService.addSalaryAuditLog(auditLog);
      
      // Update employee
      await EmployeesService.updateEmployee(salarySettingsEmployee.id, {
        salaryType: settings.salaryType,
        customPerDaySalary: settings.customPerDaySalary,
        perDaySalaryEffectiveFrom: settings.perDaySalaryEffectiveFrom,
        overtimeRate: settings.overtimeRate,
        overtimeRateType: settings.overtimeRateType,
      });
      
      setSalarySettingsEmployee(null);
      showToast("Salary settings updated successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to update salary settings", 'error');
    }
  };

  const handleOpenSalarySettings = () => {
    if (salaryEmployee) {
      setSalarySettingsEmployee(salaryEmployee);
    }
  };

  // Calculate net salary for display
  const calculateNetSalary = (employee: Employee) => {
    const workingDays = employee.workingDaysPerMonth || 26;
    const isPerDaySalaryType = employee.salaryType === 'per_day';
    const customPerDaySalary = employee.customPerDaySalary || 0;
    const calculatedPerDaySalary = employee.salary / workingDays;
    const effectivePerDaySalary = isPerDaySalaryType && customPerDaySalary > 0 ? customPerDaySalary : calculatedPerDaySalary;
    
    const now = new Date();
    
    const deductionRecord = deductionRecords.find(r => 
      r.employeeId === employee.id && r.month === now.getMonth() && r.year === now.getFullYear()
    );
    const isDeductionApplied = deductionRecord?.isDeductionApplied || false;
    const isAutoMode = deductionRecord?.deductionMode === 'automatic';
    
    const monthLeaves = leaves.filter(l => {
      if (l.employeeId !== employee.id || l.status !== 'approved') return false;
      const leaveDate = new Date(l.fromDate);
      return leaveDate.getMonth() === now.getMonth() && leaveDate.getFullYear() === now.getFullYear();
    });
    
    const unpaidDays = monthLeaves.filter(l => l.leaveType === 'unpaid').reduce((sum, l) => sum + l.totalDays, 0);
    const halfDays = monthLeaves.filter(l => l.leaveType === 'half_day').reduce((sum, l) => sum + l.totalDays, 0);
    
    const monthCommissions = commissions.filter(c => {
      if (c.employeeId !== employee.id) return false;
      const commDate = new Date(c.commissionDate);
      return commDate.getMonth() === now.getMonth() && commDate.getFullYear() === now.getFullYear();
    });
    const totalCommission = monthCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    
    if (isPerDaySalaryType) {
      const effectiveWorkingDays = workingDays - (isAutoMode || isDeductionApplied ? unpaidDays + (halfDays * 0.5) : 0);
      return (effectivePerDaySalary * effectiveWorkingDays) + totalCommission;
    } else {
      const totalDeduction = (unpaidDays * effectivePerDaySalary) + (halfDays * effectivePerDaySalary * 0.5);
      const actualDeduction = (isAutoMode || isDeductionApplied) ? totalDeduction : 0;
      return employee.salary - actualDeduction + totalCommission;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <p className="text-gray-600">Loading employees from Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#2D2926] mb-2">Employee Management</h1>
          <p className="text-gray-600">Manage employees, leaves, salary & commissions • Real-time Firebase Data</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={() => setShowAddForm(true)} 
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-lg hover:bg-[#B8941F] transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus size={20} />
          <span>Add Employee</span>
        </motion.button>
      </motion.div>

      {/* Stats - Real-time from Firebase */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Employees", value: stats.total, color: "bg-blue-50 border-blue-200" },
          { label: "Production", value: stats.production, color: "bg-indigo-50 border-indigo-200" },
          { label: "Design", value: stats.design, color: "bg-purple-50 border-purple-200" },
          { label: "Sales", value: stats.sales, color: "bg-green-50 border-green-200" },
          { label: "On Leave", value: stats.onLeave, color: "bg-orange-50 border-orange-200" },
        ].map((stat, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.1 }} 
            className={cn("rounded-lg p-4 shadow-md border", stat.color)}
          >
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#2D2926]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {departmentTabs.map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveFilter(tab)} 
                className={cn("px-4 py-2 rounded-lg transition-colors", activeFilter === tab ? "bg-[#D4AF37] text-white" : "bg-gray-100 hover:bg-gray-200")}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search employees..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] w-full md:w-64" 
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee, index) => (
                <motion.tr 
                  key={employee.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: index * 0.05 }} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#D4AF37] font-semibold">{employee.name.charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-[#2D2926]">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{employee.position}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">{employee.department}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(employee.salary)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-green-600">{formatCurrency(calculateNetSalary(employee))}</span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full w-fit mt-1", employee.salaryType === 'per_day' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                        {employee.salaryType === 'per_day' ? 'Per-Day' : 'Monthly'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(employee.status))}>
                      {employee.status === "active" ? "Active" : "On Leave"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleViewEmployee(employee)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Profile">
                        <Eye size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSalaryEmployee(employee)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Salary Details">
                        <DollarSign size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSalarySettingsEmployee(employee)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Salary Rate Settings">
                        <Settings size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setLeaveEmployee(employee)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Leave Management">
                        <Calendar size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCommissionEmployee(employee)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Commission Details">
                        <TrendingUp size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setPayslipEmployee(employee)} className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded transition-colors" title="Generate Payslip">
                        <FileText size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEditEmployee(employee)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Edit Employee">
                        <Edit size={16} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteClick(employee)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Employee">
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No employees found</div>
            <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors">Add First Employee</button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEmployeeForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSubmit={handleAddEmployee} />
      {viewEmployee && <ViewEmployeeModal employee={viewEmployee} onClose={() => setViewEmployee(null)} onEdit={() => handleEditEmployee(viewEmployee)} />}
      {editEmployee && <EditEmployeeModal employee={editEmployee} onClose={() => setEditEmployee(null)} onSave={handleSaveEmployee} />}
      {deleteEmployee && <DeleteEmployeeModal employee={deleteEmployee} onClose={() => setDeleteEmployee(null)} onConfirm={handleConfirmDelete} />}
      {leaveEmployee && <LeaveManagementModal employee={leaveEmployee} leaves={leaves} onClose={() => setLeaveEmployee(null)} onAddLeave={handleAddLeave} onUpdateLeaveStatus={handleUpdateLeaveStatus} onDeleteLeave={handleDeleteLeave} isAdmin={true} />}
      {commissionEmployee && <CommissionManagementModal employee={commissionEmployee} commissions={commissions} onClose={() => setCommissionEmployee(null)} onAddCommission={handleAddCommission} />}
      {salaryEmployee && <SalaryDetailsModal employee={salaryEmployee} leaves={leaves} commissions={commissions} deductionRecords={deductionRecords} onClose={() => setSalaryEmployee(null)} onApplyDeduction={handleApplyDeduction} onUpdateDeductionMode={handleUpdateDeductionMode} onOpenSalarySettings={handleOpenSalarySettings} />}
      {salarySettingsEmployee && <SalarySettingsModal employee={salarySettingsEmployee} onClose={() => setSalarySettingsEmployee(null)} onSave={handleSaveSalarySettings} />}
      {payslipEmployee && <PayslipGenerator isOpen={!!payslipEmployee} employee={payslipEmployee} leaves={leaves} commissions={commissions} deductionRecords={deductionRecords} onClose={() => setPayslipEmployee(null)} onGenerated={() => { setPayslipEmployee(null); showToast("Payslip generated successfully!"); }} />}
    </div>
  );
}
