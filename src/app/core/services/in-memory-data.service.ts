import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  genId<T extends { id: number }>(collection: T[]): number {
    return collection.length > 0 ? Math.max(...collection.map(item => item.id)) + 1 : 1;
  }

  createDb() {
    const departments = [
      { id: 1, name: 'Human Resources', location: 'Floor 1', budget: 500000, managerId: 1, description: 'Handles HR operations' },
      { id: 2, name: 'Information Technology', location: 'Floor 2', budget: 800000, managerId: 2, description: 'Tech infrastructure' },
      { id: 3, name: 'Finance', location: 'Floor 3', budget: 600000, managerId: 3, description: 'Manages company finances' },
      { id: 4, name: 'Marketing', location: 'Floor 4', budget: 400000, managerId: 4, description: 'Handles promotions & branding' },
      { id: 5, name: 'Sales', location: 'Floor 5', budget: 450000, managerId: 5, description: 'Drives revenue through sales' },
      { id: 6, name: 'Operations', location: 'Floor 6', budget: 700000, managerId: 6, description: 'Ensures daily operations' },
      { id: 7, name: 'Customer Support', location: 'Floor 7', budget: 300000, managerId: 7, description: 'Handles client support' },
      { id: 8, name: 'R&D', location: 'Floor 8', budget: 1000000, managerId: 8, description: 'Research and development' }
    ];

    const employees = [
      { id: 1, name: 'John Doe', email: 'john@hr.com', departmentId: 1, position: 'HR Manager', hireDate: '2020-01-15', phoneNumber: '555-0101', address: '123 Main St, City, State', dateOfBirth: '1985-05-15', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Jane Doe', emergencyContactPhone: '555-0102' },
      { id: 2, name: 'Jane Smith', email: 'jane@it.com', departmentId: 2, position: 'IT Director', hireDate: '2019-05-20', phoneNumber: '555-0103', address: '234 Oak St, City, State', dateOfBirth: '1983-03-22', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'John Smith', emergencyContactPhone: '555-0104' },
      { id: 3, name: 'Michael Johnson', email: 'michael@hr.com', departmentId: 1, position: 'Recruiter', hireDate: '2021-04-10', phoneNumber: '555-0105', address: '456 Pine St, City, State', dateOfBirth: '1990-07-12', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Sarah Johnson', emergencyContactPhone: '555-0106' },
      { id: 4, name: 'Emily Davis', email: 'emily@it.com', departmentId: 2, position: 'Software Engineer', hireDate: '2022-02-15', phoneNumber: '555-0107', address: '789 Maple Ave, City, State', dateOfBirth: '1995-11-08', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'James Davis', emergencyContactPhone: '555-0108' },
      { id: 5, name: 'Robert Brown', email: 'robert@finance.com', departmentId: 3, position: 'Accountant', hireDate: '2018-08-05', phoneNumber: '555-0109', address: '321 Elm St, City, State', dateOfBirth: '1987-02-20', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Laura Brown', emergencyContactPhone: '555-0110' },
      { id: 6, name: 'Sophia Wilson', email: 'sophia@marketing.com', departmentId: 4, position: 'Marketing Specialist', hireDate: '2021-06-01', phoneNumber: '555-0111', address: '654 Cedar St, City, State', dateOfBirth: '1993-09-25', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'David Wilson', emergencyContactPhone: '555-0112' },
      { id: 7, name: 'James Taylor', email: 'james@it.com', departmentId: 2, position: 'System Administrator', hireDate: '2017-12-10', phoneNumber: '555-0113', address: '987 Birch St, City, State', dateOfBirth: '1989-06-14', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Olivia Taylor', emergencyContactPhone: '555-0114' },
      { id: 8, name: 'Olivia Martinez', email: 'olivia@hr.com', departmentId: 1, position: 'HR Assistant', hireDate: '2023-01-05', phoneNumber: '555-0115', address: '246 Walnut St, City, State', dateOfBirth: '1997-12-03', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Daniel Martinez', emergencyContactPhone: '555-0116' },
      { id: 9, name: 'William Anderson', email: 'william@finance.com', departmentId: 3, position: 'Financial Analyst', hireDate: '2020-09-14', phoneNumber: '555-0117', address: '135 Spruce St, City, State', dateOfBirth: '1992-04-18', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Emma Anderson', emergencyContactPhone: '555-0118' },
      { id: 10, name: 'Isabella Thomas', email: 'isabella@marketing.com', departmentId: 4, position: 'Content Creator', hireDate: '2021-11-12', phoneNumber: '555-0119', address: '864 Cherry St, City, State', dateOfBirth: '1994-08-09', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Lucas Thomas', emergencyContactPhone: '555-0120' },
      { id: 11, name: 'Benjamin Lee', email: 'benjamin@it.com', departmentId: 2, position: 'DevOps Engineer', hireDate: '2019-07-20', phoneNumber: '555-0121', address: '753 Fir St, City, State', dateOfBirth: '1991-10-01', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Sophia Lee', emergencyContactPhone: '555-0122' },
      { id: 12, name: 'Mia Harris', email: 'mia@hr.com', departmentId: 1, position: 'HR Coordinator', hireDate: '2022-05-09', phoneNumber: '555-0123', address: '369 Poplar St, City, State', dateOfBirth: '1996-02-14', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Ethan Harris', emergencyContactPhone: '555-0124' },
      { id: 13, name: 'Ethan Clark', email: 'ethan@finance.com', departmentId: 3, position: 'Auditor', hireDate: '2020-03-28', phoneNumber: '555-0125', address: '147 Ash St, City, State', dateOfBirth: '1988-07-11', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Grace Clark', emergencyContactPhone: '555-0126' },
      { id: 14, name: 'Charlotte Lewis', email: 'charlotte@marketing.com', departmentId: 4, position: 'SEO Specialist', hireDate: '2021-09-15', phoneNumber: '555-0127', address: '258 Magnolia St, City, State', dateOfBirth: '1995-05-06', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Henry Lewis', emergencyContactPhone: '555-0128' },
      { id: 15, name: 'Alexander Walker', email: 'alexander@it.com', departmentId: 2, position: 'Frontend Developer', hireDate: '2018-10-25', phoneNumber: '555-0129', address: '369 Palm St, City, State', dateOfBirth: '1993-01-30', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Ella Walker', emergencyContactPhone: '555-0130' },
      { id: 16, name: 'Amelia Hall', email: 'amelia@finance.com', departmentId: 3, position: 'Payroll Specialist', hireDate: '2019-06-19', phoneNumber: '555-0131', address: '951 Willow St, City, State', dateOfBirth: '1990-12-22', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Jack Hall', emergencyContactPhone: '555-0132' },
      { id: 17, name: 'Daniel Allen', email: 'daniel@marketing.com', departmentId: 4, position: 'Brand Manager', hireDate: '2020-12-08', phoneNumber: '555-0133', address: '753 Dogwood St, City, State', dateOfBirth: '1989-09-03', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Zoe Allen', emergencyContactPhone: '555-0134' },
      { id: 18, name: 'Harper Young', email: 'harper@hr.com', departmentId: 1, position: 'Training Coordinator', hireDate: '2021-03-30', phoneNumber: '555-0135', address: '159 Redwood St, City, State', dateOfBirth: '1994-04-27', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Leo Young', emergencyContactPhone: '555-0136' },
      { id: 19, name: 'Matthew King', email: 'matthew@it.com', departmentId: 2, position: 'Backend Developer', hireDate: '2022-07-11', phoneNumber: '555-0137', address: '357 Sycamore St, City, State', dateOfBirth: '1997-08-17', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Chloe King', emergencyContactPhone: '555-0138' },
      { id: 20, name: 'Ava Wright', email: 'ava@finance.com', departmentId: 3, position: 'Treasury Analyst', hireDate: '2023-02-22', phoneNumber: '555-0139', address: '753 Beech St, City, State', dateOfBirth: '1998-06-29', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Noah Wright', emergencyContactPhone: '555-0140' },
      { id: 21, name: 'Logan Scott', email: 'logan@marketing.com', departmentId: 4, position: 'Digital Strategist', hireDate: '2021-10-18', phoneNumber: '555-0141', address: '951 Hickory St, City, State', dateOfBirth: '1995-01-19', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Mila Scott', emergencyContactPhone: '555-0142' },
      { id: 22, name: 'Abigail Green', email: 'abigail@it.com', departmentId: 2, position: 'QA Engineer', hireDate: '2020-08-07', phoneNumber: '555-0143', address: '159 Linden St, City, State', dateOfBirth: '1996-03-02', employmentType: 'Full-Time', status: 'Active', emergencyContact: 'Mason Green', emergencyContactPhone: '555-0144' }
    ];


    const candidates = [
      { id: 1, name: 'Alice Johnson', email: 'alice@test.com', phone: '555-0111', appliedPosition: 'HR Assistant', appliedDepartmentId: 1, status: 'Interviewed', applicationDate: '2023-03-10', resume: 'https://example.com/resumes/alice-johnson.pdf' },
      { id: 2, name: 'Mark Lee', email: 'mark@test.com', phone: '555-0112', appliedPosition: 'Software Engineer', appliedDepartmentId: 2, status: 'Applied', applicationDate: '2023-04-12' },
      { id: 3, name: 'Rachel Green', email: 'rachel@test.com', phone: '555-0113', appliedPosition: 'Accountant', appliedDepartmentId: 3, status: 'Rejected', applicationDate: '2023-02-28' },
      { id: 4, name: 'David Kim', email: 'david@test.com', phone: '555-0114', appliedPosition: 'Marketing Coordinator', appliedDepartmentId: 4, status: 'Interview Scheduled', applicationDate: '2023-06-15' },
      { id: 5, name: 'Laura White', email: 'laura@test.com', phone: '555-0115', appliedPosition: 'Sales Associate', appliedDepartmentId: 5, status: 'Hired', applicationDate: '2023-01-20' }
    ];

    const salaries = [
      { id: 1, employeeId: 1, baseAmount: 75000, paymentFrequency: 'Monthly', effectiveDate: '2023-01-01', previousSalaryId: null, adjustmentType: 'raise', notes: 'Annual raise' },
      { id: 2, employeeId: 2, baseAmount: 95000, bonus: 10000, paymentFrequency: 'Monthly', effectiveDate: '2023-01-01', previousSalaryId: null },
      { id: 3, employeeId: 3, baseAmount: 85000, paymentFrequency: 'Monthly', effectiveDate: '2022-07-01', previousSalaryId: null, adjustmentType: 'promotion' },
      { id: 4, employeeId: 4, baseAmount: 40000, bonus: 5000, paymentFrequency: 'Monthly', effectiveDate: '2023-02-15', previousSalaryId: null },
      { id: 5, employeeId: 5, baseAmount: 88000, paymentFrequency: 'Monthly', effectiveDate: '2021-09-01', previousSalaryId: null, notes: 'No bonus included' },
      { id: 6, employeeId: 6, baseAmount: 70000, paymentFrequency: 'Monthly', effectiveDate: '2020-03-01', previousSalaryId: null, adjustmentType: 'cost-of-living' },
      { id: 7, employeeId: 7, baseAmount: 50000, paymentFrequency: 'Monthly', effectiveDate: '2023-06-01', previousSalaryId: null },
      { id: 8, employeeId: 8, baseAmount: 110000, bonus: 15000, paymentFrequency: 'Monthly', effectiveDate: '2022-12-01', previousSalaryId: null, adjustmentType: 'performance' }
    ];

    return { departments, employees, candidates, salaries };
  }
}
