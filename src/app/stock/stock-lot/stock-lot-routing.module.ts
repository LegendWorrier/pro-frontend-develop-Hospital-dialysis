import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockLotPage } from './stock-lot.page';

const routes: Routes = [
  {
    path: '',
    component: StockLotPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockLotPageRoutingModule {}
