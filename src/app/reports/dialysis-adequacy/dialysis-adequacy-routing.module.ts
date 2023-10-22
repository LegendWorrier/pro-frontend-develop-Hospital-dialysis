import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialysisAdequacyPage } from './dialysis-adequacy.page';

const routes: Routes = [
  {
    path: '',
    component: DialysisAdequacyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DialysisSummaryPageRoutingModule {}
