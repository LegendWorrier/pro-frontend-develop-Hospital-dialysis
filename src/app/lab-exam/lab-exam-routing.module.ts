import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LabExamPage } from './lab-exam.page';

const routes: Routes = [
  {
    path: '',
    component: LabExamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LabExamPageRoutingModule {}
