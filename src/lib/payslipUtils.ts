import { Employee, EmployeeLeave, EmployeeCommission, LeaveDeductionRecord } from "@/types";
import { COMPANY_CONFIG, getPayslipHeader, getAuthorizationDetails } from "./companyConfig";

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface PayslipData {
  employee: Employee;
  leaves: EmployeeLeave[];
  commissions: EmployeeCommission[];
  deductionRecords: LeaveDeductionRecord[];
  month: number;
  year: number;
}

export function calculatePayslipData(data: PayslipData) {
  const { employee, leaves, commissions, deductionRecords, month, year } = data;
  
  const workingDays = employee.workingDaysPerMonth || 26;
  const baseSalary = employee.salary;
  const isPerDaySalaryType = employee.salaryType === 'per_day';
  const customPerDaySalary = employee.customPerDaySalary || 0;
  const calculatedPerDaySalary = baseSalary / workingDays;
  const effectivePerDaySalary = isPerDaySalaryType && customPerDaySalary > 0 ? customPerDaySalary : calculatedPerDaySalary;

  // Get deduction record
  const deductionRecord = deductionRecords.find(r => r.employeeId === employee.id && r.month === month && r.year === year);
  const isDeductionApplied = deductionRecord?.isDeductionApplied || false;
  const isAutoMode = deductionRecord?.deductionMode === 'automatic';

  // Filter leaves for selected month
  const monthLeaves = leaves.filter(l => {
    if (l.employeeId !== employee.id || l.status !== 'approved') return false;
    const leaveDate = new Date(l.fromDate);
    return leaveDate.getMonth() === month && leaveDate.getFullYear() === year;
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
    return commDate.getMonth() === month && commDate.getFullYear() === year;
  });
  const totalCommission = monthCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  // Calculate net salary
  const effectiveBaseSalary = isPerDaySalaryType 
    ? effectivePerDaySalary * (workingDays - (isAutoMode || isDeductionApplied ? unpaidLeaveDays + (halfDayLeaveDays * 0.5) : 0))
    : baseSalary;
  
  const netSalary = isPerDaySalaryType 
    ? effectiveBaseSalary + totalCommission
    : baseSalary - actualDeduction + totalCommission;

  return {
    workingDays,
    baseSalary,
    isPerDaySalaryType,
    effectivePerDaySalary,
    effectiveBaseSalary,
    paidLeaveDays,
    unpaidLeaveDays,
    halfDayLeaveDays,
    unpaidDeduction,
    halfDayDeduction,
    actualDeduction,
    totalCommission,
    netSalary,
    monthLeaves,
    monthCommissions,
    isAutoMode,
    isDeductionApplied
  };
}

