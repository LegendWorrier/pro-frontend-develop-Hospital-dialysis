import { ModalSearchListModule } from './../share/components/modal-search-list/modal-search-list.module';
import { AdsenseModule } from 'ng2-adsense';
import { AlarmListComponent } from './alarm-list/alarm-list.component';
import { PopupMenuModule } from './../share/components/popup-menu/popup-menu.module';
import { MatButtonModule } from '@angular/material/button';
import { PopupStringInputModule } from './../share/components/popup-string-input/popup-string-input.module';
import { HeaderModule } from 'src/app/share/header/header.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonitorPageRoutingModule } from './monitor-routing.module';

import { MonitorPage } from './monitor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonitorPageRoutingModule,
    HeaderModule,
    PopupStringInputModule,
    PopupMenuModule,
    ModalSearchListModule,
    MatButtonModule,
    AdsenseModule
  ],
  declarations: [MonitorPage, AlarmListComponent]
})
export class MonitorPageModule {}
