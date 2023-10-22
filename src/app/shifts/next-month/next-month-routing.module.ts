import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NextMonthPage } from './next-month.page';

const routes: Routes = [
  {
    path: '',
    component: NextMonthPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NextMonthPageRoutingModule {}
