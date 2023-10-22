import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialysisPrescriptionEditPage } from './dialysis-prescription-edit.page';

const routes: Routes = [
  {
    path: '',
    component: DialysisPrescriptionEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DialysisPrescriptionEditPageRoutingModule {}
