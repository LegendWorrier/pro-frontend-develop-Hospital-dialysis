import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AvShuntViewPage } from './av-shunt-view.page';

const routes: Routes = [
  {
    path: '',
    component: AvShuntViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AvShuntViewPageRoutingModule {}
