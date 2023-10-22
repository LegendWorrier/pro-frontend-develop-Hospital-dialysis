import { PanelListModule } from './../../share/components/panel-list/panel-list.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuPageRoutingModule } from './menu-routing.module';

import { MenuPage } from './menu.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { ShareComponentsModule } from 'src/app/share/components/share-components.module';
import { HeaderModule } from 'src/app/share/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    HeaderModule,
    ShareComponentsModule,
    MenuPageRoutingModule,
    PanelListModule
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
