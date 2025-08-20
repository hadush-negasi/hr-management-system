// src/app/shared/models/salary.model.ts
export interface Salary {
  id?: number;
  employeeId: number;
  
  // Core compensation (required)
  baseAmount: number;
  
  // Optional fields
  bonus?: number;  // Can be undefined/null
  
  // Calculated fields (can be optional on input, always populated on output)
  grossAmount?: number;     // baseAmount + (bonus || 0)
  taxDeductions?: number;   // Calculated automatically
  netAmount?: number;      // grossAmount - taxDeductions
  
  // Tracking
  paymentFrequency: 'Monthly' | 'Bi-Weekly' | 'Weekly';
  effectiveDate: Date | string;
  previousSalaryId?: number;
  
  // Minimal adjustment info
  adjustmentType?: 'raise' | 'bonus' | 'correction';
  notes?: string;
}