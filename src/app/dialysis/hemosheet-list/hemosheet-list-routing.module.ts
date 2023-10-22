import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HemosheetListPage } from './hemosheet-list.page';

const routes: Routes = [
  {
    path: '',
    component: HemosheetListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HemosheetListPageRoutingModule {}
