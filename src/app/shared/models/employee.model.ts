export interface Employee {
  id: number;
  name: string;
  email: string;
  departmentId: number;
  
  // Personal Information (Optional)
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date | string;
  
  // Employment Information
  position?: string;
  hireDate?: Date | string;
  
  // Additional Optional Fields
  emergencyContact?: string;
  emergencyContactPhone?: string;
  employmentType?: 'Full-Time' | 'Part-Time' | 'Contract';
  status?: 'Active' | 'On-Leave' | 'Terminated';
}