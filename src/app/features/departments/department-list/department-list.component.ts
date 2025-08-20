import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Department } from '../../../shared/models/department.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'location', 'manager', 'budget', 'actions'];
  dataSource = new MatTableDataSource<Department & { managerName: string }>();
  isLoading = false;
  
  // Filter controls
  searchControl = new FormControl('');
  locationFilter = new FormControl('');
  minBudgetControl = new FormControl(null);
  maxBudgetControl = new FormControl(null);
  
  // Filter options
  locationOptions: string[] = [];
  allDepartments: (Department & { managerName: string })[] = [];

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort!: MatSort;

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();

    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());

    // Other filter changes
    this.locationFilter.valueChanges.subscribe(() => this.applyFilters());
    this.minBudgetControl.valueChanges.subscribe(() => this.applyFilters());
    this.maxBudgetControl.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.departmentService.getDepartmentsWithManagers()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (departments) => {
          this.allDepartments = departments;
          this.dataSource.data = departments;
          this.extractLocationOptions(departments);
        },
        error: () => this.showError('Failed to load departments')
      });
  }

  extractLocationOptions(departments: Department[]): void {
    const locations = departments.map(d => d.location).filter(Boolean);
    this.locationOptions = [...new Set(locations)] as string[];
  }

  applyFilters(): void {
    const searchTerm = this.searchControl.value 
      ? this.searchControl.value.toLowerCase() 
      : '';
    const location = this.locationFilter.value;
    const minBudget = this.minBudgetControl.value;
    const maxBudget = this.maxBudgetControl.value;

    this.dataSource.data = this.allDepartments.filter(department => {
      // Search term filter
      const matchesSearch = 
        department.name.toLowerCase().includes(searchTerm) ||
        department.location.toLowerCase().includes(searchTerm) ||
        (department.managerName && department.managerName.toLowerCase().includes(searchTerm)) ||
        department.budget.toString().includes(searchTerm);

      // Location filter
      const matchesLocation = !location || department.location === location;

      // Budget range filter
      const budget = department.budget || 0;
      const matchesMinBudget = !minBudget || budget >= minBudget;
      const matchesMaxBudget = !maxBudget || budget <= maxBudget;

      return matchesSearch && matchesLocation && matchesMinBudget && matchesMaxBudget;
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.locationFilter.setValue('');
    this.minBudgetControl.setValue(null);
    this.maxBudgetControl.setValue(null);
    this.dataSource.data = this.allDepartments;
  }

  deleteDepartment(department: Department): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete ${department.name} department?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.departmentService.deleteDepartment(department.id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.showSuccess('Department deleted successfully');
              this.loadDepartments();
            },
            error: () => this.showError('Failed to delete department')
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

  getBudgetFormatted(budget: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(budget);
  }
}