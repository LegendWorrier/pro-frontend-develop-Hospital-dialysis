import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HemosheetListPageRoutingModule } from './hemosheet-list-routing.module';

import { HemosheetListPage } from './hemosheet-list.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { OptionListModule } from 'src/app/share/components/options-item/option-list.module';
import { HemosheetViewPageModule } from '../hemosheet-view/hemosheet-view.module';
import { PageLoaderModule } from 'src/app/share/components/page-loader/page-loader.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HemosheetListPageRoutingModule,
    HeaderThemeModule,
    OptionListModule,
    HemosheetViewPageModule,
    PageLoaderModule
  ],
  declarations: [HemosheetListPage]
})
export class HemosheetListPageModule {}