export function generatePayslipHTML(data: PayslipData): string {
  const { employee, month, year } = data;
  const calc = calculatePayslipData(data);
  
  // Get company details from centralized config
  const companyHeader = getPayslipHeader();
  const { branding, authorization } = COMPANY_CONFIG;
  const authDetails = getAuthorizationDetails();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${employee.name} - ${months[month]} ${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .payslip { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%); color: white; padding: 30px; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .company-info h1 { font-size: 28px; margin-bottom: 5px; color: ${branding.accentColor}; }
    .company-info p { font-size: 14px; opacity: 0.9; }
    .payslip-title { text-align: right; }
    .payslip-title h2 { font-size: 24px; color: ${branding.accentColor}; }
    .payslip-title p { font-size: 14px; opacity: 0.9; margin-top: 5px; }
    .content { padding: 30px; }
    .employee-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
    .info-group h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 15px; letter-spacing: 1px; }
    .info-item { margin-bottom: 12px; }
    .info-item label { font-size: 12px; color: #666; display: block; margin-bottom: 2px; }
    .info-item span { font-size: 15px; color: ${branding.primaryColor}; font-weight: 500; }
    .salary-section { margin-bottom: 30px; }
    .salary-section h3 { font-size: 16px; color: ${branding.primaryColor}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${branding.accentColor}; }
    .salary-table { width: 100%; border-collapse: collapse; }
    .salary-table th, .salary-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
    .salary-table th { background: #f8f8f8; font-size: 12px; text-transform: uppercase; color: #666; }
    .salary-table td { font-size: 14px; color: #333; }
    .salary-table .amount { text-align: right; font-weight: 600; }
    .salary-table .earnings { color: #16a34a; }
    .salary-table .deductions { color: #dc2626; }
    .net-salary { background: linear-gradient(135deg, ${branding.accentColor} 0%, #B8941F 100%); color: white; padding: 25px; margin: 20px 0; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
    .net-salary .label { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .net-salary .amount { font-size: 32px; font-weight: 700; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-monthly { background: #dbeafe; color: #1d4ed8; }
    .badge-perday { background: #f3e8ff; color: #7c3aed; }
    
    /* Authorization Footer Styles */
    .auth-footer { 
      padding: 30px; 
      border-top: 2px solid #eee; 
      margin-top: 40px;
    }
    .auth-footer-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .auth-section {
      text-align: center;
      width: 200px;
    }
    .stamp-box, .signature-box {
      width: 120px;
      height: 120px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px auto;
      background: #fafafa;
      overflow: hidden;
    }
    .stamp-box img, .signature-box img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .stamp-box.circular {
      border-radius: 50%;
    }
    .placeholder-text {
      font-size: 11px;
      color: #999;
      text-align: center;
      padding: 10px;
    }
    .auth-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .auth-name {
      font-size: 14px;
      font-weight: 600;
      color: ${branding.primaryColor};
    }
    .divider-line {
      width: 150px;
      height: 1px;
      background: #333;
      margin: 0 auto 8px auto;
    }
    
    @media print { 
      body { padding: 0; background: white; } 
      .payslip { box-shadow: none; } 
      .stamp-box, .signature-box { border-style: solid; }
    }
  </style>
</head>
<body>
  <div class="payslip">
    <div class="header">
      <div class="header-content">
        <div class="company-info">
          <h1>🛋️ ${companyHeader.companyName}</h1>
          <p>${companyHeader.tagline}</p>
          <p style="margin-top: 5px;">${companyHeader.address}</p>
          <p style="margin-top: 3px;">📧 ${companyHeader.email} | 📞 ${companyHeader.phone}</p>
        </div>
        <div class="payslip-title">
          <h2>PAYSLIP</h2>
          <p>${months[month]} ${year}</p>
        </div>
      </div>
    </div>
    
    <div class="content">
      <div class="employee-section">
        <div class="info-group">
          <h3>Employee Details</h3>
          <div class="info-item">
            <label>Employee Name</label>
            <span>${employee.name}</span>
          </div>
          <div class="info-item">
            <label>Employee ID</label>
            <span>EMP-${employee.id.padStart(4, '0')}</span>
          </div>
          <div class="info-item">
            <label>Designation</label>
            <span>${employee.position}</span>
          </div>
          <div class="info-item">
            <label>Department</label>
            <span style="text-transform: capitalize;">${employee.department}</span>
          </div>
        </div>
        <div class="info-group">
          <h3>Pay Period Details</h3>
          <div class="info-item">
            <label>Pay Period</label>
            <span>${months[month]} ${year}</span>
          </div>
          <div class="info-item">
            <label>Working Days</label>
            <span>${calc.workingDays} days</span>
          </div>
          <div class="info-item">
            <label>Salary Type</label>
            <span class="badge ${calc.isPerDaySalaryType ? 'badge-perday' : 'badge-monthly'}">${calc.isPerDaySalaryType ? 'Per-Day' : 'Monthly'}</span>
          </div>
          <div class="info-item">
            <label>Per-Day Rate</label>
            <span>₹${calc.effectivePerDaySalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div class="salary-section">
        <h3>💰 Earnings</h3>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${calc.isPerDaySalaryType ? 'Calculated Base Salary' : 'Base Salary'}</td>
              <td class="amount earnings">+${calc.effectiveBaseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            ${calc.totalCommission > 0 ? `
            <tr>
              <td>Commission Earned (${calc.monthCommissions.length} sale${calc.monthCommissions.length > 1 ? 's' : ''})</td>
              <td class="amount earnings">+${calc.totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            ` : ''}
            <tr style="background: #f0fdf4;">
              <td><strong>Total Earnings</strong></td>
              <td class="amount earnings"><strong>+${(calc.effectiveBaseSalary + calc.totalCommission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="salary-section">
        <h3>📉 Deductions</h3>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Paid Leaves (${calc.paidLeaveDays} days) - No Deduction</td>
              <td class="amount">-0.00</td>
            </tr>
            ${!calc.isPerDaySalaryType ? `
            <tr>
              <td>Unpaid Leave Deduction (${calc.unpaidLeaveDays} days)</td>
              <td class="amount deductions">-${((calc.isAutoMode || calc.isDeductionApplied) ? calc.unpaidDeduction : 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Half Day Deduction (${calc.halfDayLeaveDays} days)</td>
              <td class="amount deductions">-${((calc.isAutoMode || calc.isDeductionApplied) ? calc.halfDayDeduction : 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            ` : `
            <tr>
              <td colspan="2" style="color: #7c3aed; font-style: italic;">Leave deductions included in per-day calculation</td>
            </tr>
            `}
            <tr style="background: #fef2f2;">
              <td><strong>Total Deductions</strong></td>
              <td class="amount deductions"><strong>-${(calc.isPerDaySalaryType ? 0 : calc.actualDeduction).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="net-salary">
        <div>
          <div class="label">Net Payable Salary</div>
          <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
            ${calc.isPerDaySalaryType 
              ? `₹${calc.effectivePerDaySalary.toLocaleString('en-IN')} × ${calc.workingDays - ((calc.isAutoMode || calc.isDeductionApplied) ? calc.unpaidLeaveDays + (calc.halfDayLeaveDays * 0.5) : 0)} days + ₹${calc.totalCommission.toLocaleString('en-IN')}`
              : `₹${calc.baseSalary.toLocaleString('en-IN')} - ₹${calc.actualDeduction.toLocaleString('en-IN')} + ₹${calc.totalCommission.toLocaleString('en-IN')}`
            }
          </div>
        </div>
        <div class="amount">₹${calc.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      </div>

      ${calc.monthLeaves.length > 0 ? `
      <div class="salary-section">
        <h3>📅 Leave Summary</h3>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Days</th>
              <th class="amount">Deduction</th>
            </tr>
          </thead>
          <tbody>
            ${calc.monthLeaves.map(leave => {
              const deduction = leave.leaveType === 'unpaid' ? leave.totalDays * calc.effectivePerDaySalary : leave.leaveType === 'half_day' ? leave.totalDays * calc.effectivePerDaySalary * 0.5 : 0;
              return `
              <tr>
                <td>${new Date(leave.fromDate).toLocaleDateString('en-IN')}</td>
                <td style="text-transform: capitalize;">${leave.leaveType.replace('_', ' ')}</td>
                <td>${leave.totalDays}</td>
                <td class="amount ${deduction > 0 ? 'deductions' : ''}">${deduction > 0 ? `-₹${deduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${calc.monthCommissions.length > 0 ? `
      <div class="salary-section">
        <h3>💼 Commission Details</h3>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Source</th>
              <th>Sale Amount</th>
              <th class="amount">Commission</th>
            </tr>
          </thead>
          <tbody>
            ${calc.monthCommissions.map(comm => `
              <tr>
                <td>${comm.invoiceNumber}</td>
                <td style="text-transform: capitalize;">${comm.commissionSource.replace('_', ' ')}</td>
                <td>₹${comm.saleAmount.toLocaleString('en-IN')}</td>
                <td class="amount earnings">+₹${comm.commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
    </div>

    <!-- Authorization Footer -->
    <div class="auth-footer">
      <div class="auth-footer-content">
        <!-- Left Side - Company Stamp -->
        <div class="auth-section">
          ${authDetails.companyStamp 
            ? `<div class="stamp-box circular"><img src="${authDetails.companyStamp}" alt="Company Stamp" /></div>`
            : '<div style="height: 80px;"></div>'
          }
          <div class="auth-label">Company Stamp</div>
          <div class="auth-name">${authDetails.companyName}</div>
        </div>
        
        <!-- Right Side - Authorized Signature -->
        <div class="auth-section">
          ${authDetails.authorizedSignature 
            ? `<div class="signature-box"><img src="${authDetails.authorizedSignature}" alt="Authorized Signature" /></div>`
            : '<div style="height: 80px;"></div>'
          }
          <div class="divider-line"></div>
          <div class="auth-label">Authorized Signatory</div>
          <div class="auth-name">${authDetails.authorizedSignatory}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Download Payslip as PDF
 * ENFORCES PDF-ONLY DOWNLOAD - No HTML or other formats
 * Uses the centralized PDF service for consistent output
 * 
 * @param data - Payslip data including employee, leaves, commissions, etc.
 */
export async function downloadPayslip(data: PayslipData): Promise<void> {
  // Import the PDF service dynamically to avoid circular dependencies
  const { downloadPayslipPDF } = await import('./pdfService');
  
  try {
    await downloadPayslipPDF(data);
  } catch (error) {
    console.error('Failed to generate payslip PDF:', error);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 * Opens payslip in print dialog (still generates PDF via browser print)
 * @deprecated Use downloadPayslip() for direct PDF download
 */
export function printPayslip(data: PayslipData): void {
  const html = generatePayslipHTML(data);
  
  // Create blob and open in new window for printing
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
  
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
