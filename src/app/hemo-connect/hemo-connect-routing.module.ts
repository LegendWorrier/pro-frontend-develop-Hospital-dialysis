import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HemoConnectPage } from './hemo-connect.page';

const routes: Routes = [
  {
    path: '',
    component: HemoConnectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HemoConnectPageRoutingModule {}
