import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DraftPanelComponent } from './draft-panel.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    DraftPanelComponent
  ],
  exports: [
    DraftPanelComponent
  ]
})
export class DraftPanelModule {}