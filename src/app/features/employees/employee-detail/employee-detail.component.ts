// src/app/features/employees/employee-detail/employee-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { SalaryService } from '../../../core/services/salary.service';
import { Employee, Department, Salary } from '../../../shared/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | undefined;
  department: Department | undefined;
  salary: Salary | undefined;
  isLoading = true;
  avatarColor: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private salaryService: SalaryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.avatarColor = this.getRandomColor();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(+id);
    }
  }

  loadEmployee(id: number): void {
    this.isLoading = true;
    this.employeeService.getEmployee(id).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.loadDepartment(employee.departmentId);
        this.loadSalary(employee.id);
        this.isLoading = false;
      },
      error: (err) => {
        this.showError('Failed to load employee details');
        this.isLoading = false;
        this.router.navigate(['/employees']);
      }
    });
  }

  loadDepartment(departmentId: number): void {
    this.departmentService.getDepartment(departmentId).subscribe({
      next: (department) => this.department = department,
      error: (err) => console.error('Failed to load department', err)
    });
  }

  loadSalary(employeeId: number): void {
    this.salaryService.getCurrentSalaryForEmployee(employeeId).subscribe({
      next: (salary) => this.salary = salary,
      error: (err) => console.error('Failed to load salary', err)
    });
  }

  onEdit(): void {
    if (this.employee) {
      this.router.navigate(['/employees/edit', this.employee.id]);
    }
  }

  onViewSalary(): void {
    if (this.salary) {
      this.router.navigate(['/salaries/edit', this.salary.id]);
    } else if (this.employee) {
      this.router.navigate(['/salaries/new'], { 
        queryParams: { employeeId: this.employee.id } 
      });
    }
  }

  onTerminate(): void {
    if (this.employee) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: 'Confirm Termination',
          message: 'Are you sure you want to terminate this employee?',
          confirmText: 'Terminate',
          cancelText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.employee) {
          const updatedEmployee: Employee = {
          ...this.employee,
          status: 'Terminated' as const // Use 'as const' to ensure type safety
        };
          this.employeeService.updateEmployee(updatedEmployee).subscribe({
            next: () => {
              this.snackBar.open('Employee terminated successfully', 'Close', { duration: 3000 });
              this.loadEmployee(this.employee!.id);
            },
            error: (err) => this.showError('Failed to terminate employee')
          });
        }
      });
    }
  }

  onReactivate(): void {
    if (this.employee) {
      const updatedEmployee: Employee = { 
        ...this.employee, 
        status: 'Active' as const // to ensure type safety
      };
      this.employeeService.updateEmployee(updatedEmployee).subscribe({
        next: () => {
          this.snackBar.open('Employee reactivated successfully', 'Close', { duration: 3000 });
          this.loadEmployee(this.employee!.id);
        },
        error: (err) => this.showError('Failed to reactivate employee')
      });
    }
  }

  onDelete(): void {
    if (this.employee) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete this employee? This action cannot be undone.',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.employeeService.deleteEmployee(this.employee!.id).subscribe({
            next: () => {
              this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/employees']);
            },
            error: (err) => this.showError('Failed to delete employee')
          });
        }
      });
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'Active': return 'primary';
      case 'On-Leave': return 'accent';
      case 'Terminated': return 'warn';
      default: return '';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'Active': return 'check_circle';
      case 'On-Leave': return 'beach_access';
      case 'Terminated': return 'block';
      default: return 'help_outline';
    }
  }

  getEmploymentTypeIcon(type?: string): string {
    switch (type) {
      case 'Full-Time': return 'business_center';
      case 'Part-Time': return 'schedule';
      case 'Contract': return 'description';
      default: return 'work_outline';
    }
  }

  getRandomColor(): string {
    const colors = [
      '#3F51B5', '#673AB7', '#009688', '#FF5722', 
      '#E91E63', '#00BCD4', '#8BC34A', '#795548'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  formatSalary(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  calculateTenure(hireDate?: Date | string): string {
    if (!hireDate) return 'N/A';
    
    const hire = new Date(hireDate);
    const today = new Date();
    const years = today.getFullYear() - hire.getFullYear();
    const months = today.getMonth() - hire.getMonth();
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}