import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CandidateService } from '../../../core/services/candidate.service';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { SalaryService } from '../../../core/services/salary.service';
import { Candidate } from '../../../shared/models/candidate.model';
import { Department } from '../../../shared/models/department.model';
import { Employee } from '../../../shared/models/employee.model';
import { Salary } from '../../../shared/models/salary.model';

@Component({
  selector: 'app-hire-candidate',
  templateUrl: './hire-candidate.component.html',
  styleUrls: ['./hire-candidate.component.scss']
})
export class HireCandidateComponent implements OnInit {
  form: FormGroup;
  candidate: Candidate | null = null;
  department: Department | null = null;
  isLoading = false;
  isHiring = false;
  paymentFrequencies = ['Monthly', 'Bi-Weekly', 'Weekly'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private candidateService: CandidateService,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private salaryService: SalaryService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      // Personal Information
      dateOfBirth: [''],
      address: [''],
      
      // Emergency Contact
      emergencyContact: [''],
      emergencyContactPhone: [''],
      
      // Salary Information
      baseAmount: [0, [Validators.required, Validators.min(0)]],
      paymentFrequency: ['Monthly', Validators.required],
      effectiveDate: [new Date(), Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCandidate(+id);
    }
  }

  loadCandidate(id: number): void {
    this.isLoading = true;
    this.candidateService.getCandidate(id).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        if (candidate.appliedDepartmentId) {
          this.loadDepartment(candidate.appliedDepartmentId);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.showError('Failed to load candidate details');
        this.isLoading = false;
        this.router.navigate(['/candidates']);
      }
    });
  }

  loadDepartment(departmentId: number): void {
    this.departmentService.getDepartment(departmentId).subscribe({
      next: (department) => this.department = department,
      error: (err) => console.error('Failed to load department', err)
    });
  }

  onSubmit(): void {
    if (this.form.valid && this.candidate) {
      this.isHiring = true;
      const formValue = this.form.value;

      // Create employee from candidate data + additional form fields
      const employeeData: Omit<Employee, 'id'> = {
        name: this.candidate.name,
        email: this.candidate.email,
        departmentId: this.candidate.appliedDepartmentId || 0,
        position: this.candidate.appliedPosition,
        hireDate: new Date(),
        phoneNumber: this.candidate.phone,
        status: 'Active',
        employmentType: 'Full-Time',
        
        // Additional fields from form
        dateOfBirth: formValue.dateOfBirth,
        address: formValue.address,
        emergencyContact: formValue.emergencyContact,
        emergencyContactPhone: formValue.emergencyContactPhone
      };

      // Create salary data
      const salaryData: Omit<Salary, 'id' | 'grossAmount' | 'taxDeductions' | 'netAmount'> = {
        employeeId: 0, // Will be set after employee creation
        baseAmount: formValue.baseAmount,
        bonus: 0, // No bonus for new employee
        paymentFrequency: formValue.paymentFrequency,
        effectiveDate: formValue.effectiveDate,
        notes: formValue.notes
      };

      this.employeeService.addEmployee(employeeData).subscribe({
        next: (newEmployee) => {
          // Create the salary record
          salaryData.employeeId = newEmployee.id;
          this.salaryService.addSalary(salaryData).subscribe({
            next: () => {
              // Update candidate status to Hired
              this.candidateService.updateCandidateStatus(this.candidate!.id, 'Hired').subscribe({
                next: () => {
                  this.showSuccess(newEmployee);
                  this.router.navigate(['/employees/view', newEmployee.id]);
                },
                error: (err) => {
                  console.error('Failed to update candidate status:', err);
                  this.showSuccess(newEmployee);
                  this.router.navigate(['/employees/view', newEmployee.id]);
                }
              });
            },
            error: (err) => {
              this.showError('Employee created but failed to create salary record');
              this.router.navigate(['/employees']);
            }
          });
        },
        error: (err) => {
          this.showError('Failed to create employee: ' + err.message);
          this.isHiring = false;
        }
      });
    }
  }

  private showSuccess(employee: Employee): void {
    this.snackBar.open(
      `${this.candidate!.name} hired successfully as ${employee.position}!`,
      'Close',
      { duration: 5000, panelClass: ['success-snackbar'] }
    );
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 7000,
      panelClass: ['error-snackbar']
    });
  }
}