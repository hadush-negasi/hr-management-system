import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CandidateService } from '../../../core/services/candidate.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Candidate } from '../../../shared/models/candidate.model';
import { Department } from '../../../shared/models/department.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-candidate-detail',
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.scss']
})
export class CandidateDetailComponent implements OnInit {
  candidate: Candidate | undefined;
  department: Department | undefined;
  isLoading = true;
  avatarColor: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidateService: CandidateService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.avatarColor = this.getRandomColor(); // Generate color once
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

  onEdit(): void {
    if (this.candidate) {
      this.router.navigate(['/candidates/edit', this.candidate.id]);
    }
  }

  onHire(): void {
    if (this.candidate && this.candidate.status === 'Interviewed') {
      this.router.navigate(['/candidates/hire', this.candidate.id]);
    }
  }

  onDelete(): void {
    if (this.candidate) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete this candidate?',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.candidateService.deleteCandidate(this.candidate!.id).subscribe({
            next: () => {
              this.snackBar.open('Candidate deleted successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/candidates']);
            },
            error: (err) => this.showError('Failed to delete candidate')
          });
        }
      });
    }
  }

  onReject(): void {
    if (this.candidate) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: 'Confirm Rejection',
          message: 'Are you sure you want to reject this candidate?',
          confirmText: 'Reject',
          cancelText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.candidate) {
          this.candidateService.updateCandidateStatus(this.candidate.id, 'Rejected').subscribe({
            next: () => {
              this.snackBar.open('Candidate rejected successfully', 'Close', { duration: 3000 });
              this.loadCandidate(this.candidate!.id); // Refresh the candidate data
            },
            error: (err) => this.showError('Failed to reject candidate')
          });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Hired': return 'primary';
      case 'Interviewed': return 'accent';
      case 'Rejected': return 'warn';
      case 'Applied': return '';
      default: return '';
    }
  }
  getRandomColor(): string {
    const colors = [
      '#3F51B5', '#673AB7', '#009688', '#FF5722', 
      '#E91E63', '#00BCD4', '#8BC34A', '#795548'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Hired': return 'check_circle';
      case 'Interviewed': return 'schedule';
      case 'Rejected': return 'cancel';
      case 'Applied': return 'send';
      default: return 'help_outline';
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}