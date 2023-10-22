import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedHistoryPage } from './med-history.page';
import { ScrollHideModule } from 'src/app/directive/scroll-hide.module';
import { MatTableModule } from '@angular/material/table';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AddMedHistoryPageModule } from '../add-med-history/add-med-history.module';
import { EditMedHistoryPageModule } from '../edit-med-history/edit-med-history.module';
import { MedPopoverComponent } from './med-popover/med-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScrollHideModule,
    MatTableModule,
    HeaderThemeModule,
    AddMedHistoryPageModule,
    EditMedHistoryPageModule
  ],
  declarations: [MedHistoryPage, MedPopoverComponent]
})
export class MedHistoryPageModule {}
