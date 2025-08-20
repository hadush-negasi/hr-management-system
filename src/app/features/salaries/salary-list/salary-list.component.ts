import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SalaryService } from '../../../core/services/salary.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Salary } from '../../../shared/models/salary.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Department } from 'src/app/shared/models';

@Component({
  selector: 'app-salary-list',
  templateUrl: './salary-list.component.html',
  styleUrls: ['./salary-list.component.scss']
})
export class SalaryListComponent implements OnInit {
  displayedColumns: string[] = [
    'employee', 
    'position',
    'department',
    'baseAmount',
    'bonus',
    'taxDeductions',
    'netAmount',
    'effectiveDate',
    'actions'
  ];
  
  dataSource = new MatTableDataSource<Salary & { 
    employeeName: string, 
    position: string, 
    departmentName: string,
    departmentId?: number 
  }>();
  
  isLoading = false;
  allSalaries: (Salary & { 
    employeeName: string, 
    position: string, 
    departmentName: string,
    departmentId?: number 
  })[] = [];
  
  // Filter controls
  searchControl = new FormControl('');
  departmentFilter = new FormControl('');
  positionFilter = new FormControl('');
  minSalaryControl = new FormControl(null);
  maxSalaryControl = new FormControl(null);
  
  // Filter options
  departmentOptions: {id: number, name: string}[] = [];
  positionOptions: string[] = [];

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort!: MatSort;

  constructor(
    private salaryService: SalaryService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSalaries();

    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());

    // Other filter changes
    this.departmentFilter.valueChanges.subscribe(() => this.applyFilters());
    this.positionFilter.valueChanges.subscribe(() => this.applyFilters());
    this.minSalaryControl.valueChanges.subscribe(() => this.applyFilters());
    this.maxSalaryControl.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSalaries(): void {
    this.isLoading = true;
    forkJoin([
      this.salaryService.getSalaries(),
      this.employeeService.getEmployees(),
      this.departmentService.getDepartments()
    ]).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ([salaries, employees, departments]) => {
        // Map department options
        this.departmentOptions = departments.map(d => ({ id: d.id, name: d.name }));
        
        // Map position options
        const allPositions = employees.map(e => e.position).filter(Boolean);
        this.positionOptions = [...new Set(allPositions)] as string[];

        // Enrich salary data
        this.allSalaries = salaries.map(salary => {
          const employee = employees.find(e => e.id === salary.employeeId);
          return {
            ...salary,
            employeeName: employee && employee.name? employee.name: 'Unknown',
            position: employee && employee.position? employee.position: '-',
            departmentName: employee && employee.departmentId 
              ? this.getDepartmentName(employee.departmentId, departments) 
              : '-',
            departmentId: employee? employee.departmentId: null
          };
        });

        this.dataSource.data = this.allSalaries;
      },
      error: () => this.showError('Failed to load salary records')
    });
  }

  applyFilters(): void {
    const searchTerm = this.searchControl.value ? this.searchControl.value.toLowerCase() : '';
    const departmentId = this.departmentFilter.value;
    const position = this.positionFilter.value;
    const minSalary = this.minSalaryControl.value;
    const maxSalary = this.maxSalaryControl.value;

    this.dataSource.data = this.allSalaries.filter(salary => {
      // Search term filter
      const matchesSearch = 
        salary.employeeName.toLowerCase().includes(searchTerm) ||
        salary.position.toLowerCase().includes(searchTerm) ||
        salary.departmentName.toLowerCase().includes(searchTerm) ||
        salary.baseAmount.toString().includes(searchTerm);

      // Department filter
      const matchesDepartment = !departmentId || salary.departmentId === departmentId;

      // Position filter
      const matchesPosition = !position || salary.position === position;

      // Salary range filters
      const matchesMinSalary = !minSalary || salary.baseAmount >= minSalary;
      const matchesMaxSalary = !maxSalary || salary.baseAmount <= maxSalary;

      return matchesSearch && matchesDepartment && matchesPosition && 
             matchesMinSalary && matchesMaxSalary;
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.departmentFilter.setValue('');
    this.positionFilter.setValue('');
    this.minSalaryControl.setValue(null);
    this.maxSalaryControl.setValue(null);
    this.dataSource.data = this.allSalaries;
  }

  deleteSalary(salary: Salary): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete salary record for ${this.getEmployeeName(salary.employeeId)}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.salaryService.deleteSalary(salary.id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.showSuccess('Salary record deleted successfully');
              this.loadSalaries();
            },
            error: () => this.showError('Failed to delete salary record')
          });
      }
    });
  }

  private getDepartmentName(departmentId: number, departments: Department[]): string {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unassigned';
  }

  private getEmployeeName(employeeId: number): string {
    const salary = this.allSalaries.find(s => s.employeeId === employeeId);
    return salary && salary.employeeName? salary.employeeName:'employee';
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const formattedDate = new Date(date).toLocaleDateString();
    return formattedDate ? formattedDate : 'N/A';
  }
}