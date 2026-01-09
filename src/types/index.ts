export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  material: string;
  dimensions: string;
  warranty: string;
  rating: number;
  reviews: number;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description?: string;

  // Sofa-specific properties
  sofaType?: string;
  seatingCapacity?: string;
  color?: string;
  frameMaterial?: string;
  cushionType?: string;
  usage?: string;
  customization?: string;
  availability?: string;

  // Chair-specific properties
  chairType?: string;
  chairUsage?: string;
  chairMaterial?: string;
  comfortLevel?: string;
  designStyle?: string;
  chairSeatingCapacity?: string;
  chairColor?: string;
  chairAvailability?: string;

  // Table-specific properties
  tableType?: string;
  tableMaterial?: string;
  tableShape?: string;
  tableSeating?: string;
  tableUsage?: string;
  tableStyle?: string;
  tableAvailability?: string;

  // Bedroom-specific properties
  bedroomType?: string;
  bedSize?: string;
  bedroomMaterial?: string;
  bedroomStyle?: string;
  storageOption?: string;
  bedroomColor?: string;
  bedroomAvailability?: string;

  // Curtain-specific properties
  curtainType?: string;
  curtainFabric?: string;
  lightControl?: string;
  pattern?: string;
  size?: string;
  mountingStyle?: string;
  roomType?: string;
  customOrder?: string;
}

export interface InvoiceProduct {
  id: string;
  name: string;
  category: 'Sofa' | 'Curtain' | 'Pillow' | 'Accessory';
  material: string;
  size: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  taxRate: number;
  rowTotal: number;
}

export interface CompanyDetails {
  logo?: string;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  gstNumber: string;
}

export interface CustomerDetails {
  name: string;
  mobileNumber: string;
  email?: string;
  address: string;
  gstNumber?: string;
}

export interface PaymentDetails {
  mode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  status: 'Paid' | 'Partial' | 'Pending';
  advancePaid: number;
  balanceAmount: number;
  dueDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  salespersonName: string;
  orderType: 'Ready' | 'Custom Order';
  deliveryDate?: string;

  companyDetails: CompanyDetails;
  customerDetails: CustomerDetails;
  products: InvoiceProduct[];

  subtotal: number;
  totalDiscount: number;
  gstAmount: number;
  transportCharges: number;
  grandTotal: number;
  amountInWords: string;

  paymentDetails: PaymentDetails;

  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee' | 'customer' | 'supplier';
  department?: string;
  status: 'active' | 'inactive' | 'blocked';
  lastLogin?: string;
  address?: string;
  notes?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  // Legacy fields for backward compatibility
  name?: string;
  orders?: number;
}

export interface Supplier {
  id: string;
  userId: string; // Reference to users collection
  supplierName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  supplierType: 'raw' | 'shop';
  paymentTerms: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: 'production' | 'design' | 'sales' | 'management';
  email: string;
  phone: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'on_leave';
  avatar?: string;
  // Salary & Leave Settings
  workingDaysPerMonth?: number;
  annualLeaves?: number;
  // Per-Day Salary Customization
  salaryType: 'monthly' | 'per_day';
  customPerDaySalary?: number;
  perDaySalaryEffectiveFrom?: string;
  overtimeRate?: number;
  overtimeRateType?: 'per_hour' | 'per_day';
}

// Salary Rate Change Audit Log
export interface SalaryRateAuditLog {
  id: string;
  employeeId: string;
  action: 'salary_type_changed' | 'per_day_rate_changed' | 'overtime_rate_changed';
  previousSalaryType?: 'monthly' | 'per_day';
  newSalaryType?: 'monthly' | 'per_day';
  previousPerDayRate?: number;
  newPerDayRate?: number;
  effectiveFrom: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

// Leave Management Types
export interface EmployeeLeave {
  id: string;
  employeeId: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  leaveType: 'paid' | 'unpaid' | 'sick' | 'casual' | 'half_day';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  appliedDate: string;
}

// Commission Types
export interface EmployeeCommission {
  id: string;
  employeeId: string;
  invoiceNumber: string;
  saleAmount: number;
  commissionType: 'fixed' | 'percentage';
  commissionValue: number;
  commissionAmount: number;
  commissionSource: 'sofa_sales' | 'curtain_sales' | 'custom_orders' | 'other';
  commissionDate: string;
  status: 'pending' | 'paid';
}

// Salary Calculation Types
export interface MonthlySalary {
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  workingDays: number;
  perDaySalary: number;
  // Leave Deductions
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  halfDayLeaveDays: number;
  leaveDeduction: number;
  // Commission
  totalCommission: number;
  commissionDetails: EmployeeCommission[];
  // Final
  netSalary: number;
  status: 'pending' | 'paid';
  paidDate?: string;
}

// Leave Deduction Control Types
export interface LeaveDeductionRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  deductionMode: 'automatic' | 'manual';
  isDeductionApplied: boolean;
  unpaidLeaveDays: number;
  halfDayLeaveDays: number;
  totalDeductionAmount: number;
  appliedDate?: string;
  appliedBy?: string;
}

