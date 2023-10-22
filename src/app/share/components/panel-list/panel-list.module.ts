import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PanelListComponent } from './panel-list.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    PanelListComponent
  ],
  exports: [
    PanelListComponent
  ]
})
export class PanelListModule {}