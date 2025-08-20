// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { SalaryService } from '../../../core/services/salary.service';
import { Employee, Department, Candidate, Salary } from '../../../shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';

interface DashboardMetrics {
  totalEmployees: number;
  totalDepartments: number;
  totalCandidates: number;
  activeCandidates: number;
  totalPayroll: number;
  averageSalary: number;
  departmentStats: { name: string; count: number; budget: number }[];
  recentHires: Employee[];
  upcomingAnniversaries: Employee[];
  candidateStatus: { status: string; count: number }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  metrics: DashboardMetrics = {
    totalEmployees: 0,
    totalDepartments: 0,
    totalCandidates: 0,
    activeCandidates: 0,
    totalPayroll: 0,
    averageSalary: 0,
    departmentStats: [],
    recentHires: [],
    upcomingAnniversaries: [],
    candidateStatus: []
  };

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private candidateService: CandidateService,
    private salaryService: SalaryService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin([
      this.employeeService.getEmployees(),
      this.departmentService.getDepartments(),
      this.candidateService.getCandidates(),
      this.salaryService.getSalaries()
    ])
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: ( [employees, departments, candidates, salaries ]) => {
        this.calculateMetrics(employees, departments, candidates, salaries);
      },
      error: () => this.showError('Failed to load dashboard data')
    });
  }

  calculateMetrics(
    employees: Employee[], 
    departments: Department[], 
    candidates: Candidate[], 
    salaries: Salary[]
  ): void {
    // Basic counts
    this.metrics.totalEmployees = employees.length;
    this.metrics.totalDepartments = departments.length;
    this.metrics.totalCandidates = candidates.length;
    this.metrics.activeCandidates = candidates.filter(c => 
      c.status === 'Applied' || c.status === 'Interviewed'
    ).length;

    // Salary calculations
    const totalSalary = salaries.reduce((sum, salary) => sum + (salary.baseAmount || 0), 0);
    this.metrics.totalPayroll = totalSalary;
    this.metrics.averageSalary = salaries.length > 0 ? totalSalary / salaries.length : 0;

    // Department statistics
    this.metrics.departmentStats = departments.map(dept => ({
      name: dept.name,
      count: employees.filter(emp => emp.departmentId === dept.id).length,
      budget: dept.budget || 0
    }));

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.metrics.recentHires = employees
      .filter(emp => emp.hireDate && new Date(emp.hireDate) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime())
      .slice(0, 5);

    // Upcoming anniversaries (next 30 days)
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    this.metrics.upcomingAnniversaries = employees
      .filter(emp => {
        if (!emp.hireDate) return false;
        const hireDate = new Date(emp.hireDate);
        const thisYearAnniversary = new Date(today.getFullYear(), hireDate.getMonth(), hireDate.getDate());
        return thisYearAnniversary >= today && thisYearAnniversary <= next30Days;
      })
      .sort((a, b) => new Date(a.hireDate!).getTime() - new Date(b.hireDate!).getTime())
      .slice(0, 5);

    // Candidate status breakdown
    const statusCounts = candidates.reduce((acc, candidate) => {
      const status = candidate.status || 'Applied';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.metrics.candidateStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getDaysUntilAnniversary(hireDate: string | Date): number {
    const today = new Date();
    const anniversary = new Date(hireDate);
    anniversary.setFullYear(today.getFullYear());
    
    const diffTime = anniversary.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}