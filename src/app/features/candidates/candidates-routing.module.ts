import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CandidateListComponent } from './candidate-list/candidate-list.component';
import { CandidateFormComponent } from './candidate-form/candidate-form.component';
import { CandidateDetailComponent } from './candidate-detail/candidate-detail.component';
import { HireCandidateComponent } from './hire-candidate/hire-candidate.component';

// candidates-routing.module.ts
const routes: Routes = [
  { path: '', component: CandidateListComponent },
  { path: 'new', component: CandidateFormComponent },
  { path: 'edit/:id', component: CandidateFormComponent },
  { path: 'view/:id', component: CandidateDetailComponent }, 
  { path: 'hire/:id', component: HireCandidateComponent } 
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CandidatesRoutingModule { }
