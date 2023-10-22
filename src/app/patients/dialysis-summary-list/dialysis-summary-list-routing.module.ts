import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DialysisSummaryListPage } from './dialysis-summary-list.page';

const routes: Routes = [
  {
    path: '',
    component: DialysisSummaryListPage
  },
  {
    path: 'hemo-note',
    loadChildren: () => import('./hemo-note/hemo-note.module').then( m => m.HemoNotePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DialysisSummaryListPageRoutingModule {}
