import { DatetimeItemWrapperModule } from './../../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAvShuntPage } from './edit-av-shunt.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AvShuntComponent } from '../../components/av-shunt/av-shunt.component';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';
import { FitHeightModule } from 'src/app/directive/fit-height.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    FilterListModule,
    FitHeightModule,
    AuditNameModule,
    DatetimeItemWrapperModule
  ],
  declarations: [EditAvShuntPage, AvShuntComponent]
})
export class EditAvShuntPageModule {}
