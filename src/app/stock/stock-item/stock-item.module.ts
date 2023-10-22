import { FilterListModule } from './../../directive/filter-list/filter-list.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockItemPageRoutingModule } from './stock-item-routing.module';

import { StockItemPage } from './stock-item.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { DatetimeItemWrapperModule } from 'src/app/share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { DialyzerSettingPageModule } from 'src/app/setting/masterdata-setting/dialyzer-setting/dialyzer-setting.module';
import { MedicineSettingPageModule } from 'src/app/setting/masterdata-setting/medicine-setting/medicine-setting.module';
import { MedSupplySettingPageModule } from 'src/app/setting/masterdata-setting/med-supply-setting/med-supply-setting.module';
import { EquipmentSettingPageModule } from 'src/app/setting/masterdata-setting/equipment-setting/equipment-setting.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    DatetimeItemWrapperModule,
    StockItemPageRoutingModule,
    DialyzerSettingPageModule,
    MedicineSettingPageModule,
    MedSupplySettingPageModule,
    EquipmentSettingPageModule,
    FilterListModule
  ],
  declarations: [StockItemPage]
})
export class StockItemPageModule {}
