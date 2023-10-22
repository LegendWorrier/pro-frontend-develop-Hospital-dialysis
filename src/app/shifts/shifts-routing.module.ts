import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShiftsPage } from './shifts.page';

const routes: Routes = [
  {
    path: '',
    component: ShiftsPage,
  },  {
    path: 'incharges',
    loadChildren: () => import('./incharges/incharges.module').then( m => m.InchargesPageModule)
  },
  {
    path: 'next-month',
    loadChildren: () => import('./next-month/next-month.module').then( m => m.NextMonthPageModule)
  },
  {
    path: 'history-list',
    loadChildren: () => import('./history-list/history-list.module').then( m => m.HistoryListPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShiftsPageRoutingModule {}
