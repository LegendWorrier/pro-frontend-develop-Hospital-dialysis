import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LabExamDetailPage } from './lab-exam-detail.page';

const routes: Routes = [
  {
    path: '',
    component: LabExamDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LabExamDetailPageRoutingModule {}
