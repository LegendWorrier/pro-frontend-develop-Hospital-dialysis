import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MedicineRecordViewPage } from './medicine-record-view.page';

const routes: Routes = [
  {
    path: '',
    component: MedicineRecordViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedicineRecordViewPageRoutingModule {}
