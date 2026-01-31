// Firebase Employees Service - Real-time Employee Management
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../../firebase.config';
import { Employee, EmployeeLeave, EmployeeCommission, LeaveDeductionRecord, SalaryRateAuditLog } from '../../types';

// Firebase Employee Document Structure
export interface FirebaseEmployee {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: 'production' | 'design' | 'sales' | 'management';
  baseSalary: number;
  netSalary: number;
  salaryType: 'monthly' | 'per_day';
  status: 'active' | 'on_leave' | 'inactive';
  commission: number;
  joiningDate: string;
  // Additional fields
  employeeId?: string;
  address?: string;
  emergencyContact?: string;
  skills?: string[];
  experience?: string;
  workingDaysPerMonth?: number;
  annualLeaves?: number;
  customPerDaySalary?: number;
  perDaySalaryEffectiveFrom?: string;
  overtimeRate?: number;
  overtimeRateType?: 'per_hour' | 'per_day';
  avatar?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface EmployeeFilters {
  department?: string;
  status?: string;
  search?: string;
}

export class EmployeesService {
  private static readonly COLLECTION = 'employees';
  private static readonly LEAVES_COLLECTION = 'employee_leaves';
  private static readonly COMMISSIONS_COLLECTION = 'employee_commissions';
  private static readonly DEDUCTIONS_COLLECTION = 'leave_deductions';
  private static readonly AUDIT_LOGS_COLLECTION = 'salary_audit_logs';

  // ==================== EMPLOYEE CRUD ====================

  // Create new employee
  static async createEmployee(employeeData: Omit<FirebaseEmployee, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check email uniqueness
      const emailExists = await this.checkEmailExists(employeeData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      const docData = {
        ...employeeData,
        netSalary: employeeData.baseSalary,
        commission: employeeData.commission || 0,
        workingDaysPerMonth: employeeData.workingDaysPerMonth || 26,
        annualLeaves: employeeData.annualLeaves || 24,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Creating employee with data:', docData);
      const docRef = await addDoc(collection(db, this.COLLECTION), docData);
      console.log('Employee created with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check if you are logged in as admin.');
      }
      throw error;
    }
  }

  // Check if email exists
  static async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(collection(db, this.COLLECTION), where('email', '==', email));
      const snapshot = await getDocs(q);
      if (excludeId) {
        return snapshot.docs.some(doc => doc.id !== excludeId);
      }
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  // Get all employees - without orderBy to avoid index issues
  static async getEmployees(filters: EmployeeFilters = {}): Promise<Employee[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));

      let employees: Employee[] = snapshot.docs.map(doc => this.mapDocToEmployee(doc));

      // Apply filters
      if (filters.department && filters.department !== 'All') {
        const dept = filters.department.toLowerCase();
        employees = employees.filter(e => e.department === dept);
      }
      if (filters.status) {
        employees = employees.filter(e => e.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        employees = employees.filter(e =>
          e.name.toLowerCase().includes(searchLower) ||
          e.position.toLowerCase().includes(searchLower) ||
          e.email.toLowerCase().includes(searchLower)
        );
      }

      // Sort by joinDate descending
      employees.sort((a, b) => b.joinDate.localeCompare(a.joinDate));

      return employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new Error('Failed to fetch employees');
    }
  }

  // Get single employee
  static async getEmployee(employeeId: string): Promise<Employee | null> {
    try {
      const docRef = doc(db, this.COLLECTION, employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return this.mapDocToEmployee(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw new Error('Failed to fetch employee');
    }
  }

  // Update employee
  static async updateEmployee(employeeId: string, updates: Partial<FirebaseEmployee>): Promise<void> {
    try {
      // Check email uniqueness if email is being updated
      if (updates.email) {
        const emailExists = await this.checkEmailExists(updates.email, employeeId);
        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      // Filter out undefined values - Firestore doesn't accept undefined
      const cleanUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      }

      const docRef = doc(db, this.COLLECTION, employeeId);
      await updateDoc(docRef, {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // Delete employee
  static async deleteEmployee(employeeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, employeeId);
      await deleteDoc(docRef);

      // Also delete related data
      await this.deleteEmployeeRelatedData(employeeId);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
    }
  }

  // Delete related data when employee is deleted
  private static async deleteEmployeeRelatedData(employeeId: string): Promise<void> {
    try {
      // Delete leaves
      const leavesQuery = query(collection(db, this.LEAVES_COLLECTION), where('employeeId', '==', employeeId));
      const leavesSnapshot = await getDocs(leavesQuery);
      for (const doc of leavesSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Delete commissions
      const commissionsQuery = query(collection(db, this.COMMISSIONS_COLLECTION), where('employeeId', '==', employeeId));
      const commissionsSnapshot = await getDocs(commissionsQuery);
      for (const doc of commissionsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }
    } catch (error) {
      console.error('Error deleting related data:', error);
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  // Subscribe to employees (real-time) - without orderBy to avoid index issues
  static subscribeToEmployees(callback: (employees: Employee[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.COLLECTION);
      console.log('Setting up employees subscription...');

      return onSnapshot(collectionRef,
        (snapshot) => {
          console.log('Employees snapshot received, docs count:', snapshot.docs.length);
          const employees = snapshot.docs.map(doc => {
            const mapped = this.mapDocToEmployee(doc);
            console.log('Mapped employee:', mapped.name, mapped.id);
            return mapped;
          });
          // Sort client-side to avoid index requirement
          employees.sort((a, b) => b.joinDate.localeCompare(a.joinDate));
          callback(employees);
        },
        (error) => {
          console.error('Error in employees subscription:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          // Try fetching without real-time as fallback
          this.getEmployeesSimple().then(callback).catch(() => callback([]));
        }
      );
    } catch (error) {
      console.error('Error setting up subscription:', error);
      callback([]);
      return () => { };
    }
  }

  // Simple get employees without ordering (fallback)
  private static async getEmployeesSimple(): Promise<Employee[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));
      return snapshot.docs.map(doc => this.mapDocToEmployee(doc));
    } catch (error) {
      console.error('Error in simple fetch:', error);
      return [];
    }
  }

  // ==================== EMPLOYEE STATUS ====================

  // Update employee status (for leave management)
  static async updateEmployeeStatus(employeeId: string, status: 'active' | 'on_leave' | 'inactive'): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, employeeId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Failed to update employee status');
    }
  }

  // ==================== SALARY & COMMISSION ====================

  // Update salary and commission
  static async updateSalaryAndCommission(
    employeeId: string,
    baseSalary: number,
    netSalary: number,
    commission: number
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, employeeId);
      await updateDoc(docRef, {
        baseSalary,
        netSalary,
        commission,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating salary:', error);
      throw new Error('Failed to update salary');
    }
  }

  // Update department and position
  static async updateDepartmentAndPosition(
    employeeId: string,
    department: 'production' | 'design' | 'sales' | 'management',
    position: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, employeeId);
      await updateDoc(docRef, {
        department,
        position,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating department:', error);
      throw new Error('Failed to update department');
    }
  }

  // ==================== STATISTICS ====================

  // Get employee statistics
  static async getEmployeeStats(): Promise<{
    total: number;
    production: number;
    design: number;
    sales: number;
    management: number;
    onLeave: number;
    active: number;
  }> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));

      let total = 0;
      let production = 0;
      let design = 0;
      let sales = 0;
      let management = 0;
      let onLeave = 0;
      let active = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        total++;

        if (data.department === 'production') production++;
        else if (data.department === 'design') design++;
        else if (data.department === 'sales') sales++;
        else if (data.department === 'management') management++;

        if (data.status === 'on_leave') onLeave++;
        else if (data.status === 'active') active++;
      });

      return { total, production, design, sales, management, onLeave, active };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { total: 0, production: 0, design: 0, sales: 0, management: 0, onLeave: 0, active: 0 };
    }
  }

  // ==================== HELPER METHODS ====================

  // Map Firestore document to Employee type
  private static mapDocToEmployee(doc: any): Employee {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.fullName || data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      position: data.position || '',
      department: data.department || 'production',
      salary: data.baseSalary || data.salary || 0,
      status: data.status === 'inactive' ? 'on_leave' : (data.status || 'active'),
      joinDate: data.joiningDate || data.joinDate || new Date().toISOString().split('T')[0],
      avatar: data.avatar,
      workingDaysPerMonth: data.workingDaysPerMonth || 26,
      annualLeaves: data.annualLeaves || 24,
      salaryType: data.salaryType || 'monthly',
      customPerDaySalary: data.customPerDaySalary,
      perDaySalaryEffectiveFrom: data.perDaySalaryEffectiveFrom,
      overtimeRate: data.overtimeRate,
      overtimeRateType: data.overtimeRateType,
    };
  }

  // ==================== LEAVES MANAGEMENT ====================

  // Add leave
  static async addLeave(leave: Omit<EmployeeLeave, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.LEAVES_COLLECTION), {
        ...leave,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding leave:', error);
      throw new Error('Failed to add leave');
    }
  }

  // Get leaves for employee - without orderBy
  static async getEmployeeLeaves(employeeId: string): Promise<EmployeeLeave[]> {
    try {
      const q = query(
        collection(db, this.LEAVES_COLLECTION),
        where('employeeId', '==', employeeId)
      );
      const snapshot = await getDocs(q);
      const leaves = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmployeeLeave));
      // Sort client-side
      leaves.sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || ''));
      return leaves;
    } catch (error) {
      console.error('Error fetching leaves:', error);
      return [];
    }
  }

  // Get all leaves
  static async getAllLeaves(): Promise<EmployeeLeave[]> {
    try {
      const snapshot = await getDocs(collection(db, this.LEAVES_COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmployeeLeave));
    } catch (error) {
      console.error('Error fetching all leaves:', error);
      return [];
    }
  }

  // Update leave status
  static async updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      const docRef = doc(db, this.LEAVES_COLLECTION, leaveId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Error updating leave status:', error);
      throw new Error('Failed to update leave status');
    }
  }

  // Delete leave record
  static async deleteLeave(leaveId: string): Promise<void> {
    try {
      const docRef = doc(db, this.LEAVES_COLLECTION, leaveId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting leave:', error);
      throw new Error('Failed to delete leave record');
    }
  }

  // Subscribe to leaves (real-time) - without orderBy
  static subscribeToLeaves(callback: (leaves: EmployeeLeave[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.LEAVES_COLLECTION);

      return onSnapshot(collectionRef,
        (snapshot) => {
          const leaves = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as EmployeeLeave));
          // Sort client-side
          leaves.sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || ''));
          callback(leaves);
        },
        (error) => {
          console.error('Error in leaves subscription:', error);
          // Fallback to simple fetch
          this.getAllLeaves().then(callback).catch(() => callback([]));
        }
      );
    } catch (error) {
      console.error('Error setting up leaves subscription:', error);
      callback([]);
      return () => { };
    }
  }

  // ==================== COMMISSIONS MANAGEMENT ====================

  // Add commission
  static async addCommission(commission: Omit<EmployeeCommission, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COMMISSIONS_COLLECTION), {
        ...commission,
        createdAt: serverTimestamp()
      });

      // Update employee's total commission
      await this.updateEmployeeCommissionTotal(commission.employeeId);

      return docRef.id;
    } catch (error) {
      console.error('Error adding commission:', error);
      throw new Error('Failed to add commission');
    }
  }

  // Update employee's total commission
  private static async updateEmployeeCommissionTotal(employeeId: string): Promise<void> {
    try {
      const commissions = await this.getEmployeeCommissions(employeeId);
      const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

      const docRef = doc(db, this.COLLECTION, employeeId);
      await updateDoc(docRef, {
        commission: totalCommission,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating commission total:', error);
    }
  }

  // Get commissions for employee
  static async getEmployeeCommissions(employeeId: string): Promise<EmployeeCommission[]> {
    try {
      const q = query(
        collection(db, this.COMMISSIONS_COLLECTION),
        where('employeeId', '==', employeeId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmployeeCommission));
    } catch (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }
  }

  // Get all commissions
  static async getAllCommissions(): Promise<EmployeeCommission[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COMMISSIONS_COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmployeeCommission));
    } catch (error) {
      console.error('Error fetching all commissions:', error);
      return [];
    }
  }

  // Subscribe to commissions (real-time) - without orderBy
  static subscribeToCommissions(callback: (commissions: EmployeeCommission[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.COMMISSIONS_COLLECTION);

      return onSnapshot(collectionRef,
        (snapshot) => {
          const commissions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as EmployeeCommission));
          // Sort by date descending
          commissions.sort((a, b) => (b.commissionDate || '').localeCompare(a.commissionDate || ''));
          callback(commissions);
        },
        (error) => {
          console.error('Error in commissions subscription:', error);
          this.getAllCommissions().then(callback).catch(() => callback([]));
        }
      );
    } catch (error) {
      console.error('Error setting up commissions subscription:', error);
      callback([]);
      return () => { };
    }
  }

  // ==================== DEDUCTION RECORDS ====================

  // Add deduction record
  static async addDeductionRecord(record: Omit<LeaveDeductionRecord, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.DEDUCTIONS_COLLECTION), {
        ...record,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding deduction record:', error);
      throw new Error('Failed to add deduction record');
    }
  }

  // Get deduction records
  static async getDeductionRecords(): Promise<LeaveDeductionRecord[]> {
    try {
      const snapshot = await getDocs(collection(db, this.DEDUCTIONS_COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveDeductionRecord));
    } catch (error) {
      console.error('Error fetching deduction records:', error);
      return [];
    }
  }

  // Update deduction record
  static async updateDeductionRecord(recordId: string, updates: Partial<LeaveDeductionRecord>): Promise<void> {
    try {
      const docRef = doc(db, this.DEDUCTIONS_COLLECTION, recordId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating deduction record:', error);
      throw new Error('Failed to update deduction record');
    }
  }

  // Subscribe to deduction records (real-time) - without orderBy
  static subscribeToDeductionRecords(callback: (records: LeaveDeductionRecord[]) => void): Unsubscribe {
    try {
      const collectionRef = collection(db, this.DEDUCTIONS_COLLECTION);

      return onSnapshot(collectionRef,
        (snapshot) => {
          const records = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as LeaveDeductionRecord));
          callback(records);
        },
        (error) => {
          console.error('Error in deduction records subscription:', error);
          this.getDeductionRecords().then(callback).catch(() => callback([]));
        }
      );
    } catch (error) {
      console.error('Error setting up deduction records subscription:', error);
      callback([]);
      return () => { };
    }
  }

  // ==================== SALARY AUDIT LOGS ====================

  // Add salary audit log
  static async addSalaryAuditLog(log: Omit<SalaryRateAuditLog, 'id'>): Promise<string> {
    try {
      // Remove undefined fields to prevent Firebase errors
      const cleanLog: any = {
        employeeId: log.employeeId,
        employeeName: log.employeeName,
        changedBy: log.changedBy,
        changeType: log.changeType,
        effectiveFrom: log.effectiveFrom,
        createdAt: serverTimestamp()
      };

      // Only add fields if they have values (not undefined)
      if (log.previousSalary !== undefined) cleanLog.previousSalary = log.previousSalary;
      if (log.newSalary !== undefined) cleanLog.newSalary = log.newSalary;
      if (log.previousSalaryType !== undefined) cleanLog.previousSalaryType = log.previousSalaryType;
      if (log.newSalaryType !== undefined) cleanLog.newSalaryType = log.newSalaryType;
      if (log.previousPerDayRate !== undefined) cleanLog.previousPerDayRate = log.previousPerDayRate;
      if (log.newPerDayRate !== undefined) cleanLog.newPerDayRate = log.newPerDayRate;
      if (log.reason !== undefined) cleanLog.reason = log.reason;

      const docRef = await addDoc(collection(db, this.AUDIT_LOGS_COLLECTION), cleanLog);
      return docRef.id;
    } catch (error) {
      console.error('Error adding audit log:', error);
      throw new Error('Failed to add audit log');
    }
  }

  // Get salary audit logs
  static async getSalaryAuditLogs(employeeId?: string): Promise<SalaryRateAuditLog[]> {
    try {
      let q;
      if (employeeId) {
        q = query(
          collection(db, this.AUDIT_LOGS_COLLECTION),
          where('employeeId', '==', employeeId)
        );
      } else {
        q = query(collection(db, this.AUDIT_LOGS_COLLECTION));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SalaryRateAuditLog));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }
}
