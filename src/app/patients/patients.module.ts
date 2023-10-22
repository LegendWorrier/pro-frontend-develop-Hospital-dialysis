import { AdsenseModule } from 'ng2-adsense';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientsPage } from './patients.page';

import { PatientsPageRoutingModule } from './patients-routing.module';
import { HeaderModule } from '../share/header/header.module';
import { TagModule } from '../share/components/tag/tag.module';
import { PageLoaderModule } from '../share/components/page-loader/page-loader.module';
import { SegmentTabsModule } from '../share/components/segment-tabs/segment-tabs.module';
import { ScrollHideModule } from '../directive/scroll-hide.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PatientsPageRoutingModule,
    HeaderModule,
    TagModule,
    PageLoaderModule,
    AdsenseModule,
    SegmentTabsModule,
    ScrollHideModule
  ],
  declarations: [PatientsPage]
})
export class PatientsPageModule {}