// Audit Log for Manual Actions
export interface SalaryAuditLog {
  id: string;
  employeeId: string;
  action: 'deduction_applied' | 'deduction_reversed' | 'mode_changed';
  month: number;
  year: number;
  previousValue: number;
  newValue: number;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  status: 'in_stock' | 'low_stock' | 'critical';
}

export interface RawMaterial {
  id: string;
  name: string;
  category: 'Wood' | 'Foam' | 'Fabric' | 'Hardware' | 'Chemical';
  subCategory?: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  supplier: string;
  purchaseBillNo?: string;
  lastPurchaseDate?: string;
  lastUsedDate?: string;
  costPerUnit: number;
}

export interface ShopMaterial {
  id: string;
  name: string;
  category: 'Sofa Accessories' | 'Pillows' | 'Curtains' | 'Covers';
  currentStock: number;
  minThreshold: number;
  unit: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  color?: string;
  size?: string;
  materialType?: string;
  addedDate: string;
  lastSaleDate?: string;
  price: number;
}

export interface Payment {
  id: string;
  date: string;
  party: string;
  amount: number;
  mode: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'online';
  status: 'paid' | 'pending' | 'processing' | 'partial' | 'overdue';
  type: 'receivable' | 'payable';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image: string;
}

export interface ProcessStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
}

export interface SalesData {
  month: string;
  revenue: number;
  profit: number;
  sales: number;
}

export interface CategorySales {
  category: string;
  value: number;
  color: string;
}

// Enhanced Customer Payment Interface
export interface CustomerPayment {
  id: string;
  customerName: string;
  invoiceNumber: string;
  productType: 'Sofa' | 'Chair' | 'Bed' | 'Curtains' | 'Accessories';
  productDetails: string;
  totalBillAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentMode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
  paymentDate: string | null;
  dueDate: string;
  orderDate: string;
  customization: 'Ready-Made' | 'Custom Color' | 'Custom Fabric' | 'Made to Measure';
  gstIncluded: boolean;
  gstAmount: number;
}

// Enhanced Supplier Payment Interface
export interface SupplierPayment {
  id: string;
  partyName: string;
  materialType: 'Raw Materials' | 'Shop Materials';
  materialCategory: 'Wood' | 'Foam' | 'Fabric' | 'Springs' | 'Frames' | 'Cushions' | 'Pillows' | 'Curtains' | 'Accessories';
  materialDetails: string;
  purchaseInvoiceNumber: string;
  totalPurchaseAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentMode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'online';
  purchaseDate: string;
  dueDate: string;
  gstIncluded: boolean;
  gstAmount: number;
  paymentDate: string | null;
}

// Inquiry Types
export type InquiryStatus = 'new' | 'in_progress' | 'closed';
export type InquiryCategory = 'Sofas' | 'Chairs' | 'Tables' | 'Bedroom' | 'Curtains' | 'General';
export type PreferredContact = 'phone' | 'whatsapp' | 'email';
export type BudgetRange = '₹10,000 - ₹25,000' | '₹25,000 - ₹50,000' | '₹50,000 - ₹1,00,000' | '₹1,00,000 - ₹2,00,000' | '₹2,00,000+';

export interface Inquiry {
  id: string;
  // Customer Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Inquiry Details
  interestArea: InquiryCategory;
  budgetRange: BudgetRange;
  message?: string;
  preferredContact: PreferredContact;
  // Product Context (if from product page)
  productId?: string;
  productName?: string;
  productCategory?: string;
  productImage?: string;
  // Status & Tracking
  status: InquiryStatus;
  isViewed: boolean;
  // Admin Notes
  internalNotes?: string;
  assignedTo?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  closedAt?: string;
}

export interface InquiryNote {
  id: string;
  inquiryId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}