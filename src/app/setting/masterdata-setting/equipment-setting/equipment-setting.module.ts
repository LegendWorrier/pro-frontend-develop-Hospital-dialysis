import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { StockableBaseSettingPageModule } from '../stockable-base-setting/stockable-base-setting-module';
import { EquipmentSettingPage } from './equipment-setting.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { MasterdataListModule } from 'src/app/share/components/masterdata-list/masterdata-list.module';

@NgModule({
    declarations: [
        EquipmentSettingPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        StockableBaseSettingPageModule,
        MasterdataListModule,
        HeaderThemeModule
    ],
    exports: [ EquipmentSettingPage ]
})
export class EquipmentSettingPageModule {}
