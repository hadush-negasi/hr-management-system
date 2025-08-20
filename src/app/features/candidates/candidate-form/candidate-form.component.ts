// candidate-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CandidateService } from '../../../core/services/candidate.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Candidate } from '../../../shared/models/candidate.model';
import { Department } from '../../../shared/models/department.model';

@Component({
  selector: 'app-candidate-form',
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss']
})
export class CandidateFormComponent implements OnInit {
  form: FormGroup;
  departments: Department[] = [];
  isEditMode = false;
  isLoading = false;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      appliedPosition: ['', Validators.required],
      appliedDepartmentId: [null, Validators.required],
      resume: [''],
      status: ['Applied'],
      applicationDate: [new Date().toISOString(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadCandidate(+id);
    }
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => this.departments = departments,
      error: (err) => this.showError('Failed to load departments')
    });
  }

  loadCandidate(id: number): void {
    this.isLoading = true;
    this.candidateService.getCandidate(id).subscribe({
      next: (candidate) => {
        this.form.patchValue({
          ...candidate,
          applicationDate: candidate.applicationDate || new Date().toISOString()
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.showError('Failed to load candidate');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      const candidate = this.form.value;

      const operation = this.isEditMode
        ? this.candidateService.updateCandidate(candidate)
        : this.candidateService.addCandidate(candidate);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Candidate ${this.isEditMode ? 'updated' : 'added'} successfully!`,
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/candidates']);
        },
        error: (err) => {
          this.showError(`Failed to ${this.isEditMode ? 'update' : 'add'} candidate`);
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