import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HemoReportPage } from './hemo-report.page';

const routes: Routes = [
  {
    path: '',
    component: HemoReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HemoReportPageRoutingModule {}
