// src/app/core/services/candidate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Candidate, Employee, Salary } from '../../shared/models';
import { DepartmentService } from './department.service';
import { EmployeeService } from './employee.service';
import { SalaryService } from './salary.service';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'api/candidates';

  constructor(
    private http: HttpClient,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private salaryService: SalaryService
  ) { }

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }

  getCandidate(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  getCandidatesByDepartment(departmentId: number): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}?appliedDepartmentId=${departmentId}`);
  }

  getCandidatesByStatus(status: string): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}?status=${status}`);
  }

  searchCandidates(term: string): Observable<Candidate[]> {
    if (!term.trim()) {
      return this.getCandidates();
    }
    return this.http.get<Candidate[]>(`${this.apiUrl}`).pipe(
      map(candidates => candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(term.toLowerCase()) ||
        candidate.appliedPosition.toLowerCase().includes(term.toLowerCase()) ||
        candidate.email.toLowerCase().includes(term.toLowerCase())
      ))
    );
  }

  addCandidate(candidate: Candidate): Observable<Candidate> {
    const candidateToAdd = {
      ...candidate,
      status: candidate.status || 'Applied',
      applicationDate: candidate.applicationDate || new Date().toISOString()
    };
    return this.http.post<Candidate>(this.apiUrl, candidateToAdd);
  }

  updateCandidateStatus(id: number, status: 'Applied' | 'Interviewed' | 'Hired' | 'Rejected'): Observable<Candidate> {
    return this.getCandidate(id).pipe(
      switchMap(candidate => {
        const updatedCandidate = { ...candidate, status };
        return this.http.put<Candidate>(`${this.apiUrl}/${id}`, updatedCandidate);
      })
    );
  }

  updateCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${candidate.id}`, candidate);
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  hireCandidate(candidateId: number, position: string, salaryDetails: {
    baseAmount: number;
    bonus?: number;
    paymentFrequency: 'Monthly' | 'Bi-Weekly' | 'Weekly';
  }): Observable<Employee> {
    return this.getCandidate(candidateId).pipe(
      switchMap(candidate => {
        if (!candidate.appliedDepartmentId) {
          throw new Error('Candidate has no applied department');
        }

        // First update the candidate status to 'Hired'
        return this.updateCandidateStatus(candidateId, 'Hired').pipe(
          switchMap(() => {
            const newEmployee: Omit<Employee, 'id'> = {
              name: candidate.name,
              email: candidate.email,
              position: position,
              departmentId: candidate.appliedDepartmentId,
              hireDate: new Date()
            };

            return this.employeeService.addEmployee(newEmployee).pipe(
              switchMap(employee => {
                const newSalary: Omit<Salary, 'id' | 'grossAmount' | 'taxDeductions' | 'netAmount'> = {
                  employeeId: employee.id,
                  baseAmount: salaryDetails.baseAmount,
                  bonus: salaryDetails.bonus,
                  paymentFrequency: salaryDetails.paymentFrequency,
                  effectiveDate: new Date().toISOString(),
                  adjustmentType: 'raise',
                  notes: `Hired from candidate ${candidateId}`
                };
                
                return this.salaryService.addSalary(newSalary).pipe(
                  map(() => employee)
                );
              })
            );
          })
        );
      })
    );
  }
}