import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockItemPage } from './stock-item.page';

const routes: Routes = [
  {
    path: '',
    component: StockItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockItemPageRoutingModule {}
