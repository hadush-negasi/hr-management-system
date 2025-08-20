import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/shared/material.module';
import { MatProgressBarModule } from '@angular/material';
import { MatChipsModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { CandidatesRoutingModule } from './candidates-routing.module';
import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { CandidateFormComponent } from './candidate-form/candidate-form.component';
import { CandidateDetailComponent } from './candidate-detail/candidate-detail.component';
import { HireCandidateComponent } from './hire-candidate/hire-candidate.component';


@NgModule({
  declarations: [CandidateListComponent, CandidateFormComponent, CandidateDetailComponent, HireCandidateComponent],
  imports: [
    CommonModule,
    CandidatesRoutingModule,
    MaterialModule,
    MatProgressBarModule,
    MatChipsModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [ ConfirmDialogComponent ]
})
export class CandidatesModule { }
