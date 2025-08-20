import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; // <-- Add this import
import { DatePipe } from '@angular/common';

import { MaterialModule } from '../../shared/material.module';
import { MatProgressBarModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material';
import { MatChipsModule } from '@angular/material';

import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';


@NgModule({
  declarations: [
    EmployeeListComponent,
    EmployeeFormComponent,
    EmployeeDetailComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // Required for routerLink
    EmployeesRoutingModule,
    MaterialModule, // This provides all Material components
    MatPaginatorModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatChipsModule
  ],
  providers: [DatePipe],
  entryComponents: [
    ConfirmDialogComponent
  ]
})
export class EmployeesModule { }
