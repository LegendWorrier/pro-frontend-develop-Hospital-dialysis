import { ControlHelperModule } from './../../share/components/control-helper/control-helper.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NextMonthPageRoutingModule } from './next-month-routing.module';

import { NextMonthPage } from './next-month.page';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { SheetControlModule } from '../components/sheet-control/sheet-control.module';
import { ShiftsTableModule } from '../components/shifts-table/shifts-table.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NextMonthPageRoutingModule,
    HeaderThemeModule,
    ControlHelperModule,
    SheetControlModule,
    ShiftsTableModule
  ],
  declarations: [NextMonthPage]
})
export class NextMonthPageModule {}
