import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { FilterListModule } from './../../directive/filter-list/filter-list.module';
import { HeaderThemeModule } from './../../directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddLabExamPageRoutingModule } from './add-lab-exam-routing.module';

import { AddLabExamPage } from './add-lab-exam.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddLabExamPageRoutingModule,
    HeaderThemeModule,
    FilterListModule,
    DatetimeItemWrapperModule
  ],
  declarations: [AddLabExamPage]
})
export class AddLabExamPageModule {}
