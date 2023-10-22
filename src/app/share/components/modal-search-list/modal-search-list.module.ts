import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalSearchListComponent } from './modal-search-list.component';
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
    ModalSearchListComponent
  ],
  exports: [
    ModalSearchListComponent
  ]
})
export class ModalSearchListModule {}
