import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalaryFormComponent } from './salary-form/salary-form.component';
import { SalaryListComponent } from './salary-list/salary-list.component';
import { SalaryDetailComponent } from './salary-detail/salary-detail.component';


const routes: Routes = [
  {path: '', component: SalaryListComponent},
  {path: 'new', component: SalaryFormComponent},
  {path: 'view/:id', component: SalaryDetailComponent},
  {path: 'edit/:id', component: SalaryFormComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalariesRoutingModule { }
