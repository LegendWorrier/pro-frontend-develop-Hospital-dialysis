import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MedicinePrescriptionListPage } from './medicine-prescription-list.page';

const routes: Routes = [
  {
    path: '',
    component: MedicinePrescriptionListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedicinePrescriptionListPageRoutingModule {}
