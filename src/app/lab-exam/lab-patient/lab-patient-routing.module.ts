import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LabPatientPage } from './lab-patient.page';

const routes: Routes = [
  {
    path: '',
    component: LabPatientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LabPatientPageRoutingModule {}
