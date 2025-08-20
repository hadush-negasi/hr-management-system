import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Department } from '../../shared/models';
import { EmployeeService } from './employee.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'api/departments';

  constructor(
    private http: HttpClient,
    private employeeService: EmployeeService
  ) { }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  addDepartment(department: Department): Observable<Department> {
    // Set default values if not provided
    const departmentToAdd = {
      ...department,
      budget: department.budget || 0,
      description: department.description || ''
    };
    return this.http.post<Department>(this.apiUrl, departmentToAdd);
  }

  updateDepartment(department: Department): Observable<any> {
    return this.http.put(`${this.apiUrl}/${department.id}`, department);
  }

  deleteDepartment(id: number): Observable<Department> {
    return this.http.delete<Department>(`${this.apiUrl}/${id}`);
  }

  // Get departments with their managers
  getDepartmentsWithManagers(): Observable<(Department & { managerName: string })[]> {
    return forkJoin([
      this.getDepartments(),
      this.employeeService.getEmployees()
    ]).pipe(
      map(([departments, employees]) => {
        return departments.map(dept => {
          const manager = dept.managerId ? employees.find(e => e.id === dept.managerId) : null;
          return {
            ...dept,
            managerName: manager ? manager.name : 'Not assigned'
          };
        });
      })
    );
  }
}