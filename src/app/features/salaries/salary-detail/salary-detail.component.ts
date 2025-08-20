import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalaryService } from '../../../core/services/salary.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Salary, Employee } from '../../../shared/models';

@Component({
  selector: 'app-salary-detail',
  templateUrl: './salary-detail.component.html',
  styleUrls: ['./salary-detail.component.scss']
})
export class SalaryDetailComponent implements OnInit {
  salary: Salary | null = null;
  employee: Employee | null = null;
  salaryHistory: Salary[] = [];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salaryService: SalaryService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSalary(+id);
    }
  }

  loadSalary(id: number): void {
    this.isLoading = true;
    this.salaryService.getSalary(id).subscribe({
      next: (salary) => {
        this.salary = salary;
        console.log(salary);
        this.loadEmployee(salary.employeeId);
        this.loadSalaryHistory(salary.employeeId);
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load salary record');
        this.isLoading = false;
      }
    });
  }

  loadEmployee(employeeId: number): void {
    this.employeeService.getEmployee(employeeId).subscribe({
      next: (employee) => {
        this.employee = employee;
      },
      error: () => this.showError('Failed to load employee data')
    });
  }

  loadSalaryHistory(employeeId: number): void {
    this.salaryService.getSalariesByEmployee(employeeId).subscribe({
      next: (salaries) => {
        this.salaryHistory = salaries
          .filter(s => s.id !== (this.salary? this.salary.id : null)) // Exclude current salary
          .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
      },
      error: () => this.showError('Failed to load salary history')
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}