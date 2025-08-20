import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';

import { Employee } from '../../../shared/models';
import { Department } from '../../../shared/models';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeDetailComponent } from '../employee-detail/employee-detail.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  providers: [DatePipe]
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id', 
    'name', 
    'email', 
    'position',
    'department', 
    'hireDate',
    'actions'
  ];
  dataSource = new MatTableDataSource<Employee & { departmentName: string }>();
  isLoading = false;
  
  // Filter controls
  searchControl = new FormControl('');
  departmentFilter = new FormControl('');
  positionFilter = new FormControl('');
  
  // Filter options
  departmentOptions: Department[] = [];
  positionOptions: string[] = [];
  allEmployees: (Employee & { departmentName: string })[] = [];

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();

    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());

    // Department filter changes
    this.departmentFilter.valueChanges.subscribe(() => this.applyFilters());

    // Position filter changes
    this.positionFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEmployees(): void {
    this.isLoading = true;
    
    // Load departments first to get department names
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departmentOptions = departments;
        
        // Then load employees and enrich with department names
        this.employeeService.getEmployees()
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: (employees) => {
              this.allEmployees = employees.map(employee => ({
                ...employee,
                departmentName: this.getDepartmentName(employee.departmentId)
              }));
              
              this.dataSource.data = this.allEmployees;
              this.extractPositionOptions(this.allEmployees);
            },
            error: () => this.showError('Failed to load employees')
          });
      },
      error: () => {
        this.showError('Failed to load departments');
        this.isLoading = false;
      }
    });
  }

  extractPositionOptions(employees: Employee[]): void {
    const positions = employees
      .map(e => e.position)
      .filter((p): p is string => !!p && p.trim() !== '');
    this.positionOptions = [...new Set(positions)].sort();
  }

  applyFilters(): void {
    const searchTerm = this.searchControl.value ? this.searchControl.value.toLowerCase() : '';
    const departmentId = this.departmentFilter.value;
    const position = this.positionFilter.value;

    this.dataSource.data = this.allEmployees.filter(employee => {
      // Search term filter (name only as requested)
      const matchesSearch = !searchTerm || 
        employee.name.toLowerCase().includes(searchTerm);

      // Department filter
      const matchesDepartment = !departmentId || 
        employee.departmentId === parseInt(departmentId);

      // Position filter
      const matchesPosition = !position || 
        (employee.position && employee.position.toLowerCase() === position.toLowerCase());

      return matchesSearch && matchesDepartment && matchesPosition;
    });

    // Reset to first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.departmentFilter.setValue('');
    this.positionFilter.setValue('');
    this.dataSource.data = this.allEmployees;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getDepartmentName(departmentId: number): string {
    if (!this.departmentOptions || !departmentId) {
      return 'Unassigned';
    }
    const department = this.departmentOptions.find(d => d.id === departmentId);
    return department ? department.name : 'Unassigned';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const formattedDate = this.datePipe.transform(date, 'mediumDate');
    return formattedDate ? formattedDate : 'N/A';
  }

  openEmployeeDetail(employee: Employee): void {
    this.dialog.open(EmployeeDetailComponent, {
      width: '500px',
      data: {
        employee: employee,
        departmentName: this.getDepartmentName(employee.departmentId)
      }
    });
  }

  deleteEmployee(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this employee?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.employeeService.deleteEmployee(id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.showSuccess('Employee deleted successfully');
              this.loadEmployees(); // Reload to refresh the list
            },
            error: () => this.showError('Failed to delete employee')
          });
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}