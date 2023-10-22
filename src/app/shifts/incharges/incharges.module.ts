import { ControlHelperModule } from './../../share/components/control-helper/control-helper.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { HeaderModule } from 'src/app/share/header/header.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InchargesPageRoutingModule } from './incharges-routing.module';

import { InchargesPage } from './incharges.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InchargesPageRoutingModule,
    HeaderThemeModule,
    ControlHelperModule
  ],
  declarations: [InchargesPage]
})
export class InchargesPageModule {}
