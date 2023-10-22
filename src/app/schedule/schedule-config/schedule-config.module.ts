import { LocalDateModule } from '../../directive/local-date.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScheduleSettingPageRoutingModule } from './schedule-config-routing.module';

import { ScheduleConfigPage } from './schedule-config.page';
import { HeaderModule } from 'src/app/share/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScheduleSettingPageRoutingModule,
    HeaderModule,
    LocalDateModule
  ],
  declarations: [ScheduleConfigPage]
})
export class ScheduleSettingPageModule {}
