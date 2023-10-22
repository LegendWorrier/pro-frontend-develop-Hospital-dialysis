import { PrettyPipe } from './../../../pipes/pretty.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { StockableBaseSettingPageModule } from '../stockable-base-setting/stockable-base-setting-module';
import { DialyzerCustomTemplate, DialyzerDetailPage, DialyzerSettingPage } from './dialyzer-setting.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { MasterdataListModule } from 'src/app/share/components/masterdata-list/masterdata-list.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';

@NgModule({
    declarations: [
        DialyzerSettingPage,
        DialyzerDetailPage,
        DialyzerCustomTemplate
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        StockableBaseSettingPageModule,
        MasterdataListModule,
        AppPipeModule,
        HeaderThemeModule
    ],
    exports: [
        DialyzerSettingPage,
        DialyzerDetailPage
    ]
})
export class DialyzerSettingPageModule {}
