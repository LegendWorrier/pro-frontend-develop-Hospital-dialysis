import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { StockableBaseSettingPageModule } from '../stockable-base-setting/stockable-base-setting-module';
import { MedicineCustomTemplate, MedicineSettingPage } from './medicine-setting.page';
import { MedicineDetailCustomTemplate, MedicineDetailPage } from './medicine-detail/medicine-detail.page';
import { MedicineCategorySettingPage } from '../medicine-category-setting/medicine-category-setting.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { MasterdataListModule } from 'src/app/share/components/masterdata-list/masterdata-list.module';

@NgModule({
    declarations: [
        MedicineSettingPage,
        MedicineDetailPage,
        MedicineCategorySettingPage,
        MedicineCustomTemplate,
        MedicineDetailCustomTemplate,
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
    exports: [
        MedicineSettingPage,
        MedicineDetailPage,
        MedicineCategorySettingPage
    ]
})
export class MedicineSettingPageModule {}
