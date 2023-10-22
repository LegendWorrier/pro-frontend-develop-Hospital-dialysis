import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoryListPageRoutingModule } from './history-list-routing.module';

import { HistoryListPage } from './history-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoryListPageRoutingModule,
    HeaderThemeModule
  ],
  declarations: [HistoryListPage]
})
export class HistoryListPageModule {}
