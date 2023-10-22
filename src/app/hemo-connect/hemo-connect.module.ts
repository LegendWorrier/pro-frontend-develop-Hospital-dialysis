import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HemoConnectPageRoutingModule } from './hemo-connect-routing.module';

import { HemoConnectPage } from './hemo-connect.page';
import { HeaderModule } from '../share/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    HemoConnectPageRoutingModule
  ],
  declarations: [HemoConnectPage]
})
export class HemoConnectPageModule {}
