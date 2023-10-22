import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InitPage } from './init.page';

const routes: Routes = [
  {
    path: '',
    component: InitPage
  },
  {
    path: 'setup-guide',
    loadChildren: () => import('../setup-guide/setup-guide.module').then( m => m.SetupGuidePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InitPageRoutingModule {}
