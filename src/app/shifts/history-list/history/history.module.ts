import { SheetControlModule } from './../../components/sheet-control/sheet-control.module';
import { ControlHelperModule } from './../../../share/components/control-helper/control-helper.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoryPageRoutingModule } from './history-routing.module';

import { HistoryPage } from './history.page';
import { ShiftsTableModule } from '../../components/shifts-table/shifts-table.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoryPageRoutingModule,
    ControlHelperModule,
    SheetControlModule,
    ShiftsTableModule
  ],
  declarations: [HistoryPage]
})
export class HistoryPageModule {}
