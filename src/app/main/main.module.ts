import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';
import { SettingPageModule } from '../setting/setting.module';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterLinkEventModule } from '../directive/router-link-event.module';
import { MenuHeaderComponent } from '../share/components/menu-header/menu-header.component';
import { HeaderThemeModule } from '../directive/header-theme.module';
import { ItemLinkModule } from '../share/components/item-link/item-link.module';
import { A2hsGuideModule } from '../share/service/a2hs-guide/a2hs-guide.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MainPageRoutingModule,
    SettingPageModule,
    RouterLinkEventModule,
    MatNativeDateModule,
    HeaderThemeModule,
    ItemLinkModule,
    A2hsGuideModule
  ],
  declarations: [MainPage, MenuHeaderComponent]
})
export class MainPageModule {}
