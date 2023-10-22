import { ControlHelperComponent } from './control-helper.component';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderThemeModule,
    ScrollingModule
  ],
  declarations: [
    ControlHelperComponent
  ],
  exports: [
    ControlHelperComponent
  ]
})
export class ControlHelperModule {}
