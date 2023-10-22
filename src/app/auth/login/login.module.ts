import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { A2hsGuideModule } from 'src/app/share/service/a2hs-guide/a2hs-guide.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    A2hsGuideModule
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
