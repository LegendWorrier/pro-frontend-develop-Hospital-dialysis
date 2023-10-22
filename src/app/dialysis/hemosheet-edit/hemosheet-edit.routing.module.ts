import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HemosheetEditPage } from './hemosheet-edit.page';

const routes: Routes = [
  {
    path: '',
    component: HemosheetEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HemosheetEditPageRoutingModule {}
