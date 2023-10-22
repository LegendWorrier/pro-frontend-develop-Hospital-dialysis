import { MedSupplySettingPage } from './med-supply-setting.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { StockableBaseSettingPageModule } from '../stockable-base-setting/stockable-base-setting-module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { MasterdataListModule } from 'src/app/share/components/masterdata-list/masterdata-list.module';

@NgModule({
    declarations: [
        MedSupplySettingPage
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
    exports: [ MedSupplySettingPage ]
})
export class MedSupplySettingPageModule {}
