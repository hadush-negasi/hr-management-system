import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalaryService } from '../../../core/services/salary.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Salary, Employee } from '../../../shared/models';

@Component({
  selector: 'app-salary-form',
  templateUrl: './salary-form.component.html',
  styleUrls: ['./salary-form.component.scss']
})
export class SalaryFormComponent implements OnInit {
  form: FormGroup;
  employee: Employee | null = null;
  isEditMode = false;
  isLoading = false;
  isCalculating = false;

  // Options for form controls
  paymentFrequencies = ['Monthly', 'Bi-Weekly', 'Weekly'];
  adjustmentTypes = ['raise', 'bonus', 'correction'];

  constructor(
    private fb: FormBuilder,
    private salaryService: SalaryService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      id: [null],
      employeeId: [null, Validators.required],
      baseAmount: [0, [Validators.required, Validators.min(0)]],
      bonus: [0, [Validators.min(0)]],
      paymentFrequency: ['Monthly', Validators.required],
      effectiveDate: [new Date(), Validators.required],
      previousSalaryId: [null],
      adjustmentType: [null],
      notes: [''],
      // Calculated fields (readonly)
      grossAmount: [{value: 0, disabled: true}],
      taxDeductions: [{value: 0, disabled: true}],
      netAmount: [{value: 0, disabled: true}]
    });

    // Recalculate when baseAmount or bonus changes
    if (this.form.get('baseAmount')) {
      this.form.get('baseAmount').valueChanges.subscribe(() => this.calculateDerived());
    }
    
    if (this.form.get('bonus')) {
      this.form.get('bonus').valueChanges.subscribe(() => this.calculateDerived());
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const employeeId = this.route.snapshot.queryParamMap.get('employeeId');

    if (id) {
      this.isEditMode = true;
      this.loadSalary(+id);
    } else if (employeeId) {
      this.loadEmployee(+employeeId);
      this.form.patchValue({ employeeId: +employeeId });
      
      // Load previous salary if available
      this.salaryService.getSalariesByEmployee(+employeeId).subscribe({
        next: (salaries) => {
          if (salaries.length > 0) {
            const previousSalary = salaries[0];
            this.form.patchValue({
              previousSalaryId: previousSalary.id,
              baseAmount: previousSalary.baseAmount
            });
          }
        },
        error: () => this.showError('Failed to load previous salary data')
      });
    }
  }

  loadSalary(id: number): void {
    this.isLoading = true;
    this.salaryService.getSalary(id).subscribe({
      next: (salary) => {
        this.form.patchValue(salary);
        this.loadEmployee(salary.employeeId);
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

  calculateDerived(): void {
    if (this.isCalculating) return;
    
    this.isCalculating = true;
    const baseAmount = this.form.get('baseAmount') && this.form.get('baseAmount').value
      ? this.form.get('baseAmount').value
      : 0;
    const bonus = this.form.get('bonus') && this.form.get('bonus')
      ? this.form.get('bonus').value
      :0;
    const grossAmount = baseAmount + bonus;
    const taxDeductions = grossAmount * 0.2; // 20% tax
    const netAmount = grossAmount - taxDeductions;

    this.form.patchValue({
      grossAmount,
      taxDeductions,
      netAmount
    }, { emitEvent: false });

    this.isCalculating = false;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      const salaryData = this.form.getRawValue(); // Include disabled fields

      const operation = this.isEditMode
        ? this.salaryService.updateSalary(salaryData)
        : this.salaryService.addSalary(salaryData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Salary ${this.isEditMode ? 'updated' : 'added'} successfully!`,
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/salaries']);
        },
        error: (err) => {
          this.showError(`Failed to ${this.isEditMode ? 'update' : 'add'} salary record`);
          this.isLoading = false;
        }
      });
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}