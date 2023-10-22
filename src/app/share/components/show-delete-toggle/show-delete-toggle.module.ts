import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShowDeleteToggleComponent } from './show-delete-toggle.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    ShowDeleteToggleComponent
  ],
  exports: [
    ShowDeleteToggleComponent
  ]
})
export class ShowDeleteToggleModule {}