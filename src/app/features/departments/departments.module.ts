import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material'; 

import { MaterialModule } from '../../shared/material.module';

import { DepartmentsRoutingModule } from './departments-routing.module';
import { DepartmentListComponent } from './department-list/department-list.component';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { DepartmentDetailComponent } from './department-detail/department-detail.component';


@NgModule({
  declarations: [DepartmentListComponent, DepartmentFormComponent, DepartmentDetailComponent],
  imports: [
    CommonModule,
    DepartmentsRoutingModule,
    MaterialModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatChipsModule
  ],
  entryComponents: [ ConfirmDialogComponent]
})
export class DepartmentsModule { }
