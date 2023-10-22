import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InchargesPage } from './incharges.page';

const routes: Routes = [
  {
    path: '',
    component: InchargesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InchargesPageRoutingModule {}
