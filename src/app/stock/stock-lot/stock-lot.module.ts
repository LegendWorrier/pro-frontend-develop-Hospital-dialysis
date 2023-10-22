import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { ModalSearchListModule } from './../../share/components/modal-search-list/modal-search-list.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockLotPageRoutingModule } from './stock-lot-routing.module';

import { StockLotPage } from './stock-lot.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { MedicineSettingPageModule } from 'src/app/setting/masterdata-setting/medicine-setting/medicine-setting.module';
import { MedSupplySettingPageModule } from 'src/app/setting/masterdata-setting/med-supply-setting/med-supply-setting.module';
import { EquipmentSettingPageModule } from 'src/app/setting/masterdata-setting/equipment-setting/equipment-setting.module';
import { DialyzerSettingPageModule } from 'src/app/setting/masterdata-setting/dialyzer-setting/dialyzer-setting.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    ModalSearchListModule,
    DatetimeItemWrapperModule,
    MedicineSettingPageModule,
    MedSupplySettingPageModule,
    EquipmentSettingPageModule,
    DialyzerSettingPageModule,
    StockLotPageRoutingModule
  ],
  declarations: [StockLotPage]
})
export class StockLotPageModule {}
