import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddLabExamPage } from './add-lab-exam.page';

const routes: Routes = [
  {
    path: '',
    component: AddLabExamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddLabExamPageRoutingModule {}
