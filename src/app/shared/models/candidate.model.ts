export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  appliedPosition: string;
  appliedDepartmentId?: number;
  resume?: string;
  status?: 'Applied' | 'Interviewed' | 'Hired' | 'Rejected';
  applicationDate?: Date | string;
}