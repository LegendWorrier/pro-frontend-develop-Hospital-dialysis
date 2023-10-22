import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { MatTableModule } from '@angular/material/table';
import { ScrollHideModule } from './../../directive/scroll-hide.module';
import { HeaderThemeModule } from './../../directive/header-theme.module';
import { HeaderModule } from './../../share/header/header.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatPageRoutingModule } from './stat-routing.module';

import { StatPage } from './stat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatPageRoutingModule,
    HeaderModule,
    HeaderThemeModule,
    ScrollHideModule,
    MatTableModule,
    DatetimeItemWrapperModule
  ],
  declarations: [StatPage]
})
export class StatPageModule {}
