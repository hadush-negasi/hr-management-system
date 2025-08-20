import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalariesRoutingModule } from './salaries-routing.module';
import { SalaryFormComponent } from './salary-form/salary-form.component';
import { SalaryListComponent } from './salary-list/salary-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';
import { MatProgressBarModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material';
import { SalaryDetailComponent } from './salary-detail/salary-detail.component';


@NgModule({
  declarations: [SalaryFormComponent, SalaryListComponent, SalaryDetailComponent],
  imports: [
    CommonModule,
    SalariesRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    MatPaginatorModule,
    MatProgressBarModule
  ]
})
export class SalariesModule { }
