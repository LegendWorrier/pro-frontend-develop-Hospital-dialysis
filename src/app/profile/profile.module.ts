import { PopupStringInputModule } from './../share/components/popup-string-input/popup-string-input.module';
import { ShareComponentsModule } from './../share/components/share-components.module';
import { HeaderThemeModule } from './../directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    HeaderThemeModule,
    ShareComponentsModule,
    PopupStringInputModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
