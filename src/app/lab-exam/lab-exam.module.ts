import { AdsenseModule } from 'ng2-adsense';
import { PageLoaderModule } from './../share/components/page-loader/page-loader.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LabExamPageRoutingModule } from './lab-exam-routing.module';

import { LabExamPage } from './lab-exam.page';
import { HeaderModule } from '../share/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LabExamPageRoutingModule,
    HeaderModule,
    PageLoaderModule,
    AdsenseModule
  ],
  declarations: [LabExamPage]
})
export class LabExamPageModule {}
