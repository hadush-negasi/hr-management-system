export interface Department {
  id: number;
  name: string;
  location: string;
  budget?: number;
  managerId?: number;
  description?: string;
}