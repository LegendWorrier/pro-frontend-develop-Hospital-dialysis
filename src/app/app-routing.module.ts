import { HemoConnectPageRoutingModule } from './hemo-connect/hemo-connect-routing.module';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthCheck } from './auth/auth.guard';
import { NoAuthCheck } from './auth/noauth.guard';
import { InitCheck } from './init/init.guard';
import { LoadingIntercept } from './loading-intercept';

const routes: Routes = [
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then( m => m.LoginPageModule),
    canMatch: [LoadingIntercept],
    canActivate: [InitCheck],
    canActivateChild: [NoAuthCheck],
    data: { title: 'Login' }
  },
  {
    path: 'welcome',
    loadChildren: () => import('./auth/welcome/welcome.module').then( m => m.WelcomePageModule),
    canActivate: [InitCheck]
  },
  {
    path: 'init',
    loadChildren: () => import('./init/init/init.module').then( m => m.InitPageModule),
    data: { title: 'Init' }
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule),
    canActivate: [InitCheck, AuthCheck],
    data: { title: 'Profile' }
  },
  {
    path: 'loading',
    loadChildren: () => import('./auth/loading/loading.module').then( m => m.LoadingPageModule)
  },
  {
    path: 'hemo-connect',
    loadChildren: () => import('./hemo-connect/hemo-connect.module').then( m => m.HemoConnectPageModule),
    canMatch: [LoadingIntercept],
    canActivate: [InitCheck, AuthCheck]
  },
  {
    path: '',
    loadChildren: () => import('./main/main.module').then(m => m.MainPageModule),
    canMatch: [LoadingIntercept],
    canActivate: [InitCheck, AuthCheck]
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
