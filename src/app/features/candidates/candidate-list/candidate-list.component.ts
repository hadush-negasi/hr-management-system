import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CandidateService } from '../../../core/services/candidate.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Candidate } from '../../../shared/models/candidate.model';
import { Department } from '../../../shared/models/department.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss']
})
export class CandidateListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'appliedPosition', 'appliedDepartment', 'status', 'applicationDate', 'actions'];
  dataSource = new MatTableDataSource<Candidate>();
  departments: Department[] = [];
  statuses: ('Applied' | 'Interviewed' | 'Hired' | 'Rejected')[] = 
    ['Applied', 'Interviewed', 'Hired', 'Rejected'];
  isLoading = true;
  searchControl = new FormControl('');
  departmentFilter = new FormControl('');
  statusFilter = new FormControl('');

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort!: MatSort;

  constructor(
    private candidateService: CandidateService,
    private departmentService: DepartmentService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();

    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.applySearchFilter(searchTerm || '');
    });

    // Department filter
    this.departmentFilter.valueChanges.subscribe(departmentId => {
      this.applyDepartmentFilter(departmentId);
    });

    // Status filter
    this.statusFilter.valueChanges.subscribe(status => {
      this.applyStatusFilter(status);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.isLoading = true;
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.loadCandidates();
      },
      error: (err) => {
        console.error('Failed to load departments', err);
        this.isLoading = false;
      }
    });
  }

  loadCandidates(): void {
    this.candidateService.getCandidates().subscribe({
      next: (candidates) => {
        this.dataSource.data = candidates;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load candidates', err);
        this.isLoading = false;
      }
    });
  }

  applySearchFilter(filterValue: string): void {
    if (!filterValue) {
      this.loadCandidates();
      return;
    }
    this.isLoading = true;
    this.candidateService.searchCandidates(filterValue).subscribe({
      next: (candidates) => {
        this.dataSource.data = candidates;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search failed', err);
        this.isLoading = false;
      }
    });
  }

  applyDepartmentFilter(departmentId: number | null): void {
    if (!departmentId) {
      this.loadCandidates();
      return;
    }
    this.isLoading = true;
    this.candidateService.getCandidatesByDepartment(departmentId).subscribe({
      next: (candidates) => {
        this.dataSource.data = candidates;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Filter by department failed', err);
        this.isLoading = false;
      }
    });
  }

  applyStatusFilter(status: string | null): void {
    if (!status) {
      this.loadCandidates();
      return;
    }
    this.isLoading = true;
    this.candidateService.getCandidatesByStatus(status).subscribe({
      next: (candidates) => {
        this.dataSource.data = candidates;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Filter by status failed', err);
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.departmentFilter.setValue('');
    this.statusFilter.setValue('');
    this.loadCandidates();
  }
  getDepartmentName(id?: number): string {
    if (!id) return '';
    const department = this.departments.find(d => d.id === id);
    return department ? department.name : '';
  }

  updateStatus(candidate: Candidate, newStatus: 'Applied' | 'Interviewed' | 'Hired' | 'Rejected'): void {
    this.candidateService.updateCandidateStatus(candidate.id, newStatus).subscribe({
      next: () => {
        this.loadCandidates();
      },
      error: (err) => {
        console.error('Failed to update candidate status', err);
      }
    });
  }

  viewCandidate(id: number): void {
    this.router.navigate(['/candidates/view', id]);
  }

  editCandidate(id: number): void {
    this.router.navigate(['/candidates/edit', id]);
  }

  deleteCandidate(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this candidate?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.candidateService.deleteCandidate(id).subscribe({
          next: () => {
            this.loadCandidates();
          },
          error: (err) => {
            console.error('Failed to delete candidate', err);
          }
        });
      }
    });
  }

  hireCandidate(candidate: Candidate): void {
    if (candidate.status === 'Interviewed') {
      this.router.navigate(['/candidates/hire', candidate.id]);
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Hired': return 'primary';
      case 'Interviewed': return 'accent';
      case 'Rejected': return 'warn';
      default: return '';
    }
  }
  
}