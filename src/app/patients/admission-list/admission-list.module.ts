import { OptionListModule } from './../../share/components/options-item/option-list.module';
import { PageLoaderModule } from './../../share/components/page-loader/page-loader.module';
import { HeaderThemeModule } from './../../directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdmissionListPage } from './admission-list.page';
import { EditAdmissionPageModule } from '../edit-admission/edit-admission.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    OptionListModule,
    PageLoaderModule,
    EditAdmissionPageModule
  ],
  declarations: [AdmissionListPage]
})
export class AdmissionListPageModule {}
