import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MasterdataListComponent, TemplatesComponent } from './masterdata-list.component';
import { DataListModule } from './data-list/data-list.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    DataListModule
  ],
  declarations: [
    MasterdataListComponent,
    TemplatesComponent
  ],
  exports: [
    MasterdataListComponent
  ]
})
export class MasterdataListModule {}
