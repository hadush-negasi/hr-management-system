import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Department } from '../../../shared/models/department.model';
import { Employee } from '../../../shared/models/employee.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent implements OnInit {
  form: FormGroup;
  managers: Employee[] = [];
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      location: ['', [Validators.required, Validators.maxLength(50)]],
      budget: [0, [Validators.min(0), Validators.max(10000000)]],
      managerId: [null],
      description: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.loadManagers();
    this.loadDepartmentIfEditing();
  }

  private loadManagers(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.managers = employees;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Failed to load managers');
      }
    });
  }

  private loadDepartmentIfEditing(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.isLoading = true;
      this.departmentService.getDepartment(+id).subscribe({
        next: (department) => {
          this.form.patchValue(department);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.showError('Failed to load department details');
          this.router.navigate(['/departments']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const department: Department = this.form.value;

    const operation = this.isEditMode
      ? this.departmentService.updateDepartment(department)
      : this.departmentService.addDepartment(department);

    operation.subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess(
          `Department ${this.isEditMode ? 'updated' : 'created'} successfully`
        );
        this.router.navigate(['/departments']);
      },
      error: () => {
        this.isLoading = false;
        this.showError(
          `Failed to ${this.isEditMode ? 'update' : 'create'} department`
        );
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

  get name() {
    return this.form.get('name');
  }

  get location() {
    return this.form.get('location');
  }

  get budget() {
    return this.form.get('budget');
  }

  get description() {
    return this.form.get('description');
  }
}