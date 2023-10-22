import { DatetimeItemWrapperModule } from './../../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAvIssuePage } from './edit-av-issue.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';
import { FitHeightModule } from 'src/app/directive/fit-height.module';
import { SelectAsyncListModule } from 'src/app/share/components/select-async-list/select-async-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    FilterListModule,
    SelectAsyncListModule,
    AuditNameModule,
    DatetimeItemWrapperModule
  ],
  declarations: [EditAvIssuePage]
})
export class EditAvIssuePageModule {}
